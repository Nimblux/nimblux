import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    // If Google Client ID is not configured in .env, redirect back with error notice
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Google Sign-In is not configured yet. Please configure GOOGLE_CLIENT_ID in .env."
        )}`,
        req.url
      )
    );
  }

  // Determine origin
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    req.nextUrl.origin ||
    "https://www.nimblux.xyz";

  const redirectUri = `${origin}/api/auth/google/callback`;

  const state = Buffer.from(
    JSON.stringify({ redirect: redirectTarget, timestamp: Date.now() })
  ).toString("base64");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
