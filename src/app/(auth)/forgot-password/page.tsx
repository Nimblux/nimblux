"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <NimbluxLogo size="md" href="/" />
          </div>
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 text-xs text-ivory-500 hover:text-bronze-300 font-mono mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
          <h2 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            Reset Password
          </h2>
          <p className="mt-1 text-xs text-ivory-500">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        <div className="rounded-3xl bg-charcoal-card p-6 sm:p-8 border border-charcoal-cardBorder shadow-2xl">
          {sent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-forest-500/20 text-forest-300 flex items-center justify-center mx-auto border border-forest-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-ivory-100">Reset Link Sent</h3>
              <p className="text-xs text-ivory-500">
                If an account exists for <span className="text-ivory-200">{email}</span>, you will receive a reset link shortly.
              </p>
              <div className="pt-2">
                <Link
                  href="/reset-password?token=demo-token"
                  className="text-xs text-bronze-400 hover:text-bronze-300 font-mono"
                >
                  Proceed to Reset Password (Demo) →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ivory-300 block mb-1.5 font-mono">
                  Your Account Email
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
              >
                <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
