"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    degree: "",
    graduationYear: "2026",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      router.push(redirect);
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
                <span>Builder Community</span>
              </div>
              <h2 className="text-2xl font-[700] text-[#F5F1E8] leading-snug tracking-tight">
                Create your student & builder profile.
              </h2>
              <p className="text-xs text-[#A9AAA5] leading-relaxed">
                Join thousands of students applying to vetted internships, competing in global hackathons, and earning verifiable credentials.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.06] mt-8 space-y-2">
            <div className="flex items-center space-x-2 text-xs text-[#A9AAA5]">
              <ShieldCheck className="w-4 h-4 text-[#8FA58E]" />
              <span>100% Free Forever for Students</span>
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
              Create an Account
            </h3>
            <p className="text-xs text-[#A9AAA5] mt-1">
              Takes less than 60 seconds. Start applying instantly.
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

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5] block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Aarav Sharma"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5] block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="aarav@university.edu"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5] block mb-1">
                Password * (min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E807B] hover:text-[#F5F1E8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5] block mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="IIT, BITS, etc."
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5] block mb-1">
                  Graduation Year
                </label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 cursor-pointer"
                >
                  <option value="2025" className="bg-[#111615]">2025</option>
                  <option value="2026" className="bg-[#111615]">2026</option>
                  <option value="2027" className="bg-[#111615]">2027</option>
                  <option value="2028" className="bg-[#111615]">2028</option>
                  <option value="2029" className="bg-[#111615]">2029+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5] block mb-1">
                Degree / Major
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="B.Tech Computer Science"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm disabled:opacity-50 transition-all"
            >
              <span>{loading ? "Creating Account..." : "Join NIMBLUX Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-[#7E807B]">
            Already have an account?{" "}
            <Link
              href={`/login${redirect !== "/dashboard" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
              className="text-[#D8B77A] hover:text-[#E7D5B2] font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
