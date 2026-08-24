"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";

export default function RegisterPage() {
  const router = useRouter();
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

      router.push("/dashboard");
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
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-forest-500/10 text-forest-300 text-[10.5px] font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Student Community</span>
              </div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100 leading-snug">
                Join the modern tech opportunity network.
              </h2>
              <p className="text-xs text-ivory-500 leading-relaxed">
                Connect with verified internships, developer hackathons, scholarships, and campus programs worldwide.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-charcoal-cardBorder/60 mt-8 space-y-2">
            <div className="flex items-center space-x-2 text-xs text-ivory-400">
              <ShieldCheck className="w-4 h-4 text-forest-400" />
              <span>100% Free Forever for Students</span>
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
              Create student account
            </h3>
            <p className="text-xs text-ivory-500 mt-1">
              Start submitting and tracking verified opportunities.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Rivera"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                Student Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@university.edu"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                Password * (min 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory-500 hover:text-ivory-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                  College / University
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="Stanford University"
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                  Graduation Year
                </label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
                >
                  <option value="2025" className="bg-charcoal-900">2025</option>
                  <option value="2026" className="bg-charcoal-900">2026</option>
                  <option value="2027" className="bg-charcoal-900">2027</option>
                  <option value="2028" className="bg-charcoal-900">2028</option>
                  <option value="2029" className="bg-charcoal-900">2029+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ivory-300 block mb-1 font-mono">
                Degree / Major
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="B.S. Computer Science"
                className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50 transition-all"
            >
              <span>{loading ? "Creating Account..." : "Join NIMBLUX Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-charcoal-cardBorder text-center text-xs text-ivory-500">
            Already have an account?{" "}
            <Link href="/login" className="text-bronze-400 hover:text-bronze-300 font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
