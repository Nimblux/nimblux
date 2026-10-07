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
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Send,
  Ticket,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { formatDate, getDaysRemaining, getWorkModeBadge } from "@/lib/utils";
import { formatCurrency } from "@/lib/hackathon";

export interface OpportunityCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  opportunityType?: string;
  organization: string;
  logo?: string | null;
  banner?: string | null;
  location: string;
  mode: string;
  stipend?: string | null;
  salary?: string | null;
  registrationFee?: string | null;
  isPaid?: boolean;
  price?: string | null;
  hasPrizePool?: boolean;
  totalPrizePool?: string | null;
  prizeCurrency?: string | null;
  prize1st?: string | null;
  isExternal?: boolean;
  externalUrl?: string | null;
  applicationUrl: string;
  deadline: string | Date;
  startDate?: string | Date | null;
  featured?: boolean;
  verified?: boolean;
  clicksCount?: number;
  viewsCount?: number;
  skills?: string | null;
  isBookmarked?: boolean;
}

interface OpportunityCardProps {
  opportunity: OpportunityCardData;
  onBookmarkToggle?: (id: string, isSaved: boolean) => void;
  compact?: boolean;
}

export default function OpportunityCard({
  opportunity,
  onBookmarkToggle,
  compact = false,
}: OpportunityCardProps) {
  const [saved, setSaved] = useState(opportunity.isBookmarked || false);
  const [saving, setSaving] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const oppType = (opportunity.opportunityType || opportunity.category || "OTHER").toUpperCase();

  const daysInfo = getDaysRemaining(opportunity.deadline);
  const modeBadge = getWorkModeBadge(opportunity.mode);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opportunity.id }),
      });

      if (!res.ok) {
        setSaved(saved);
      } else {
        if (onBookmarkToggle) {
          onBookmarkToggle(opportunity.id, nextSaved);
        }
      }
    } catch {
      setSaved(saved);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetch(`/api/opportunities/${opportunity.id}/click`, { method: "POST" }).catch(() => {});
  };

  const skillsList = opportunity.skills
    ? opportunity.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  // Dynamic Button Label
  const getButtonLabel = () => {
    if (opportunity.isExternal) {
      return "Apply on Website";
    }
    if (["WORKSHOP", "EVENT", "WEBINAR", "CONFERENCE"].includes(oppType)) {
      return "Register Now";
    }
    if (["COURSE", "BOOTCAMP"].includes(oppType)) {
      return "Enroll Now";
    }
    return "Apply Now";
  };

  // Dynamic Compensation Display
  const renderCompensation = () => {
    if (opportunity.hasPrizePool && opportunity.totalPrizePool) {
      return (
        <span className="text-[#D8B77A] font-medium font-mono text-[12px]">
          🏆 {formatCurrency(opportunity.totalPrizePool, opportunity.prizeCurrency || "INR")}
        </span>
      );
    }
    if (opportunity.stipend) {
      return (
        <span className="text-[#8FA58E] font-medium font-mono text-[12px] truncate max-w-[130px]">
          {opportunity.stipend}
        </span>
      );
    }
    if (opportunity.salary) {
      return (
        <span className="text-[#8FA58E] font-medium font-mono text-[12px] truncate max-w-[130px]">
          {opportunity.salary}
        </span>
      );
    }
    if (opportunity.price) {
      return (
        <span className="text-[#D8B77A] font-medium font-mono text-[12px]">
          {opportunity.price}
        </span>
      );
    }
    return (
      <span className="text-[#A9AAA5] font-mono text-[11px]">
        {opportunity.registrationFee || "Free Entry"}
      </span>
    );
  };

  return (
    <article
      className={`group relative rounded-[15px] bg-[#111615] border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        opportunity.featured
          ? "border-white/[0.12] hover:border-[#D8B77A]/40 shadow-card hover:shadow-card-hover"
          : "border-white/[0.08] hover:border-white/[0.15] hover:bg-[#151A18] shadow-soft"
      }`}
    >
      {/* Featured Badge */}
      {opportunity.featured && (
        <div className="absolute top-0 right-0 z-10">
          <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-[#D8B77A] text-[#090B0B] text-[9.5px] font-mono font-bold tracking-wider uppercase rounded-bl-[10px]">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Featured</span>
          </div>
        </div>
      )}

      {/* Main Card Body */}
      <div className="p-5">
        {/* Organization Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Org Logo / Monogram */}
            <div className="w-10 h-10 rounded-[10px] bg-[#0E1110] border border-white/[0.08] flex items-center justify-center p-1.5 shadow-sm overflow-hidden flex-shrink-0">
              {opportunity.logo && !logoError ? (
                <img
                  src={opportunity.logo}
                  alt={opportunity.organization}
                  className="w-full h-full object-cover rounded-[7px]"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-[7px] bg-[#151A18] flex items-center justify-center font-bold text-[#D8B77A] text-xs font-mono">
                  {opportunity.organization.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Org Name & Type Badge */}
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-medium text-[13px] text-[#F5F1E8] truncate">
                  {opportunity.organization}
                </span>
                {opportunity.verified && (
                  <span title="Verified Host">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8FA58E] flex-shrink-0" />
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-mono font-medium bg-white/[0.05] text-[#A9AAA5] border border-white/[0.06]">
                  {opportunity.category}
                </span>
                <span className="text-[11px] text-[#7E807B]">
                  • {opportunity.location}
                </span>
              </div>
            </div>
          </div>

          {/* Bookmark Action */}
          <button
            onClick={handleBookmark}
            disabled={saving}
            className={`p-1.5 rounded-[8px] border transition-colors ${
              saved
                ? "bg-[#D8B77A]/15 text-[#D8B77A] border-[#D8B77A]/30"
                : "bg-[#0E1110] text-[#7E807B] border-white/[0.06] hover:text-[#F5F1E8] hover:border-white/[0.12]"
            }`}
            title={saved ? "Remove from saved" : "Save opportunity"}
            aria-label="Save opportunity"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#D8B77A]" : ""}`} />
          </button>
        </div>

        {/* Opportunity Title */}
        <Link
          href={`/opportunity/${opportunity.slug}`}
          className="block group/title focus:outline-none"
        >
          <h3 className="font-semibold text-[15px] text-[#F5F1E8] group-hover/title:text-[#D8B77A] transition-colors line-clamp-2 leading-snug">
            {opportunity.title}
          </h3>
        </Link>

        {/* Description */}
        {!compact && opportunity.description && (
          <p className="mt-2 text-xs text-[#A9AAA5] line-clamp-2 leading-relaxed font-normal">
            {opportunity.description}
          </p>
        )}

        {/* Skills Tags */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-[5px] text-[10px] bg-[#0E1110] text-[#A9AAA5] border border-white/[0.06]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info & Action Button */}
      <div className="px-5 py-3 bg-[#0E1110]/80 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex flex-col">
          {renderCompensation()}
          <div className="flex items-center space-x-1 font-mono text-[10.5px] text-[#7E807B] mt-0.5">
            <Clock className="w-3 h-3 text-[#A9AAA5]" />
            <span className={daysInfo.isUrgent ? "text-rose-400 font-semibold" : ""}>
              {daysInfo.text}
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        {(() => {
          const isRegistrationType = ["WORKSHOP", "EVENT", "WEBINAR", "CONFERENCE"].includes(oppType);
          const actionQuery = opportunity.isExternal ? "" : isRegistrationType ? "?action=register" : "?action=apply";
          return (
            <Link
              href={`/opportunity/${opportunity.slug}${actionQuery}`}
              onClick={handleApplyClick}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-[8px] text-[12px] font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
            >
              <span>{getButtonLabel()}</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          );
        })()}
      </div>
    </article>
  );
}
