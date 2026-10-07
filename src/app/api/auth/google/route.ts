import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwt, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { credential, redirectUrl } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { error: "Google credential token is required." },
        { status: 400 }
      );
    }

    // Verify token with Google's public token verification API
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      { cache: "no-store" }
    );

    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      return NextResponse.json(
        { error: "Invalid Google credential token. Please try again." },
        { status: 401 }
      );
    }

    const payload = await verifyRes.json();
    const { sub: googleId, email, email_verified, name, picture } = payload;

    if (!email) {
      return NextResponse.json(
        { error: "No email address found in Google account." },
        { status: 400 }
      );
    }

    const isVerified = email_verified === true || email_verified === "true";
    if (!isVerified) {
      return NextResponse.json(
        { error: "Google account email is not verified. Please verify your email with Google." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists by email or googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { googleId }],
      },
    });

    let isNewUser = false;

    if (user) {
      // Existing user: Link Google ID and update profile image if empty
      if (user.status === "SUSPENDED") {
        return NextResponse.json(
          { error: "Your account has been suspended. Please contact support@nimblux.com." },
          { status: 403 }
        );
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          authProvider: user.googleId ? user.authProvider : (user.authProvider === "credentials" ? "both" : "google"),
          profileImage: user.profileImage || picture || null,
        },
      });
    } else {
      // New user: Create NIMBLUX account
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          name: name || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          googleId,
          authProvider: "google",
          profileImage: picture || null,
          role: "USER",
          status: "ACTIVE",
        },
      });

      // Send welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to NIMBLUX! 🎉",
          message: "Your account has been created via Google. Start discovering internships, hackathons, and certifications.",
          type: "SYSTEM",
          link: "/opportunities",
        },
      });
    }

    // Issue standard NIMBLUX JWT
    const token = signJwt({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      isNew: isNewUser,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        authProvider: user.authProvider,
      },
    });

    // Set standard NIMBLUX session cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process Google sign-in." },
      { status: 500 }
    );
  }
}
