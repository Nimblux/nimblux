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
  ShieldCheck,
  Trophy,
  Award,
} from "lucide-react";
import { formatDate, getDaysRemaining, getWorkModeBadge } from "@/lib/utils";
import { formatCurrency } from "@/lib/hackathon";
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
    hasPrizePool?: boolean;
    totalPrizePool?: string | null;
    prizeCurrency?: string | null;
    prize1st?: string | null;
    prize2nd?: string | null;
    prize3rd?: string | null;
    prizeSpecial?: string | null;
    prizeDetails?: string | null;
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
    color: "from-bronze-400 to-bronze-600",
    bgGradient: "bg-bronze-500/10 text-bronze-300 border-bronze-500/20",
    dotColor: "bg-bronze-400",
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

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://nimblux.xyz/opportunity/${opportunity.slug}`;

  const skillsList = opportunity.skills
    ? opportunity.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-mono text-ivory-500 mb-6">
        <Link href="/opportunities" className="hover:text-ivory-200 transition-colors">
          Opportunities
        </Link>
        <span>/</span>
        <Link
          href={`/${opportunity.category.toLowerCase()}`}
          className="hover:text-ivory-200 capitalize transition-colors"
        >
          {categoryMeta.name}
        </Link>
        <span>/</span>
        <span className="text-ivory-300 truncate max-w-xs">{opportunity.title}</span>
      </nav>

      {/* Main Grid: Left Details + Right Sticky Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-charcoal-card p-6 sm:p-8 border border-charcoal-cardBorder shadow-card">
            {/* Header: Org Logo, Verified, Category, Title */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder p-2 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                {opportunity.logo ? (
                  <img
                    src={opportunity.logo}
                    alt={opportunity.organization}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-bronze-500/15 flex items-center justify-center font-bold text-bronze-300 text-lg font-mono">
                    {opportunity.organization.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold text-xs text-ivory-300">
                    {opportunity.organization}
                  </span>
                  {opportunity.verified && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-sage-500/10 text-sage-300 border border-sage-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium border ${categoryMeta.bgGradient}`}
                  >
                    {categoryMeta.name}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium ${modeBadge.className}`}
                  >
                    {modeBadge.label}
                  </span>
                </div>

                <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100 leading-tight">
                  {opportunity.title}
                </h1>
              </div>
            </div>

            {/* Key Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder my-6">
              <div>
                <div className="text-[10.5px] font-mono text-ivory-500 uppercase tracking-wider">
                  {opportunity.hasPrizePool && opportunity.totalPrizePool ? "Prize Pool" : "Compensation"}
                </div>
                <div className={`text-xs sm:text-sm font-bold mt-0.5 truncate font-mono ${
                  opportunity.hasPrizePool && opportunity.totalPrizePool ? "text-amber-300" : "text-forest-300"
                }`}>
                  {opportunity.hasPrizePool && opportunity.totalPrizePool
                    ? formatCurrency(opportunity.totalPrizePool, opportunity.prizeCurrency || "INR")
                    : (opportunity.stipend || opportunity.salary || opportunity.registrationFee || "Free Entry")}
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-mono text-ivory-500 uppercase tracking-wider">
                  Deadline
                </div>
                <div
                  className={`text-xs sm:text-sm font-bold mt-0.5 font-mono ${
                    daysInfo.isUrgent ? "text-rose-400" : "text-ivory-100"
                  }`}
                >
                  {formatDate(opportunity.deadline)}
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-mono text-ivory-500 uppercase tracking-wider">
                  Location
                </div>
                <div className="text-xs sm:text-sm font-bold text-ivory-200 mt-0.5 truncate">
                  {opportunity.location}
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-mono text-ivory-500 uppercase tracking-wider">
                  Status
                </div>
                <div
                  className={`text-xs sm:text-sm font-bold mt-0.5 font-mono ${
                    daysInfo.isUrgent ? "text-rose-400" : "text-bronze-300"
                  }`}
                >
                  {daysInfo.text}
                </div>
              </div>
            </div>

            {/* Reusable Prize Pool Section (Only shown when prize data exists) */}
            {(opportunity.hasPrizePool || opportunity.totalPrizePool || opportunity.prize1st) && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-charcoal-900 via-charcoal-card to-charcoal-900 border border-bronze-500/30 my-6 space-y-4 shadow-editorial">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-charcoal-cardBorder">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h2 className="font-serif-heading font-medium text-lg sm:text-xl text-ivory-100">
                      Prize Pool & Rewards
                    </h2>
                  </div>
                  {opportunity.totalPrizePool && (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs sm:text-sm">
                      <span>Total Pool: {formatCurrency(opportunity.totalPrizePool, opportunity.prizeCurrency || "INR")}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1st Prize */}
                  {opportunity.prize1st && (
                    <div className="p-4 rounded-xl bg-charcoal-950/80 border border-amber-500/30 text-center space-y-1">
                      <div className="text-xl">🥇</div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">1st Prize</div>
                      <div className="text-sm sm:text-base font-bold text-ivory-100 font-mono">
                        {opportunity.prize1st.startsWith("₹") || opportunity.prize1st.startsWith("$")
                          ? opportunity.prize1st
                          : formatCurrency(opportunity.prize1st, opportunity.prizeCurrency || "INR")}
                      </div>
                    </div>
                  )}

                  {/* 2nd Prize */}
                  {opportunity.prize2nd && (
                    <div className="p-4 rounded-xl bg-charcoal-950/80 border border-stone-500/30 text-center space-y-1">
                      <div className="text-xl">🥈</div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-stone-300 font-bold">2nd Prize</div>
                      <div className="text-sm sm:text-base font-bold text-ivory-100 font-mono">
                        {opportunity.prize2nd.startsWith("₹") || opportunity.prize2nd.startsWith("$")
                          ? opportunity.prize2nd
                          : formatCurrency(opportunity.prize2nd, opportunity.prizeCurrency || "INR")}
                      </div>
                    </div>
                  )}

                  {/* 3rd Prize */}
                  {opportunity.prize3rd && (
                    <div className="p-4 rounded-xl bg-charcoal-950/80 border border-bronze-500/30 text-center space-y-1">
                      <div className="text-xl">🥉</div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-bronze-400 font-bold">3rd Prize</div>
                      <div className="text-sm sm:text-base font-bold text-ivory-100 font-mono">
                        {opportunity.prize3rd.startsWith("₹") || opportunity.prize3rd.startsWith("$")
                          ? opportunity.prize3rd
                          : formatCurrency(opportunity.prize3rd, opportunity.prizeCurrency || "INR")}
                      </div>
                    </div>
                  )}
                </div>

                {/* Special Awards & Extra Perks */}
                {(opportunity.prizeSpecial || opportunity.prizeDetails) && (
                  <div className="pt-3 border-t border-charcoal-cardBorder space-y-2">
                    {opportunity.prizeSpecial && (
                      <div className="flex items-start space-x-2 text-xs">
                        <Award className="w-4 h-4 text-forest-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-ivory-200">Special Awards: </span>
                          <span className="text-ivory-400">{opportunity.prizeSpecial}</span>
                        </div>
                      </div>
                    )}
                    {opportunity.prizeDetails && (
                      <p className="text-xs text-ivory-500 leading-relaxed italic">
                        {opportunity.prizeDetails}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Banner Image */}
            {opportunity.banner && (
              <div className="rounded-2xl overflow-hidden my-6 max-h-80 border border-charcoal-cardBorder">
                <img
                  src={opportunity.banner}
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Section: Full Description */}
            <div className="space-y-3 pt-4 border-t border-charcoal-cardBorder">
              <h2 className="font-sans font-bold text-base text-ivory-100">
                About the Opportunity
              </h2>
              <div className="text-xs sm:text-sm text-ivory-400 leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </div>
            </div>

            {/* Section: Eligibility */}
            {opportunity.eligibility && (
              <div className="space-y-3 pt-6 border-t border-charcoal-cardBorder mt-6">
                <h2 className="font-sans font-bold text-base text-ivory-100 flex items-center space-x-2">
                  <GraduationCap className="w-4.5 h-4.5 text-bronze-400" />
                  <span>Eligibility & Criteria</span>
                </h2>
                <p className="text-xs sm:text-sm text-ivory-400 leading-relaxed">
                  {opportunity.eligibility}
                </p>
              </div>
            )}

            {/* Section: Skills */}
            {skillsList.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-charcoal-cardBorder mt-6">
                <h2 className="font-sans font-bold text-base text-ivory-100">
                  Skills & Technologies Required
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-charcoal-900 text-ivory-300 border border-charcoal-cardBorder"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Important Dates */}
            <div className="space-y-3 pt-6 border-t border-charcoal-cardBorder mt-6">
              <h2 className="font-sans font-bold text-base text-ivory-100 flex items-center space-x-2">
                <Calendar className="w-4.5 h-4.5 text-forest-400" />
                <span>Important Timeline</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder">
                  <span className="text-ivory-500 block font-mono text-[11px]">Application Closes:</span>
                  <span className="text-xs sm:text-sm font-semibold text-ivory-100 mt-0.5 block font-mono">
                    {formatDate(opportunity.deadline)}
                  </span>
                </div>
                {opportunity.startDate && (
                  <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder">
                    <span className="text-ivory-500 block font-mono text-[11px]">Program Start Date:</span>
                    <span className="text-xs sm:text-sm font-semibold text-ivory-100 mt-0.5 block font-mono">
                      {formatDate(opportunity.startDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Additional & Contact */}
            {(opportunity.additionalInfo || opportunity.contactInfo) && (
              <div className="space-y-3 pt-6 border-t border-charcoal-cardBorder mt-6">
                <h2 className="font-sans font-bold text-base text-ivory-100">
                  Additional Information
                </h2>
                {opportunity.additionalInfo && (
                  <p className="text-xs sm:text-sm text-ivory-400 leading-relaxed">
                    {opportunity.additionalInfo}
                  </p>
                )}
                {opportunity.contactInfo && (
                  <div className="flex items-center space-x-2 text-xs text-bronze-300 pt-1 font-mono">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact: {opportunity.contactInfo}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-24">
          <div className="rounded-3xl bg-charcoal-card p-6 border border-charcoal-cardBorder space-y-4 shadow-card">
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyClick}
              className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all text-center"
            >
              <span>Apply on Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBookmark}
                disabled={saving}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${
                  saved
                    ? "bg-bronze-500/15 text-bronze-300 border-bronze-500/30"
                    : "bg-charcoal-900 text-ivory-300 border-charcoal-cardBorder hover:text-white hover:border-charcoal-800"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-bronze-400" : ""}`} />
                <span>{saved ? "Saved" : "Save"}</span>
              </button>

              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-semibold bg-charcoal-900 text-ivory-300 border border-charcoal-cardBorder hover:text-white hover:border-charcoal-800 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>

            <div className="pt-3 border-t border-charcoal-cardBorder flex items-center justify-between text-xs">
              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center space-x-1.5 text-ivory-500 hover:text-rose-400 transition-colors text-[11px]"
              >
                <Flag className="w-3 h-3" />
                <span>Report listing issue</span>
              </button>
            </div>
          </div>

          {/* Verification Box */}
          <div className="rounded-3xl bg-charcoal-card p-5 border border-charcoal-cardBorder space-y-2.5 shadow-card">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-ivory-300 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-sage-400" />
              <span>Verified Listing</span>
            </div>
            <p className="text-xs text-ivory-500 leading-relaxed">
              This listing has been verified by the NIMBLUX review team. Applications are submitted directly on the official host website.
            </p>
            {opportunity.createdBy && (
              <div className="pt-3 border-t border-charcoal-cardBorder flex items-center space-x-2.5 text-xs text-ivory-400">
                <div className="w-6 h-6 rounded-full bg-bronze-500/20 text-bronze-300 flex items-center justify-center font-bold text-[10px] font-mono">
                  {opportunity.createdBy.name.charAt(0)}
                </div>
                <div>
                  <div className="text-ivory-200 font-medium">{opportunity.createdBy.name}</div>
                  {opportunity.createdBy.college && (
                    <div className="text-[10px] text-ivory-500">{opportunity.createdBy.college}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Opportunities */}
      {related.length > 0 && (
        <div className="mt-16 pt-12 border-t border-charcoal-cardBorder">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-bronze-400 text-xs font-mono uppercase tracking-wider mb-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Similar Opportunities</span>
              </div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                More in {categoryMeta.name}
              </h2>
            </div>
            <Link
              href={`/${opportunity.category.toLowerCase()}`}
              className="text-xs font-semibold text-bronze-400 hover:text-bronze-300 transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((rel) => (
              <OpportunityCard key={rel.id} opportunity={rel} compact />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ShareModal
        isOpen={shareOpen}
        title={opportunity.title}
        url={currentUrl}
        onClose={() => setShareOpen(false)}
      />

      <ReportModal
        isOpen={reportOpen}
        opportunityId={opportunity.id}
        opportunityTitle={opportunity.title}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
