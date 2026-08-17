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
  Share2,
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
    color: "from-indigo-500 to-cyan-500",
    bgGradient: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
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
    // Fire background click track
    fetch(`/api/opportunities/${opportunity.id}/click`, { method: "POST" }).catch(() => {});
  };

  const skillsList = opportunity.skills
    ? opportunity.skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <div
      className={`group relative rounded-2xl glass-panel glass-panel-hover overflow-hidden transition-all duration-300 flex flex-col justify-between ${
        opportunity.featured
          ? "border-indigo-500/40 bg-gradient-to-b from-indigo-950/20 via-slate-900/60 to-slate-950/80 shadow-lg shadow-indigo-950/20"
          : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700"
      }`}
    >
      {/* Featured Ribbon */}
      {opportunity.featured && (
        <div className="absolute top-0 right-0 z-10">
          <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-brand-500 text-white text-[10px] font-bold tracking-wider uppercase rounded-bl-xl shadow-md">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>Featured</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-5 sm:p-6">
        {/* Header: Org Logo, Org Name, Category & Bookmark Button */}
        <div className="flex items-start justify-between gap-4 mb-3.5">
          <div className="flex items-center space-x-3">
            {/* Org Logo / Monogram */}
            <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center p-1.5 shadow-sm overflow-hidden flex-shrink-0">
              {opportunity.logo ? (
                <img
                  src={opportunity.logo}
                  alt={opportunity.organization}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback to text initials if broken
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-indigo-900/50 to-slate-800 flex items-center justify-center font-bold text-indigo-300 text-sm">
                  {opportunity.organization.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Org Name & Verified Badge */}
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-xs text-slate-300">
                  {opportunity.organization}
                </span>
                {opportunity.verified && (
                  <span title="Verified by NIMBLUX">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${categoryMeta.bgGradient}`}
                >
                  {categoryMeta.name}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${modeBadge.className}`}
                >
                  {modeBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={saving}
            className={`p-2 rounded-xl border transition-all ${
              saved
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-sm"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
            }`}
            title={saved ? "Remove from saved" : "Save opportunity"}
            aria-label="Save opportunity"
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-indigo-400" : ""}`} />
          </button>
        </div>

        {/* Opportunity Title */}
        <Link href={`/opportunity/${opportunity.slug}`} className="block group-hover:text-indigo-300 transition-colors">
          <h3 className="font-display font-bold text-base sm:text-lg text-white line-clamp-2 leading-snug">
            {opportunity.title}
          </h3>
        </Link>

        {/* Short Description */}
        {!compact && (
          <p className="mt-2 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {opportunity.description}
          </p>
        )}

        {/* Skills Tags */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {skillsList.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700/50"
              >
                {skill}
              </span>
            ))}
            {opportunity.skills && opportunity.skills.split(",").length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-400 font-medium self-center">
                +{opportunity.skills.split(",").length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Action Buttons */}
      <div className="px-5 sm:px-6 py-4 bg-slate-950/60 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Highlights: Stipend / Salary / Deadline */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
          {/* Compensation */}
          {(opportunity.stipend || opportunity.salary) ? (
            <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[140px]">
                {opportunity.stipend || opportunity.salary}
              </span>
            </div>
          ) : (
            <div className="text-slate-400 font-medium">
              {opportunity.registrationFee || "Free Entry"}
            </div>
          )}

          {/* Deadline */}
          <div
            className={`flex items-center space-x-1 font-medium ${
              daysInfo.isUrgent
                ? "text-rose-400 font-semibold"
                : daysInfo.isExpired
                ? "text-slate-500 line-through"
                : "text-slate-400"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{daysInfo.text}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            href={`/opportunity/${opportunity.slug}`}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors text-center"
          >
            View Details
          </Link>
          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApplyClick}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
