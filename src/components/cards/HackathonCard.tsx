"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { formatCurrency, getParticipationModeBadge, getHackathonStatusBadge } from "@/lib/hackathon";

export interface HackathonCardData {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  shortDescription: string;
  coverImage?: string | null;
  logo?: string | null;
  organizerName: string;
  organizerLogo?: string | null;
  mode: string;
  location: string;
  startDate: string | Date;
  endDate: string | Date;
  regEndDate: string | Date;
  submissionDeadline: string | Date;
  hasPrizePool: boolean;
  totalPrizePool?: string | null;
  prizeCurrency: string;
  status: string;
  featured?: boolean;
  verified?: boolean;
  registrationCount?: number;
  teamCount?: number;
  submissionCount?: number;
  isUserRegistered?: boolean;
  isExternalRegistration?: boolean;
  externalRegistrationUrl?: string | null;
}

interface HackathonCardProps {
  hackathon: HackathonCardData;
  compact?: boolean;
}

export default function HackathonCard({ hackathon, compact = false }: HackathonCardProps) {
  const daysInfo = getDaysRemaining(hackathon.regEndDate);
  const modeBadge = getParticipationModeBadge(hackathon.mode);
  const statusBadge = getHackathonStatusBadge(hackathon.status);

  return (
    <article
      className={`group relative rounded-3xl bg-charcoal-card border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        hackathon.featured
          ? "border-bronze-500/40 bg-gradient-to-b from-charcoal-850 via-charcoal-card to-charcoal-card shadow-editorial hover:border-bronze-400"
          : "border-charcoal-cardBorder hover:border-bronze-500/30 hover:shadow-card-hover"
      }`}
    >
      {/* Cover Image & Header Badges */}
      <div className="relative h-44 sm:h-48 w-full bg-charcoal-900 overflow-hidden border-b border-charcoal-cardBorder/60">
        {hackathon.coverImage ? (
          <img
            src={hackathon.coverImage}
            alt={hackathon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-charcoal-950 via-charcoal-900 to-forest-900/30 flex items-center justify-center p-6 text-center">
            <div className="space-y-1">
              <Trophy className="w-8 h-8 text-bronze-400/60 mx-auto" />
              <div className="font-serif-heading text-ivory-300 text-lg font-medium">
                {hackathon.title}
              </div>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-card via-charcoal-card/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center space-x-1.5">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10.5px] font-semibold backdrop-blur-md shadow-sm ${modeBadge.className}`}
            >
              {modeBadge.label}
            </span>
            {hackathon.status === "COMPLETED" && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10.5px] font-semibold bg-sage-500/20 text-sage-200 border border-sage-500/30 backdrop-blur-md">
                Concluded
              </span>
            )}
          </div>

          {hackathon.featured && (
            <div className="inline-flex items-center space-x-1 px-3 py-1 bg-bronze-500 text-charcoal-950 text-[10px] font-mono font-bold tracking-wider uppercase rounded-xl shadow-button">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Featured</span>
            </div>
          )}
        </div>

        {/* Floating Organizer Avatar */}
        <div className="absolute bottom-3 left-4 flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder/80 p-1 shadow-card flex items-center justify-center overflow-hidden flex-shrink-0">
            {hackathon.organizerLogo ? (
              <img
                src={hackathon.organizerLogo}
                alt={hackathon.organizerName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-bronze-500/20 text-bronze-300 font-bold text-xs flex items-center justify-center font-mono">
                {hackathon.organizerName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-xs text-ivory-200 truncate drop-shadow-sm">
                {hackathon.organizerName}
              </span>
              {hackathon.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-sage-400 flex-shrink-0" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Hackathon Title */}
          <Link
            href={`/hackathon/${hackathon.slug}`}
            className="block group/title focus:outline-none"
          >
            <h3 className="font-serif-heading font-medium text-lg sm:text-xl text-ivory-100 group-hover/title:text-bronze-300 transition-colors line-clamp-2 leading-tight">
              {hackathon.title}
            </h3>
          </Link>

          {/* Tagline / Short Description */}
          <p className="mt-2 text-xs text-ivory-400 line-clamp-2 leading-relaxed">
            {hackathon.tagline || hackathon.shortDescription}
          </p>

          {/* Prize Pool Spotlight */}
          {hackathon.hasPrizePool && hackathon.totalPrizePool && (
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-bronze-500/10 to-transparent border border-amber-500/25 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">🏆</span>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-ivory-500 font-semibold">
                    Total Prize Pool
                  </div>
                  <div className="text-sm font-bold text-amber-300 font-mono">
                    {formatCurrency(hackathon.totalPrizePool, hackathon.prizeCurrency)}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-bronze-400 px-2 py-0.5 rounded-md bg-bronze-500/15 border border-bronze-500/30">
                Prizes & Perks
              </span>
            </div>
          )}
        </div>

        {/* Dates & Participation Counts */}
        <div className="mt-5 pt-4 border-t border-charcoal-cardBorder/60 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-ivory-400 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-forest-400" />
              <span>{formatDate(hackathon.startDate)} — {formatDate(hackathon.endDate)}</span>
            </div>
            {hackathon.registrationCount !== undefined && (
              <div className="flex items-center space-x-1 text-ivory-500">
                <Users className="w-3.5 h-3.5" />
                <span>{hackathon.registrationCount} registered</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info & Registration Action */}
      <div className="px-5 sm:px-6 py-3.5 bg-charcoal-950/70 border-t border-charcoal-cardBorder flex items-center justify-between gap-3">
        {/* Deadline Status */}
        <div
          className={`flex items-center space-x-1.5 font-mono text-[11px] ${
            daysInfo.isUrgent
              ? "text-rose-400 font-semibold"
              : daysInfo.isExpired
              ? "text-ivory-500"
              : "text-bronze-300"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Reg: {daysInfo.text}</span>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-2">
          {hackathon.isUserRegistered ? (
            <Link
              href={`/hackathon/${hackathon.slug}`}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-forest-300 bg-forest-500/15 border border-forest-500/30 hover:bg-forest-500/25 transition-all"
            >
              <span>Registered ✅</span>
            </Link>
          ) : (
            <Link
              href={`/hackathon/${hackathon.slug}`}
              className="inline-flex items-center space-x-1 px-4 py-1.5 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
            >
              <span>Details</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
