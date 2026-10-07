"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
  AlertCircle,
  Briefcase,
  Trophy,
} from "lucide-react";
import ImageUpload from "@/components/common/ImageUpload";
import AuthRequiredModal from "@/components/modals/AuthRequiredModal";

export default function OrganizerOnboardingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    organizationInstagram: "",
    requestVerification: true,
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          setFormData((prev) => ({
            ...prev,
            organizationName: data.user.organizationName || "",
            organizationLogo: data.user.organizationLogo || "",
            organizationBio: data.user.organizationBio || "",
            organizationWebsite: data.user.organizationWebsite || "",
            organizationEmail: data.user.organizationEmail || data.user.email || "",
            organizationPhone: data.user.organizationPhone || data.user.phone || "",
            organizationLocation: data.user.organizationLocation || "Remote",
            organizationLinkedin: data.user.organizationLinkedin || "",
            organizationTwitter: data.user.organizationTwitter || "",
            organizationInstagram: data.user.organizationInstagram || "",
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (!formData.organizationName.trim()) {
      setError("Organization name is required.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/organizer/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to activate organizer workspace.");
      }

      router.push("/organizer");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred during onboarding.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthenticated = (user: any) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    setFormData((prev) => ({
      ...prev,
      organizationEmail: prev.organizationEmail || user.email,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
      </div>
    );
  }

  // If already an organizer
  if (currentUser && currentUser.isOrganizer) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 rounded-[20px] bg-[#111615] p-8 sm:p-10 border border-white/[0.08] shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-[#8FA58E]/15 border border-[#8FA58E]/30 text-[#8FA58E] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#F5F1E8] tracking-tight">
              Organizer Workspace Active
            </h2>
            <p className="text-xs text-[#A9AAA5] leading-relaxed">
              Your account is already configured with an active Organizer Workspace for{" "}
              <span className="text-[#F5F1E8] font-semibold">{currentUser.organizationName || "your team"}</span>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/organizer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
            >
              <span>Enter Organizer Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-[9px] font-medium text-xs text-[#A9AAA5] hover:text-[#F5F1E8] bg-[#151A18] border border-white/[0.08] transition-colors"
            >
              <span>Return to Talent</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-[6px] bg-[#D8B77A]/10 text-[#D8B77A] text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NIMBLUX ORGANIZER ONBOARDING</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F1E8] tracking-tight">
          Activate Your Organizer Workspace
        </h1>
        <p className="text-xs sm:text-sm text-[#A9AAA5] leading-relaxed">
          Post internships, recruit students, host hackathons, and evaluate applicants with verified credentials. One unified NIMBLUX account.
        </p>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-[14px] bg-[#111615] border border-white/[0.06] space-y-2">
          <div className="w-9 h-9 rounded-[10px] bg-[#D8B77A]/10 text-[#D8B77A] flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#F5F1E8]">Direct Hiring Pipeline</h3>
          <p className="text-xs text-[#A9AAA5] leading-relaxed">
            Review candidate portfolios, filter skills, and conduct candidate evaluations.
          </p>
        </div>

        <div className="p-5 rounded-[14px] bg-[#111615] border border-white/[0.06] space-y-2">
          <div className="w-9 h-9 rounded-[10px] bg-[#8FA58E]/10 text-[#8FA58E] flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#F5F1E8]">Full Hackathon Engine</h3>
          <p className="text-xs text-[#A9AAA5] leading-relaxed">
            Manage teams, judging rubrics, prize pools, submissions, and leaderboards.
          </p>
        </div>

        <div className="p-5 rounded-[14px] bg-[#111615] border border-white/[0.06] space-y-2">
          <div className="w-9 h-9 rounded-[10px] bg-[#D8B77A]/10 text-[#D8B77A] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#F5F1E8]">Instant Verifications</h3>
          <p className="text-xs text-[#A9AAA5] leading-relaxed">
            Issue cryptographically verifiable participation and winner certificates.
          </p>
        </div>
      </div>

      {/* Onboarding Form */}
      <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] p-6 sm:p-10 shadow-card space-y-8">
        <div>
          <h2 className="text-xl font-bold text-[#F5F1E8] tracking-tight">
            Organization Profile
          </h2>
          <p className="text-xs text-[#A9AAA5] mt-1">
            Provide details about your organization, company, or club. Cloud-stored via Cloudinary.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-[10px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Name & Type */}
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
                placeholder="e.g. Acme Labs, Stanford AI Club"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
                Organization Type *
              </label>
              <select
                value={formData.organizationType}
                onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors cursor-pointer"
              >
                <option value="COMPANY" className="bg-[#111615]">Company / Enterprise</option>
                <option value="STARTUP" className="bg-[#111615]">High-Growth Startup</option>
                <option value="COLLEGE_CLUB" className="bg-[#111615]">College / University Club</option>
                <option value="COMMUNITY" className="bg-[#111615]">Tech Community / Foundation</option>
                <option value="NON_PROFIT" className="bg-[#111615]">Non-Profit Organization</option>
              </select>
            </div>
          </div>

          {/* Logo Upload via Cloudinary */}
          <div className="p-4 rounded-[14px] bg-[#0E1110] border border-white/[0.06] space-y-2">
            <ImageUpload
              folder="organizations"
              label="Organization Logo"
              sublabel="Square PNG, JPG, WEBP, or SVG under 5MB"
              aspectRatio="1:1"
              value={formData.organizationLogo}
              onChange={(url) => setFormData((prev) => ({ ...prev, organizationLogo: url || "" }))}
            />
            <p className="text-[11px] text-[#A9AAA5] font-mono">
              Displayed on your organization profile, opportunity cards, detail pages, and candidate review flows.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.organizationBio}
              onChange={(e) => setFormData({ ...formData, organizationBio: e.target.value })}
              placeholder="Tell builders, students, and applicants about your mission, culture, and programs..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors resize-none"
            />
          </div>

          {/* Website, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
                Website URL *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
                <input
                  type="url"
                  required
                  value={formData.organizationWebsite}
                  onChange={(e) => setFormData({ ...formData, organizationWebsite: e.target.value })}
                  placeholder="https://company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
                Headquarters / Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
                <input
                  type="text"
                  value={formData.organizationLocation}
                  onChange={(e) => setFormData({ ...formData, organizationLocation: e.target.value })}
                  placeholder="e.g. San Francisco, CA / Bengaluru / Remote"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Social Profiles: LinkedIn, X, Instagram */}
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
                X (Twitter)
              </label>
              <div className="relative">
                <Twitter className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
                <input
                  type="text"
                  value={formData.organizationTwitter}
                  onChange={(e) => setFormData({ ...formData, organizationTwitter: e.target.value })}
                  placeholder="https://x.com/... or @handle"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
                Instagram
              </label>
              <div className="relative">
                <Instagram className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
                <input
                  type="text"
                  value={formData.organizationInstagram}
                  onChange={(e) => setFormData({ ...formData, organizationInstagram: e.target.value })}
                  placeholder="https://instagram.com/... or @handle"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
                Contact Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-[#7E807B]" />
                <input
                  type="email"
                  required
                  value={formData.organizationEmail}
                  onChange={(e) => setFormData({ ...formData, organizationEmail: e.target.value })}
                  placeholder="organizer@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
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
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Verification Request Checkbox */}
          <div className="p-4 rounded-[12px] bg-[#0E1110] border border-white/[0.06] flex items-start space-x-3">
            <input
              type="checkbox"
              id="requestVerification"
              checked={formData.requestVerification}
              onChange={(e) => setFormData({ ...formData, requestVerification: e.target.checked })}
              className="mt-0.5 rounded border-white/[0.2] text-[#D8B77A] focus:ring-[#D8B77A] cursor-pointer"
            />
            <label htmlFor="requestVerification" className="text-xs text-[#A9AAA5] cursor-pointer">
              <span className="font-semibold text-[#F5F1E8] block mb-0.5">
                Submit organization for verified badge review
              </span>
              Verified organizations receive higher visibility on opportunities and can feature custom application workflows.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-[10px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-[#090B0B] border-t-transparent animate-spin" />
            ) : (
              <>
                <span>Activate Organizer Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Auth Interceptor Modal */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Sign in to activate Organizer Workspace"
        subtitle="You need a NIMBLUX account to manage organization opportunities."
        actionName="activate organizer workspace"
        redirectUrl="/organizer/onboarding"
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}
