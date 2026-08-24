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
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { formatDate, getDaysRemaining, getWorkModeBadge } from "@/lib/utils";

export interface OpportunityCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  organization: string;
  logo?: string | null;
  banner?: string | null;
  location: string;
  mode: string;
  stipend?: string | null;
  salary?: string | null;
  registrationFee?: string | null;
  isPaid?: boolean;
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
        setSaved(saved); // Revert on failure
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

  return (
    <article
      className={`group relative rounded-2xl bg-charcoal-card border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        opportunity.featured
          ? "border-bronze-500/30 bg-gradient-to-b from-charcoal-850 via-charcoal-card to-charcoal-card shadow-editorial"
          : "border-charcoal-cardBorder hover:border-bronze-500/30 hover:shadow-card-hover"
      }`}
    >
      {/* Featured Badge */}
      {opportunity.featured && (
        <div className="absolute top-0 right-0 z-10">
          <div className="flex items-center space-x-1 px-3 py-1 bg-bronze-500 text-charcoal-950 text-[10px] font-mono font-bold tracking-wider uppercase rounded-bl-xl shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Featured</span>
          </div>
        </div>
      )}

      {/* Main Card Body */}
      <div className="p-5 sm:p-6">
        {/* Organization Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Org Logo / Monogram */}
            <div className="w-11 h-11 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center p-1.5 shadow-sm overflow-hidden flex-shrink-0">
              {opportunity.logo ? (
                <img
                  src={opportunity.logo}
                  alt={opportunity.organization}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-bronze-500/15 flex items-center justify-center font-bold text-bronze-300 text-xs font-mono">
                  {opportunity.organization.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Org Name & Verified Status */}
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-xs text-ivory-300 truncate">
                  {opportunity.organization}
                </span>
                {opportunity.verified && (
                  <span title="Verified by NIMBLUX">
                    <ShieldCheck className="w-3.5 h-3.5 text-sage-400 flex-shrink-0" />
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
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
            </div>
          </div>

          {/* Bookmark Action */}
          <button
            onClick={handleBookmark}
            disabled={saving}
            className={`p-2 rounded-xl border transition-colors ${
              saved
                ? "bg-bronze-500/15 text-bronze-400 border-bronze-500/30"
                : "bg-charcoal-900 text-ivory-500 border-charcoal-cardBorder hover:text-ivory-200 hover:border-charcoal-800"
            }`}
            title={saved ? "Remove from saved" : "Save opportunity"}
            aria-label="Save opportunity"
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-bronze-400" : ""}`} />
          </button>
        </div>

        {/* Opportunity Title */}
        <Link
          href={`/opportunity/${opportunity.slug}`}
          className="block group/title focus:outline-none"
        >
          <h3 className="font-sans font-bold text-[15px] sm:text-base text-ivory-100 group-hover/title:text-bronze-300 transition-colors line-clamp-2 leading-snug">
            {opportunity.title}
          </h3>
        </Link>

        {/* Short Description */}
        {!compact && (
          <p className="mt-2 text-xs text-ivory-500 line-clamp-2 leading-relaxed">
            {opportunity.description}
          </p>
        )}

        {/* Skills Tags */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md text-[10.5px] bg-charcoal-900 text-ivory-400 border border-charcoal-cardBorder"
              >
                {skill}
              </span>
            ))}
            {opportunity.skills && opportunity.skills.split(",").length > 3 && (
              <span className="px-1 py-0.5 text-[10px] text-ivory-500 font-mono self-center">
                +{opportunity.skills.split(",").length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Action Buttons */}
      <div className="px-5 sm:px-6 py-3.5 bg-charcoal-950/60 border-t border-charcoal-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Stipend / Deadline Meta */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs">
          {/* Compensation */}
          {(opportunity.stipend || opportunity.salary) ? (
            <div className="flex items-center space-x-1 text-forest-300 font-semibold font-mono text-[11.5px]">
              <span className="truncate max-w-[130px]">
                {opportunity.stipend || opportunity.salary}
              </span>
            </div>
          ) : (
            <div className="text-ivory-500 font-mono text-[11px]">
              {opportunity.registrationFee || "Free Entry"}
            </div>
          )}

          {/* Deadline */}
          <div
            className={`flex items-center space-x-1 font-mono text-[11px] ${
              daysInfo.isUrgent
                ? "text-rose-400 font-semibold"
                : daysInfo.isExpired
                ? "text-ivory-500 line-through"
                : "text-ivory-400"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{daysInfo.text}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            href={`/opportunity/${opportunity.slug}`}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-medium text-ivory-300 hover:text-ivory-100 bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-cardBorder transition-colors text-center"
          >
            Details
          </Link>
          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApplyClick}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
