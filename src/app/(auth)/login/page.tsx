"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(urlError || "");

  React.useEffect(() => {
    if (urlError) setError(urlError);
  }, [urlError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in.");
      }

      if (data.user.role === "ADMIN" && redirect === "/dashboard") {
        router.push("/admin");
      } else {
        router.push(redirect);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-[18px] bg-[#111615] border border-white/[0.08] shadow-2xl overflow-hidden">
        {/* Left Side: Brand Story */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-[#0E1110] via-[#111615] to-[#090B0B] border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col justify-between">
          <div>
            <NimbluxLogo size="md" showTagline={false} href="/" />
            <div className="mt-8 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] bg-[#D8B77A]/10 text-[#D8B77A] text-[10.5px] font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Member Portal</span>
              </div>
              <h2 className="text-2xl font-[700] text-[#F5F1E8] leading-snug tracking-tight">
                Opportunities that shape your future.
              </h2>
              <p className="text-xs text-[#A9AAA5] leading-relaxed">
                Sign in to manage applications, event registrations, and access your verified certificates.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] mt-8 space-y-2">
            <div className="flex items-center space-x-2 text-xs text-[#A9AAA5]">
              <ShieldCheck className="w-4 h-4 text-[#8FA58E]" />
              <span>Verified student & builder access</span>
            </div>
            <div className="text-[11px] font-mono text-[#7E807B]">
              Technology • Innovation • Community
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="font-bold text-xl text-[#F5F1E8] tracking-tight">
              Welcome back
            </h3>
            <p className="text-xs text-[#A9AAA5] mt-1">
              Enter your credentials to access your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[9px] bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <div className="mb-5 space-y-4">
            <GoogleSignInButton redirectUrl={redirect} onError={(msg) => setError(msg)} />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#111615] px-3 text-[10.5px] font-mono text-[#7E807B] uppercase tracking-wider">
                OR
              </span>
              <div className="border-t border-white/[0.08] w-full" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#D8B77A] hover:text-[#E7D5B2] font-mono"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E807B] hover:text-[#F5F1E8]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm disabled:opacity-50 transition-all"
            >
              <span>{loading ? "Signing in..." : "Sign In to NIMBLUX"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-[#7E807B]">
            Don't have an account?{" "}
            <Link
              href={`/register${redirect !== "/dashboard" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="text-[#D8B77A] hover:text-[#E7D5B2] font-semibold"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
