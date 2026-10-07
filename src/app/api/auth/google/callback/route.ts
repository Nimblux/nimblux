import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwt, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  let redirectTarget = "/dashboard";
  let redirectUriFromState: string | null = null;

  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
      if (decoded.redirect) redirectTarget = decoded.redirect;
      if (decoded.redirectUri) redirectUriFromState = decoded.redirectUri;
    } catch {}
  }

  if (error || !code) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          error || "Google authorization failed or was canceled."
        )}`,
        req.url
      )
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Google client credentials not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        )}`,
        req.url
      )
    );
  }

  // Determine redirect URI: Must match the redirect_uri used in the initial request exactly
  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");

  const fallbackRedirectUri = host.includes("localhost") || host.includes("127.0.0.1")
    ? `${proto}://${host}/api/auth/google/callback`
    : `${(process.env.NEXT_PUBLIC_APP_URL || "https://nimblux.xyz").replace(/\/$/, "")}/api/auth/google/callback`;

  const redirectUri = redirectUriFromState || process.env.GOOGLE_REDIRECT_URI || fallbackRedirectUri;

  try {
    // Exchange authorization code for token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            "Failed to exchange Google authorization code. Please try again."
          )}`,
          req.url
        )
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google UserInfo endpoint
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Failed to retrieve Google user profile.")}`,
          req.url
        )
      );
    }

    const googleUser = await userRes.json();
    const { sub: googleId, email, email_verified, name, picture } = googleUser;

    if (!email) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Google account did not provide an email address.")}`,
          req.url
        )
      );
    }

    const isVerified = email_verified === true || email_verified === "true";
    if (!isVerified) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Google account email is not verified. Please verify your email with Google.")}`,
          req.url
        )
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find existing user by verified email or googleId to prevent duplicate accounts
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { googleId }],
      },
    });

    if (user) {
      // Existing NIMBLUX account: link Google credentials
      if (user.status === "SUSPENDED") {
        return NextResponse.redirect(
          new URL(
            `/login?error=${encodeURIComponent("Your account has been suspended.")}`,
            req.url
          )
        );
      }

      const currentProvider = user.authProvider || "credentials";
      const newProvider = user.googleId
        ? currentProvider
        : currentProvider === "credentials"
        ? "both"
        : "google";

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          authProvider: newProvider,
          profileImage: user.profileImage || user.profileImageUrl || picture || null,
          profileImageUrl: user.profileImageUrl || user.profileImage || picture || null,
        },
      });
    } else {
      // New user: Create NIMBLUX account
      user = await prisma.user.create({
        data: {
          name: name || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          googleId,
          authProvider: "google",
          profileImage: picture || null,
          profileImageUrl: picture || null,
          role: "USER",
          status: "ACTIVE",
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to NIMBLUX! 🎉",
          message: "Your account is active via Google. Start exploring opportunities, hackathons, and credentials.",
          type: "SYSTEM",
          link: "/opportunities",
        },
      });
    }

    // Issue standard NIMBLUX JWT cookie session
    const token = signJwt({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const destination = user.role === "ADMIN" && redirectTarget === "/dashboard"
      ? "/admin"
      : redirectTarget;

    const response = NextResponse.redirect(new URL(destination, req.url));

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Unexpected error during Google sign-in. Please try again.")}`,
        req.url
      )
    );
  }
}
