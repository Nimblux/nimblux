"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-2xl overflow-hidden">
        {/* Left Side: Brand Story */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-charcoal-900 via-charcoal-card to-charcoal-950 border-b lg:border-b-0 lg:border-r border-charcoal-cardBorder flex flex-col justify-between">
          <div>
            <NimbluxLogo size="md" showTagline={false} href="/" />
            <div className="mt-8 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-bronze-500/10 text-bronze-300 text-[10.5px] font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Member Portal</span>
              </div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100 leading-snug">
                Opportunities that shape your future.
              </h2>
              <p className="text-xs text-ivory-500 leading-relaxed">
                Sign in to manage opportunity submissions, monitor status reviews, and access your saved bookmarks.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-charcoal-cardBorder/60 mt-8 space-y-2">
            <div className="flex items-center space-x-2 text-xs text-ivory-400">
              <ShieldCheck className="w-4 h-4 text-forest-400" />
              <span>Verified student & recruiter access</span>
            </div>
            <div className="text-[11px] font-mono text-ivory-500">
              Technology • Innovation • Community
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="font-sans font-bold text-xl text-ivory-100">
              Welcome back
            </h3>
            <p className="text-xs text-ivory-500 mt-1">
              Enter your credentials to access your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ivory-300 block mb-1.5 font-mono">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-ivory-300 font-mono">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-bronze-400 hover:text-bronze-300 font-mono"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory-500 hover:text-ivory-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50 transition-all"
            >
              <span>{loading ? "Signing in..." : "Sign In to NIMBLUX"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-charcoal-cardBorder text-center text-xs text-ivory-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-bronze-400 hover:text-bronze-300 font-semibold">
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
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
