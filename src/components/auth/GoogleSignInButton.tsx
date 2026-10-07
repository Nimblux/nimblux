"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface GoogleSignInButtonProps {
  redirectUrl?: string;
  className?: string;
  onError?: (err: string) => void;
}

export default function GoogleSignInButton({
  redirectUrl = "/dashboard",
  className = "",
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Check if client-side GIS is available
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (clientId && typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                const res = await fetch("/api/auth/google", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    credential: response.credential,
                    redirectUrl,
                  }),
                });

                const data = await res.json();
                if (!res.ok) {
                  throw new Error(data.error || "Unable to sign in with Google.");
                }

                router.push(redirectUrl);
                router.refresh();
              } catch (err: any) {
                const msg = err.message || "Unable to sign in with Google. Please try again.";
                setErrorMessage(msg);
                if (onError) onError(msg);
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          },
        });

        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fall back to server redirect
            window.location.href = `/api/auth/google/redirect?redirect=${encodeURIComponent(
              redirectUrl
            )}`;
          }
        });
        return;
      }

      // Default: Redirect to Google OAuth authorization endpoint
      window.location.href = `/api/auth/google/redirect?redirect=${encodeURIComponent(
        redirectUrl
      )}`;
    } catch (err: any) {
      const msg = "Unable to sign in with Google. Please try again.";
      setErrorMessage(msg);
      if (onError) onError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-[10px] bg-[#0E1110] hover:bg-[#151A18] text-[#F5F1E8] border border-white/[0.12] hover:border-white/[0.22] font-medium text-xs shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed group ${className}`}
        aria-label="Continue with Google"
      >
        {loading ? (
          <div className="w-4 h-4 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="font-semibold tracking-wide">
          {loading ? "Connecting to Google..." : "Continue with Google"}
        </span>
      </button>

      {errorMessage && (
        <p className="text-[11px] text-rose-400 text-center font-mono">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
