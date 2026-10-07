"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  ShieldCheck,
  Globe,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import ImageUpload from "@/components/common/ImageUpload";

export default function OrganizationProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "COMPANY",
    organizationLogo: "",
    organizationBio: "",
    organizationWebsite: "",
    organizationEmail: "",
    organizationPhone: "",
    organizationLocation: "Remote",
    organizationLinkedin: "",
    organizationTwitter: "",
    organizationGithub: "",
    isVerifiedOrganizer: false,
  });

  useEffect(() => {
    fetch("/api/organizer/organization")
      .then((r) => r.json())
      .then((d) => {
        if (d.organization) {
          setFormData({
            organizationName: d.organization.organizationName || "",
            organizationType: d.organization.organizationType || "COMPANY",
            organizationLogo: d.organization.organizationLogo || "",
            organizationBio: d.organization.organizationBio || "",
            organizationWebsite: d.organization.organizationWebsite || "",
            organizationEmail: d.organization.organizationEmail || d.organization.email || "",
            organizationPhone: d.organization.organizationPhone || "",
            organizationLocation: d.organization.organizationLocation || "Remote",
            organizationLinkedin: d.organization.organizationLinkedin || "",
            organizationTwitter: d.organization.organizationTwitter || "",
            organizationGithub: d.organization.organizationGithub || "",
            isVerifiedOrganizer: d.organization.isVerifiedOrganizer || false,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/organizer/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");
      setMessage("Organization profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-[#D8B77A] text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Organization Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            Organization Profile & Verification
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1 font-normal">
            Manage your organization branding, official contact details, social links, and verification status.
          </p>
        </div>

        {/* Verification Status Pill */}
        <div>
          {formData.isVerifiedOrganizer ? (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-[8px] bg-[#8FA58E]/15 border border-[#8FA58E]/30 text-[#8FA58E] text-xs font-mono font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Organizer</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-[8px] bg-[#D8B77A]/10 border border-[#D8B77A]/25 text-[#D8B77A] text-xs font-mono">
              <Clock className="w-4 h-4" />
              <span>Verification Pending</span>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-[10px] bg-[#8FA58E]/15 border border-[#8FA58E]/30 text-[#F5F1E8] text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#8FA58E] flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verification Notice Card */}
      {!formData.isVerifiedOrganizer && (
        <div className="p-4 rounded-[14px] bg-[#0E1110] border border-white/[0.08] flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-[#D8B77A] flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-[#F5F1E8]">How to get Verified</div>
            <p className="text-[#A9AAA5] leading-relaxed">
              Official verification confirms host identity, awards the <span className="text-[#8FA58E]">Verified Organizer</span> badge on public listings, and increases candidate application rates. Ensure your website and official contact email match your brand domain.
            </p>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="rounded-[18px] bg-[#111615] border border-white/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        {/* Name & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              Organization Name *
            </label>
            <input
              type="text"
              required
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              Organization Type
            </label>
            <select
              value={formData.organizationType}
              onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
            >
              <option value="COMPANY">Company / Enterprise</option>
              <option value="STARTUP">High-Growth Startup</option>
              <option value="COLLEGE_CLUB">College / University Club</option>
              <option value="COMMUNITY">Tech Community / Foundation</option>
              <option value="NON_PROFIT">Non-Profit Organization</option>
            </select>
          </div>
        </div>

        {/* Logo & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <ImageUpload
              folder="organizations"
              label="Organization Logo"
              sublabel="Square PNG, JPG, WEBP, or SVG"
              aspectRatio="1:1"
              value={formData.organizationLogo}
              onChange={(url) => setFormData({ ...formData, organizationLogo: url || "" })}
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              Location / HQ
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
              <input
                type="text"
                value={formData.organizationLocation}
                onChange={(e) => setFormData({ ...formData, organizationLocation: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
            About the Organization
          </label>
          <textarea
            rows={3}
            value={formData.organizationBio}
            onChange={(e) => setFormData({ ...formData, organizationBio: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors resize-none"
          />
        </div>

        {/* Website & Contact Email */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
              <input
                type="url"
                value={formData.organizationWebsite}
                onChange={(e) => setFormData({ ...formData, organizationWebsite: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              Contact Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
              <input
                type="email"
                value={formData.organizationEmail}
                onChange={(e) => setFormData({ ...formData, organizationEmail: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
              <input
                type="tel"
                value={formData.organizationPhone}
                onChange={(e) => setFormData({ ...formData, organizationPhone: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              LinkedIn
            </label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
              <input
                type="url"
                value={formData.organizationLinkedin}
                onChange={(e) => setFormData({ ...formData, organizationLinkedin: e.target.value })}
                placeholder="https://linkedin.com/company/..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              Twitter / X
            </label>
            <div className="relative">
              <Twitter className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
              <input
                type="url"
                value={formData.organizationTwitter}
                onChange={(e) => setFormData({ ...formData, organizationTwitter: e.target.value })}
                placeholder="https://x.com/username"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              GitHub
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
              <input
                type="url"
                value={formData.organizationGithub}
                onChange={(e) => setFormData({ ...formData, organizationGithub: e.target.value })}
                placeholder="https://github.com/org"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.06] flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? "Saving Changes..." : "Save Organization Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
