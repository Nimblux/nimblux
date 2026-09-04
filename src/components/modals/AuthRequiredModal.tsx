"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Lock,
  Mail,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  actionName?: string;
  redirectUrl?: string;
  onAuthenticated: (user: any) => void;
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = "Please sign in to continue.",
  subtitle,
  actionName = "participate in this opportunity",
  redirectUrl,
  onAuthenticated,
}: AuthRequiredModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCollege, setRegCollege] = useState("");
  const [regDegree, setRegDegree] = useState("");
  const [regGradYear, setRegGradYear] = useState("2026");

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in.");
      }

      onAuthenticated(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          college: regCollege,
          degree: regDegree,
          graduationYear: regGradYear,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      onAuthenticated(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#090B0B]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-[18px] bg-[#111615] border border-white/[0.08] shadow-2xl p-6 sm:p-8 z-10 animate-fade-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-[8px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.05] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand & Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] bg-[#D8B77A]/10 text-[#D8B77A] text-[11px] font-mono font-medium">
            <Lock className="w-3 h-3" />
            <span>AUTHENTICATION REQUIRED</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-[700] text-[#F5F1E8] tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-[#A9AAA5] mt-1.5 leading-relaxed">
              {subtitle || `Sign in or create your account to ${actionName}. Your progress will not be lost.`}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-[10px] bg-[#090B0B] border border-white/[0.06] mb-5">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
              tab === "login"
                ? "bg-[#151A18] text-[#F5F1E8] shadow-sm"
                : "text-[#A9AAA5] hover:text-[#F5F1E8]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError("");
            }}
            className={`py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
              tab === "register"
                ? "bg-[#151A18] text-[#F5F1E8] shadow-sm"
                : "text-[#A9AAA5] hover:text-[#F5F1E8]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-[9px] bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs leading-relaxed">
            {error}
          </div>
        )}

        {/* Login Form */}
        {tab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono text-[#A9AAA5] mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E807B]" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your.name@university.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A9AAA5] mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E807B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E807B] hover:text-[#F5F1E8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#090B0B] border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Sign In & Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-[#A9AAA5] mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E807B]" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full pl-10 pr-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A9AAA5] mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E807B]" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your.name@university.edu"
                  className="w-full pl-10 pr-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#A9AAA5] mb-1 uppercase tracking-wider">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E807B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E807B] hover:text-[#F5F1E8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10.5px] font-mono text-[#A9AAA5] mb-1 uppercase tracking-wider">
                  College / Org
                </label>
                <input
                  type="text"
                  value={regCollege}
                  onChange={(e) => setRegCollege(e.target.value)}
                  placeholder="IIT, BITS, etc."
                  className="w-full px-3 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono text-[#A9AAA5] mb-1 uppercase tracking-wider">
                  Degree / Year
                </label>
                <input
                  type="text"
                  value={regDegree}
                  onChange={(e) => setRegDegree(e.target.value)}
                  placeholder="B.Tech, 2026"
                  className="w-full px-3 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#090B0B] border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link to full pages */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
          {redirectUrl ? (
            <Link
              href={redirectUrl}
              className="text-[11px] text-[#A9AAA5] hover:text-[#D8B77A] transition-colors inline-flex items-center space-x-1"
            >
              <span>Or open full sign in page</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          ) : (
            <p className="text-[11px] text-[#7E807B]">
              By continuing, you agree to NIMBLUX's Terms of Service and Privacy Policy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
