"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";

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
          <Link href="/login" className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium mb-4">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to login</span>
          </Link>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-slate-900/40 shadow-2xl">
          {sent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Link Sent</h3>
              <p className="text-xs text-slate-400">
                If an account exists for <span className="text-white">{email}</span>, you will receive a reset link shortly.
              </p>
              <div className="pt-2">
                <Link
                  href="/reset-password?token=demo-token"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Proceed to Reset Password (Demo) →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Your Account Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-brand-500 hover:from-indigo-500 hover:to-brand-400 shadow-xl shadow-indigo-600/30 glow-button transition-all"
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
