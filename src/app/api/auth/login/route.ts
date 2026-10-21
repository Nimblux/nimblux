import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signJwt, AUTH_COOKIE_NAME } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import {
  generateSecureOtp,
  getClientIp,
  checkOtpSendRateLimits,
  issueOtpRecord,
} from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Your account has been suspended. Contact support@nimblux.xyz." },
        { status: 403 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account was signed up using Google. Please click 'Continue with Google' to sign in." },
        { status: 400 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check if account email is verified
    const isUnverified = user.status === "PENDING_VERIFICATION" || (!user.emailVerified && user.status !== "ACTIVE");

    if (isUnverified) {
      const clientIp = getClientIp(req.headers);
      const userAgent = req.headers.get("user-agent") || undefined;

      // Check rate limits before sending code
      const rateLimit = await checkOtpSendRateLimits(normalizedEmail, clientIp);

      if (rateLimit.allowed) {
        const otp = generateSecureOtp();
        await issueOtpRecord({
          normalizedEmail,
          otp,
          clientIp,
          userAgent,
        });

        await sendOtpEmail({
          to: normalizedEmail,
          otp,
          name: user.name,
        });
      }

      return NextResponse.json(
        {
          success: false,
          requiresVerification: true,
          email: normalizedEmail,
          message: "Your email address is not verified yet. A 6-digit verification code has been sent to your email.",
        },
        { status: 200 }
      );
    }

    // If active user was created prior to emailVerified field addition, auto-heal status
    if (user.status === "ACTIVE" && !user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }).catch(() => {});
    }

    const token = signJwt({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        status: user.status,
        emailVerified: true,
        phone: user.phone,
        college: user.college,
        degree: user.degree,
        graduationYear: user.graduationYear,
        skills: user.skills,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        portfolioUrl: user.portfolioUrl,
        location: user.location,
      },
    });

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
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
