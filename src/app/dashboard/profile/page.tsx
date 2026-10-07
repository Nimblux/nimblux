"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Save,
  CheckCircle2,
  Github,
  Linkedin,
  MapPin,
  GraduationCap,
  Sparkles,
  Trash2,
  ShieldCheck,
  Link as LinkIcon,
} from "lucide-react";
import ImageUpload from "@/components/common/ImageUpload";
import UserAvatar from "@/components/common/UserAvatar";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    degree: "",
    skills: "",
    graduationYear: "",
    location: "",
    bio: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    phone: "",
    profileImage: "",
    googleId: null as string | null,
    authProvider: "credentials",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = () => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            college: data.user.college || "",
            degree: data.user.degree || "",
            skills: data.user.skills || "",
            graduationYear: data.user.graduationYear || "2026",
            location: data.user.location || "",
            bio: data.user.bio || "",
            githubUrl: data.user.githubUrl || "",
            linkedinUrl: data.user.linkedinUrl || "",
            portfolioUrl: data.user.portfolioUrl || "",
            phone: data.user.phone || "",
            profileImage: data.user.profileImage || "",
            googleId: data.user.googleId || null,
            authProvider: data.user.authProvider || "credentials",
          });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (newUrl: string | null) => {
    setFormData((prev) => ({ ...prev, profileImage: newUrl || "" }));
  };

  const handleRemovePhoto = async () => {
    try {
      const res = await fetch("/api/users/profile-image", {
        method: "DELETE",
      });
      if (res.ok) {
        setFormData((prev) => ({ ...prev, profileImage: "" }));
        setMessage("Profile photo removed.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setError("Failed to remove profile photo.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update profile.");
      }
    } catch (e: any) {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#A9AAA5] text-xs animate-pulse">
        Loading profile...
      </div>
    );
  }

  const isGoogleConnected = Boolean(
    formData.googleId ||
    formData.authProvider === "google" ||
    formData.authProvider === "both"
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#F5F1E8] tracking-tight">
          Talent & Builder Profile
        </h2>
        <p className="text-xs text-[#A9AAA5] mt-1">
          Manage your credentials, uploaded photo, education, and connected accounts.
        </p>
      </div>

      <div className="rounded-[18px] bg-[#111615] p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-8">
        {message && (
          <div className="p-3 rounded-[10px] bg-[#8FA58E]/10 border border-[#8FA58E]/30 text-[#8FA58E] text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#8FA58E] flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fade-in">
            <span>{error}</span>
          </div>
        )}

        {/* Profile Photo Section (Cloudinary) */}
        <div className="p-5 rounded-[14px] bg-[#0E1110] border border-white/[0.06] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <UserAvatar
                name={formData.name}
                image={formData.profileImage}
                size="2xl"
                className="shadow-md"
              />
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-[#F5F1E8]">Profile Picture</h3>
                <p className="text-[11px] text-[#A9AAA5]">
                  Supports PNG, JPG, WEBP under 5MB. Powered by Cloudinary.
                </p>
                {formData.profileImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center space-x-1 text-[11px] text-rose-400 hover:text-rose-300 font-mono transition-colors pt-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>

            <div className="sm:max-w-xs w-full">
              <ImageUpload
                folder="users"
                label="Change Photo"
                sublabel="Upload new avatar"
                aspectRatio="1:1"
                value={formData.profileImage}
                onChange={handleProfileImageChange}
              />
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="p-5 rounded-[14px] bg-[#0E1110] border border-white/[0.06] space-y-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#D8B77A]" />
            <h3 className="font-semibold text-xs text-[#F5F1E8] uppercase tracking-wider font-mono">
              Connected Accounts
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-[10px] bg-[#151A18] border border-white/[0.04]">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
              <div>
                <div className="font-semibold text-xs text-[#F5F1E8]">Google</div>
                <div className="text-[11px] text-[#A9AAA5]">
                  {isGoogleConnected ? "Connected for single sign-on" : "Not connected"}
                </div>
              </div>
            </div>

            {isGoogleConnected ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-[6px] text-[11px] font-mono text-[#8FA58E] bg-[#8FA58E]/10 border border-[#8FA58E]/25">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            ) : (
              <a
                href="/api/auth/google/redirect?redirect=/dashboard/profile"
                className="px-3 py-1.5 rounded-[8px] text-[11px] font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors"
              >
                Connect Google
              </a>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B]/60 border border-white/[0.06] text-[#7E807B] cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
                College / University
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. Indian Institute of Technology"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
                Degree & Major
              </label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
                Graduation Year
              </label>
              <input
                type="text"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="e.g. 2026"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
                Location (City, Country)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore, India"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
                Portfolio / Website URL
              </label>
              <input
                type="url"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleChange}
                placeholder="https://yourportfolio.dev"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
              Skills & Tech Stack (comma separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, TypeScript, Next.js, Python, PostgreSQL, Docker"
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="font-semibold text-[#A9AAA5] block mb-1 font-mono uppercase text-[11px]">
              Bio & Summary
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell recruiters and hackathon organizers about yourself..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors resize-none"
            />
          </div>

          {/* Professional Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.08]">
            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 flex items-center space-x-1.5 font-mono uppercase text-[11px]">
                <Github className="w-3.5 h-3.5 text-[#D8B77A]" />
                <span>GitHub Profile URL</span>
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="font-semibold text-[#A9AAA5] block mb-1 flex items-center space-x-1.5 font-mono uppercase text-[11px]">
                <Linkedin className="w-3.5 h-3.5 text-[#D8B77A]" />
                <span>LinkedIn Profile URL</span>
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/[0.08] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-[10px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
