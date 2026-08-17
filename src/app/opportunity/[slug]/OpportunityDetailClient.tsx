"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  Flag,
  CheckCircle2,
  DollarSign,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Mail,
  HelpCircle,
} from "lucide-react";
import { formatDate, getDaysRemaining, getWorkModeBadge } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import ShareModal from "@/components/modals/ShareModal";
import ReportModal from "@/components/modals/ReportModal";
import OpportunityCard, { OpportunityCardData } from "@/components/cards/OpportunityCard";

interface OpportunityDetailProps {
  opportunity: OpportunityCardData & {
    eligibility?: string | null;
    endDate?: string | Date | null;
    contactInfo?: string | null;
    additionalInfo?: string | null;
    createdBy?: {
      id: string;
      name: string;
      profileImage?: string | null;
      college?: string | null;
    } | null;
  };
  related: OpportunityCardData[];
  initialSaved: boolean;
}

export default function OpportunityDetailClient({
  opportunity,
  related,
  initialSaved,
}: OpportunityDetailProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const categoryMeta = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === opportunity.category.toLowerCase()
  ) || {
    name: opportunity.category,
    color: "from-indigo-500 to-cyan-500",
    bgGradient: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };

  const daysInfo = getDaysRemaining(opportunity.deadline);
  const modeBadge = getWorkModeBadge(opportunity.mode);

  const handleBookmark = async () => {
    setSaving(true);
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opportunity.id }),
      });
      if (!res.ok) setSaved(saved);
    } catch {
      setSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyClick = () => {
    fetch(`/api/opportunities/${opportunity.id}/click`, { method: "POST" }).catch(() => {});
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://nimblux.com/opportunity/${opportunity.slug}`;

  const skillsList = opportunity.skills
    ? opportunity.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6">
        <Link href="/opportunities" className="hover:text-white transition-colors">
          Opportunities
        </Link>
        <span>/</span>
        <Link
          href={`/${opportunity.category.toLowerCase()}`}
          className="hover:text-white capitalize transition-colors"
        >
          {categoryMeta.name}
        </Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-xs">{opportunity.title}</span>
      </div>

      {/* Main Grid: Left Details + Right Sticky Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-slate-900/40">
            {/* Header: Org Logo, Verified, Category, Title */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border border-slate-700/80 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                {opportunity.logo ? (
                  <img
                    src={opportunity.logo}
                    alt={opportunity.organization}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-900/50 to-slate-800 flex items-center justify-center font-bold text-indigo-300 text-xl">
                    {opportunity.organization.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold text-sm text-slate-300">
                    {opportunity.organization}
                  </span>
                  {opportunity.verified && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${categoryMeta.bgGradient}`}
                  >
                    {categoryMeta.name}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${modeBadge.className}`}
                  >
                    {modeBadge.label}
                  </span>
                </div>

                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                  {opportunity.title}
                </h1>
              </div>
            </div>

            {/* Key Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 my-6">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Compensation
                </div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5 truncate">
                  {opportunity.stipend || opportunity.salary || opportunity.registrationFee || "Free"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Deadline
                </div>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    daysInfo.isUrgent ? "text-rose-400" : "text-white"
                  }`}
                >
                  {formatDate(opportunity.deadline)}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Location
                </div>
                <div className="text-sm font-bold text-white mt-0.5 truncate">
                  {opportunity.location}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Time Remaining
                </div>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    daysInfo.isUrgent ? "text-rose-400" : "text-indigo-400"
                  }`}
                >
                  {daysInfo.text}
                </div>
              </div>
            </div>

            {/* Banner Image */}
            {opportunity.banner && (
              <div className="rounded-2xl overflow-hidden my-6 max-h-80 border border-slate-800">
                <img
                  src={opportunity.banner}
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Section: Full Description */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h2 className="font-display font-bold text-lg text-white">
                About the Opportunity
              </h2>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </div>
            </div>

            {/* Section: Eligibility */}
            {opportunity.eligibility && (
              <div className="space-y-3 pt-6 border-t border-slate-800 mt-6">
                <h2 className="font-display font-bold text-lg text-white flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <span>Eligibility & Criteria</span>
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {opportunity.eligibility}
                </p>
              </div>
            )}

            {/* Section: Skills */}
            {skillsList.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-slate-800 mt-6">
                <h2 className="font-display font-bold text-lg text-white">
                  Skills & Technologies Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Important Dates */}
            <div className="space-y-3 pt-6 border-t border-slate-800 mt-6">
              <h2 className="font-display font-bold text-lg text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <span>Important Timeline</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block">Application Closes:</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">
                    {formatDate(opportunity.deadline)}
                  </span>
                </div>
                {opportunity.startDate && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block">Program Start Date:</span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">
                      {formatDate(opportunity.startDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Additional & Contact */}
            {(opportunity.additionalInfo || opportunity.contactInfo) && (
              <div className="space-y-3 pt-6 border-t border-slate-800 mt-6">
                <h2 className="font-display font-bold text-lg text-white">
                  Additional Information
                </h2>
                {opportunity.additionalInfo && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {opportunity.additionalInfo}
                  </p>
                )}
                {opportunity.contactInfo && (
                  <div className="flex items-center space-x-2 text-xs text-indigo-300 pt-1">
                    <Mail className="w-4 h-4" />
                    <span>Contact: {opportunity.contactInfo}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Sidebar (1 Col) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          {/* Action Box */}
          <div className="rounded-3xl glass-panel p-6 border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyClick}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-brand-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-600/30 glow-button transition-all text-center"
            >
              <span>Apply on Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBookmark}
                disabled={saving}
                className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                  saved
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                    : "bg-slate-950/80 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? "fill-indigo-400" : ""}`} />
                <span>{saved ? "Saved" : "Save"}</span>
              </button>

              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-950/80 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
              >
                <Share2 className="w-4 h-4 text-sky-400" />
                <span>Share</span>
              </button>
            </div>

            {/* Report Button */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center space-x-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report incorrect listing</span>
              </button>
            </div>
          </div>

          {/* Submitter & Verification Badge */}
          <div className="rounded-3xl glass-panel p-5 border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Verified Listing</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              This listing has been verified by the NIMBLUX review team. Applications are processed directly on the organizer's platform.
            </p>
            {opportunity.createdBy && (
              <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2.5 text-xs text-slate-400">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-[10px]">
                  {opportunity.createdBy.name.charAt(0)}
                </div>
                <div>
                  <div className="text-slate-300 font-medium">{opportunity.createdBy.name}</div>
                  {opportunity.createdBy.college && (
                    <div className="text-[10px] text-slate-400">{opportunity.createdBy.college}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Opportunities */}
      {related.length > 0 && (
        <div className="mt-16 pt-12 border-t border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Similar Opportunities</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-white">
                More in {categoryMeta.name}
              </h2>
            </div>
            <Link
              href={`/${opportunity.category.toLowerCase()}`}
              className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((rel) => (
              <OpportunityCard key={rel.id} opportunity={rel} compact />
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        title={opportunity.title}
        url={currentUrl}
        onClose={() => setShareOpen(false)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        opportunityId={opportunity.id}
        opportunityTitle={opportunity.title}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
