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
  Github,
  AlertCircle,
  Briefcase,
  Trophy,
} from "lucide-react";
import AuthRequiredModal from "@/components/modals/AuthRequiredModal";

export default function BecomeOrganizerPage() {
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
    organizationGithub: "",
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
            organizationGithub: data.user.organizationGithub || "",
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
              <span>Go to Talent</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-[6px] text-xs font-mono font-bold text-[#D8B77A] bg-[#D8B77A]/10 border border-[#D8B77A]/25">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NIMBLUX FOR ORGANIZERS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-[700] text-[#F5F1E8] tracking-tight">
          Create opportunities. Build your community.
        </h1>
        <p className="text-sm text-[#A9AAA5] leading-relaxed">
          Post internships, jobs, hackathons, workshops, and events. Discover verified talent, manage candidate pipelines, and issue tamper-proof certificates.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-[14px] bg-[#111615] border border-white/[0.08] space-y-1.5">
          <Briefcase className="w-5 h-5 text-[#D8B77A]" />
          <h3 className="text-sm font-semibold text-[#F5F1E8]">Hire & Recruit</h3>
          <p className="text-xs text-[#A9AAA5] leading-relaxed">
            Publish internships and full-time tech roles with structured screening pipelines.
          </p>
        </div>
        <div className="p-4 rounded-[14px] bg-[#111615] border border-white/[0.08] space-y-1.5">
          <Trophy className="w-5 h-5 text-[#8FA58E]" />
          <h3 className="text-sm font-semibold text-[#F5F1E8]">Host Hackathons</h3>
          <p className="text-xs text-[#A9AAA5] leading-relaxed">
            In-platform team building, judging criteria, live leaderboard, and project submissions.
          </p>
        </div>
        <div className="p-4 rounded-[14px] bg-[#111615] border border-white/[0.08] space-y-1.5">
          <ShieldCheck className="w-5 h-5 text-[#D8B77A]" />
          <h3 className="text-sm font-semibold text-[#F5F1E8]">Issue Certificates</h3>
          <p className="text-xs text-[#A9AAA5] leading-relaxed">
            Cryptographically verifiable credentials for attendees, participants, and winners.
          </p>
        </div>
      </div>

      {/* Onboarding Form */}
      <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] p-6 sm:p-10 shadow-card space-y-8">
        <div>
          <h2 className="text-xl font-bold text-[#F5F1E8] tracking-tight">
            Organization Information
          </h2>
          <p className="text-xs text-[#A9AAA5] mt-1">
            Provide details about your organization, company, or student chapter.
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

          {/* Logo URL & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                value={formData.organizationLogo}
                onChange={(e) => setFormData({ ...formData, organizationLogo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
                Location / Headquarters
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

          {/* Description */}
          <div>
            <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
              About the Organization *
            </label>
            <textarea
              required
              rows={3}
              value={formData.organizationBio}
              onChange={(e) => setFormData({ ...formData, organizationBio: e.target.value })}
              placeholder="Tell builders and applicants about your mission, culture, and programs..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors resize-none"
            />
          </div>

          {/* Web & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono font-medium text-[#F5F1E8] mb-1.5">
                LinkedIn URL
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
                Twitter / X URL
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
                GitHub URL
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

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-[11px] text-[#A9AAA5] font-mono">
              Admin verification grants the official <span className="text-[#8FA58E]">Verified Organizer</span> badge.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? "Activating..." : "Activate Organizer Workspace"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Auth Interception Modal */}
      {authModalOpen && (
        <AuthRequiredModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          actionName="Become an Organizer"
          redirectUrl="/become-organizer"
          onAuthenticated={handleAuthenticated}
        />
      )}
    </div>
  );
}
