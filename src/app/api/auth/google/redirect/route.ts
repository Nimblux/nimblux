import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    // If Google Client ID is not configured in environment variables, redirect back with error notice
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Google Sign-In is not configured yet. Please configure GOOGLE_CLIENT_ID in .env."
        )}`,
        req.url
      )
    );
  }

  // Determine origin and redirect URI
  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");

  let redirectUri: string;
  if (process.env.GOOGLE_REDIRECT_URI) {
    redirectUri = process.env.GOOGLE_REDIRECT_URI;
  } else if (host.includes("localhost") || host.includes("127.0.0.1")) {
    redirectUri = `${proto}://${host}/api/auth/google/callback`;
  } else {
    const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://nimblux.xyz";
    redirectUri = `${configuredOrigin}/api/auth/google/callback`;
  }

  const state = Buffer.from(
    JSON.stringify({
      redirect: redirectTarget,
      redirectUri,
      timestamp: Date.now(),
    })
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
