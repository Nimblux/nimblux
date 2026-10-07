"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Ticket,
  UserCheck,
  Send,
  Video,
  Lock,
} from "lucide-react";
import { formatDate, getDaysRemaining, getWorkModeBadge, getApplicationStageBadge, getRegistrationStatusBadge, slugify } from "@/lib/utils";
import { formatCurrency } from "@/lib/hackathon";
import { CATEGORIES, OPPORTUNITY_TYPES } from "@/lib/constants";
import ShareModal from "@/components/modals/ShareModal";
import ReportModal from "@/components/modals/ReportModal";
import OpportunityApplyModal from "@/components/modals/OpportunityApplyModal";
import OpportunityRegisterModal from "@/components/modals/OpportunityRegisterModal";
import AuthRequiredModal from "@/components/modals/AuthRequiredModal";
import OpportunityCard, { OpportunityCardData } from "@/components/cards/OpportunityCard";

interface OpportunityDetailProps {
  opportunity: OpportunityCardData & {
    opportunityType?: string;
    isExternal?: boolean;
    externalUrl?: string | null;
    eligibility?: string | null;
    endDate?: string | Date | null;
    contactInfo?: string | null;
    additionalInfo?: string | null;
    department?: string | null;
    duration?: string | null;
    experienceLevel?: string | null;
    responsibilities?: string | null;
    requirements?: string | null;
    benefits?: string | null;
    instructor?: string | null;
    curriculum?: string | null;
    capacity?: number | null;
    price?: string | null;
    currency?: string | null;
    venue?: string | null;
    meetingUrl?: string | null;
    agenda?: string | null;
    customQuestions?: string | null;
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
  initialUser?: any;
}

export default function OpportunityDetailClient({
  opportunity,
  related,
  initialSaved,
  initialUser,
}: OpportunityDetailProps) {
  const searchParams = useSearchParams();
  const actionParam = searchParams.get("action");

  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [intendedAction, setIntendedAction] = useState<"apply" | "register" | null>(null);

  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // In-Platform Participation States
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [userApplication, setUserApplication] = useState<any>(null);
  const [userRegistration, setUserRegistration] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const oppType = (opportunity.opportunityType || opportunity.category || "OTHER").toUpperCase();
  const typeMeta = OPPORTUNITY_TYPES.find((t) => t.type === oppType) || OPPORTUNITY_TYPES[0];
  const isApplicationFlow = typeMeta.modeLabel === "application";
  const isExternal = Boolean(opportunity.isExternal);

  const categoryMeta = CATEGORIES.find(
    (c) => c.slug.toLowerCase() === opportunity.category.toLowerCase()
  ) || {
    name: opportunity.category,
    color: "from-bronze-400 to-bronze-600",
    bgGradient: "bg-white/[0.05] text-[#F5F1E8] border-white/[0.08]",
    dotColor: "bg-[#D8B77A]",
  };

  const daysInfo = getDaysRemaining(opportunity.deadline);
  const modeBadge = getWorkModeBadge(opportunity.mode);

  // Check if current user has already applied / registered
  const checkParticipationStatus = () => {
    setCheckingStatus(true);
    if (isApplicationFlow) {
      fetch(`/api/opportunities/${opportunity.id}/apply`)
        .then((res) => res.json())
        .then((data) => {
          if (data.application) setUserApplication(data.application);
        })
        .catch(() => {})
        .finally(() => setCheckingStatus(false));
    } else {
      fetch(`/api/opportunities/${opportunity.id}/register`)
        .then((res) => res.json())
        .then((data) => {
          if (data.registration) setUserRegistration(data.registration);
        })
        .catch(() => {})
        .finally(() => setCheckingStatus(false));
    }
  };

  useEffect(() => {
    checkParticipationStatus();
  }, [opportunity.id, isApplicationFlow]);

  // If user wasn't passed via SSR initialUser, fetch session
  useEffect(() => {
    if (!currentUser) {
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => {
          if (d.user) setCurrentUser(d.user);
        })
        .catch(() => {});
    }
  }, []);

  // Automatically handle ?action=apply or ?action=register
  useEffect(() => {
    if (!actionParam) return;

    if (actionParam === "apply" && isApplicationFlow) {
      if (currentUser) {
        setApplyModalOpen(true);
      } else {
        setIntendedAction("apply");
        setAuthModalOpen(true);
      }
    } else if (actionParam === "register" && !isApplicationFlow) {
      if (currentUser) {
        setRegisterModalOpen(true);
      } else {
        setIntendedAction("register");
        setAuthModalOpen(true);
      }
    }
  }, [actionParam, currentUser, isApplicationFlow]);

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

  const handleExternalClick = () => {
    fetch(`/api/opportunities/${opportunity.id}/click`, { method: "POST" }).catch(() => {});
  };

  // Primary Action Trigger for Apply
  const handleApplyClick = () => {
    if (!currentUser) {
      setIntendedAction("apply");
      setAuthModalOpen(true);
      return;
    }
    setApplyModalOpen(true);
  };

  // Primary Action Trigger for Register
  const handleRegisterClick = () => {
    if (!currentUser) {
      setIntendedAction("register");
      setAuthModalOpen(true);
      return;
    }
    setRegisterModalOpen(true);
  };

  // When user signs in or registers via the AuthRequiredModal
  const handleAuthenticated = (user: any) => {
    setCurrentUser(user);
    checkParticipationStatus();
    if (intendedAction === "apply") {
      setApplyModalOpen(true);
    } else if (intendedAction === "register") {
      setRegisterModalOpen(true);
    }
    setIntendedAction(null);
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://nimblux.xyz/opportunity/${opportunity.slug}`;

  const skillsList = opportunity.skills
    ? opportunity.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-mono text-[#A9AAA5] mb-6">
        <Link href="/opportunities" className="hover:text-[#F5F1E8] transition-colors">
          Opportunities
        </Link>
        <span>/</span>
        <Link
          href={`/${opportunity.category.toLowerCase()}`}
          className="hover:text-[#F5F1E8] capitalize transition-colors"
        >
          {categoryMeta.name}
        </Link>
        <span>/</span>
        <span className="text-[#F5F1E8] truncate max-w-xs">{opportunity.title}</span>
      </nav>

      {/* Main Grid: Left Details + Right Sticky Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[18px] bg-[#111615] p-6 sm:p-8 border border-white/[0.08] shadow-card">
            {/* Header: Org Logo, Verified, Category, Title */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-[12px] bg-[#0E1110] border border-white/[0.08] p-2 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                {opportunity.logo && !logoError ? (
                  <img
                    src={opportunity.logo}
                    alt={opportunity.organization}
                    className="w-full h-full object-cover rounded-[8px]"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full h-full rounded-[8px] bg-[#151A18] flex items-center justify-center font-bold text-[#D8B77A] text-lg font-mono">
                    {opportunity.organization.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/organizer/${slugify(opportunity.organization)}`}
                    className="text-xs font-mono font-bold text-[#F5F1E8] hover:text-[#D8B77A] transition-colors underline-offset-2 hover:underline"
                  >
                    {opportunity.organization}
                  </Link>
                  {opportunity.verified && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#8FA58E]/10 text-[#8FA58E] border border-[#8FA58E]/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium border font-mono bg-white/[0.05] text-[#F5F1E8] border-white/[0.08]">
                    <span>{categoryMeta.name}</span>
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium ${modeBadge.className}`}
                  >
                    {modeBadge.label}
                  </span>
                </div>

                <h1 className="font-semibold text-2xl sm:text-3xl text-[#F5F1E8] leading-snug tracking-tight">
                  {opportunity.title}
                </h1>
              </div>
            </div>

            {/* Quick Metadata Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-[12px] bg-[#0E1110] border border-white/[0.06] mb-6">
              <div>
                <div className="text-[10.5px] font-mono text-[#7E807B] uppercase tracking-wider">
                  {opportunity.stipend ? "Stipend" : opportunity.salary ? "Salary" : opportunity.price ? "Fee" : "Compensation"}
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#8FA58E] mt-0.5 font-mono truncate">
                  {opportunity.stipend || opportunity.salary || opportunity.price || opportunity.registrationFee || "Free"}
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-mono text-[#7E807B] uppercase tracking-wider">
                  Deadline
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#F5F1E8] mt-0.5 font-mono truncate">
                  {formatDate(opportunity.deadline)}
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-mono text-[#7E807B] uppercase tracking-wider">
                  Location
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#F5F1E8] mt-0.5 truncate">
                  {opportunity.location}
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-mono text-[#7E807B] uppercase tracking-wider">
                  Status
                </div>
                <div
                  className={`text-xs sm:text-sm font-bold mt-0.5 font-mono ${
                    daysInfo.isUrgent ? "text-rose-400" : "text-[#D8B77A]"
                  }`}
                >
                  {daysInfo.text}
                </div>
              </div>
            </div>

            {/* DUPLICATE APPLICATION PROTECTION ALERT */}
            {userApplication && (
              <div className="p-4 rounded-[14px] bg-[#D8B77A]/10 border border-[#D8B77A]/30 my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#D8B77A]/20 text-[#D8B77A] flex items-center justify-center font-bold flex-shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F5F1E8]">
                      You've already applied to this opportunity.
                    </div>
                    <div className="text-[11px] text-[#A9AAA5] font-mono mt-0.5">
                      Current Stage: <span className="text-[#D8B77A] font-bold">{userApplication.status}</span> • Submitted on {formatDate(userApplication.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => setApplyModalOpen(true)}
                    className="px-3 py-1.5 rounded-[8px] text-[11px] font-semibold bg-[#151A18] text-[#F5F1E8] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
                  >
                    View Details
                  </button>
                  <Link
                    href="/dashboard/applications"
                    className="px-3 py-1.5 rounded-[8px] text-[11px] font-semibold bg-[#090B0B] text-[#D8B77A] border border-[#D8B77A]/30 hover:bg-[#D8B77A]/10 transition-colors"
                  >
                    Track Pipeline →
                  </Link>
                </div>
              </div>
            )}

            {/* DUPLICATE REGISTRATION PROTECTION ALERT */}
            {userRegistration && userRegistration.status !== "CANCELLED" && (
              <div className="p-4 rounded-[14px] bg-[#8FA58E]/10 border border-[#8FA58E]/30 my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#8FA58E]/20 text-[#8FA58E] flex items-center justify-center font-bold flex-shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F5F1E8]">
                      You are already registered. 🎟️
                    </div>
                    <div className="text-[11px] text-[#A9AAA5] font-mono mt-0.5">
                      Status: <span className="text-[#8FA58E] font-bold">{userRegistration.status}</span> • {userRegistration.attended ? "Checked In ✓" : "Pass Confirmed"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => setRegisterModalOpen(true)}
                    className="px-3 py-1.5 rounded-[8px] text-[11px] font-semibold bg-[#151A18] text-[#F5F1E8] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
                  >
                    View Pass
                  </button>
                  <Link
                    href="/dashboard/registrations"
                    className="px-3 py-1.5 rounded-[8px] text-[11px] font-semibold bg-[#090B0B] text-[#8FA58E] border border-[#8FA58E]/30 hover:bg-[#8FA58E]/10 transition-colors"
                  >
                    My Registrations →
                  </Link>
                </div>
              </div>
            )}

            {/* Reusable Prize Pool Section */}
            {(opportunity.hasPrizePool || opportunity.totalPrizePool || opportunity.prize1st) && (
              <div className="p-6 rounded-[14px] bg-gradient-to-br from-[#0E1110] via-[#111615] to-[#0E1110] border border-white/[0.08] my-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-[#D8B77A]" />
                    <h2 className="font-semibold text-lg sm:text-xl text-[#F5F1E8]">
                      Prize Pool & Rewards
                    </h2>
                  </div>
                  {opportunity.totalPrizePool && (
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-[8px] bg-[#D8B77A]/15 border border-[#D8B77A]/30 text-[#D8B77A] font-mono font-bold text-xs sm:text-sm">
                      <span>Total Pool: {formatCurrency(opportunity.totalPrizePool, opportunity.prizeCurrency || "INR")}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {opportunity.prize1st && (
                    <div className="p-4 rounded-[10px] bg-[#090B0B] border border-[#D8B77A]/30 text-center space-y-1">
                      <div className="text-xl">🥇</div>
                      <div className="text-[11px] font-mono uppercase text-[#A9AAA5]">1st Place Award</div>
                      <div className="text-sm sm:text-base font-bold text-[#F5F1E8] font-mono">
                        {opportunity.prize1st}
                      </div>
                    </div>
                  )}
                  {opportunity.prize2nd && (
                    <div className="p-4 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-center space-y-1">
                      <div className="text-xl">🥈</div>
                      <div className="text-[11px] font-mono uppercase text-[#A9AAA5]">2nd Place Award</div>
                      <div className="text-sm sm:text-base font-bold text-[#F5F1E8] font-mono">
                        {opportunity.prize2nd}
                      </div>
                    </div>
                  )}
                  {opportunity.prize3rd && (
                    <div className="p-4 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-center space-y-1">
                      <div className="text-xl">🥉</div>
                      <div className="text-[11px] font-mono uppercase text-[#A9AAA5]">3rd Place Award</div>
                      <div className="text-sm sm:text-base font-bold text-[#F5F1E8] font-mono">
                        {opportunity.prize3rd}
                      </div>
                    </div>
                  )}
                </div>

                {opportunity.prizeSpecial && (
                  <div className="p-3 rounded-[10px] bg-[#090B0B] border border-white/[0.06] text-xs text-[#A9AAA5] flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[#D8B77A] flex-shrink-0" />
                    <span><strong className="text-[#F5F1E8]">Special Category Track:</strong> {opportunity.prizeSpecial}</span>
                  </div>
                )}
              </div>
            )}

            {/* Banner Image */}
            {opportunity.banner && (
              <div className="rounded-[12px] overflow-hidden my-6 max-h-80 border border-white/[0.08]">
                <img
                  src={opportunity.banner}
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Section: Instructor / Speaker */}
            {opportunity.instructor && (
              <div className="p-4 rounded-[12px] bg-[#0E1110] border border-white/[0.06] my-6 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#D8B77A]/15 text-[#D8B77A] flex items-center justify-center font-bold font-mono">
                  👨‍🏫
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[#7E807B] uppercase tracking-wider">
                    Instructor / Speaker
                  </div>
                  <div className="text-sm font-bold text-[#F5F1E8]">
                    {opportunity.instructor}
                  </div>
                </div>
              </div>
            )}

            {/* Section: Full Description */}
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <h2 className="font-bold text-base text-[#F5F1E8]">
                About the Opportunity
              </h2>
              <div className="text-xs sm:text-sm text-[#A9AAA5] leading-relaxed whitespace-pre-line">
                {opportunity.description}
              </div>
            </div>

            {/* Section: Eligibility */}
            {opportunity.eligibility && (
              <div className="space-y-3 pt-6 border-t border-white/[0.06] mt-6">
                <h2 className="font-bold text-base text-[#F5F1E8] flex items-center space-x-2">
                  <GraduationCap className="w-4.5 h-4.5 text-[#D8B77A]" />
                  <span>Eligibility & Criteria</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#A9AAA5] leading-relaxed">
                  {opportunity.eligibility}
                </p>
              </div>
            )}

            {/* Section: Skills */}
            {skillsList.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-white/[0.06] mt-6">
                <h2 className="font-bold text-base text-[#F5F1E8]">
                  Skills & Technologies Required
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-[6px] text-xs font-medium bg-[#0E1110] text-[#D6D5CD] border border-white/[0.06]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Important Dates */}
            <div className="space-y-3 pt-6 border-t border-white/[0.06] mt-6">
              <h2 className="font-bold text-base text-[#F5F1E8] flex items-center space-x-2">
                <Calendar className="w-4.5 h-4.5 text-[#8FA58E]" />
                <span>Important Timeline</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-[10px] bg-[#0E1110] border border-white/[0.06]">
                  <span className="text-[#7E807B] block font-mono text-[11px]">Application Closes:</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#F5F1E8] mt-0.5 block font-mono">
                    {formatDate(opportunity.deadline)}
                  </span>
                </div>
                {opportunity.startDate && (
                  <div className="p-3 rounded-[10px] bg-[#0E1110] border border-white/[0.06]">
                    <span className="text-[#7E807B] block font-mono text-[11px]">Program Start Date:</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#F5F1E8] mt-0.5 block font-mono">
                      {formatDate(opportunity.startDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Additional & Contact */}
            {(opportunity.additionalInfo || opportunity.contactInfo) && (
              <div className="space-y-3 pt-6 border-t border-white/[0.06] mt-6">
                <h2 className="font-bold text-base text-[#F5F1E8]">
                  Additional Information
                </h2>
                {opportunity.additionalInfo && (
                  <p className="text-xs sm:text-sm text-[#A9AAA5] leading-relaxed">
                    {opportunity.additionalInfo}
                  </p>
                )}
                {opportunity.contactInfo && (
                  <div className="flex items-center space-x-2 text-xs text-[#D8B77A] pt-1 font-mono">
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
          <div className="rounded-[18px] bg-[#111615] p-6 border border-white/[0.08] space-y-4 shadow-card">
            {/* Primary Action Button: Auth Protected */}
            {isExternal ? (
              <a
                href={opportunity.externalUrl || opportunity.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleExternalClick}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-[9px] font-semibold text-xs sm:text-sm text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all text-center"
              >
                <span>Apply on Official Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : isApplicationFlow ? (
              <button
                type="button"
                onClick={handleApplyClick}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-[9px] font-semibold text-xs sm:text-sm text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all text-center"
              >
                <Send className="w-4 h-4" />
                <span>
                  {userApplication
                    ? "View Submitted Application"
                    : currentUser
                    ? "Apply on NIMBLUX"
                    : "Apply Now"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegisterClick}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-[9px] font-semibold text-xs sm:text-sm text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all text-center"
              >
                <Ticket className="w-4 h-4" />
                <span>
                  {userRegistration && userRegistration.status !== "CANCELLED"
                    ? "Registered 🎟️ (Manage Pass)"
                    : currentUser
                    ? "Register for Free"
                    : "Register Now"}
                </span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBookmark}
                disabled={saving}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-[8px] text-xs font-semibold border transition-all ${
                  saved
                    ? "bg-[#D8B77A]/15 text-[#D8B77A] border-[#D8B77A]/30"
                    : "bg-[#0E1110] text-[#A9AAA5] border-white/[0.06] hover:text-[#F5F1E8] hover:border-white/[0.12]"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#D8B77A]" : ""}`} />
                <span>{saved ? "Saved" : "Save"}</span>
              </button>

              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center justify-center space-x-2 py-2 px-4 rounded-[8px] text-xs font-semibold bg-[#0E1110] text-[#A9AAA5] border border-white/[0.06] hover:text-[#F5F1E8] hover:border-white/[0.12] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center space-x-1.5 text-[#7E807B] hover:text-rose-400 transition-colors text-[11px]"
              >
                <Flag className="w-3 h-3" />
                <span>Report listing issue</span>
              </button>
            </div>
          </div>

          {/* Verification Box */}
          <div className="rounded-[18px] bg-[#111615] p-5 border border-white/[0.08] space-y-2.5 shadow-card">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#F5F1E8] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#8FA58E]" />
              <span>Verified Host Listing</span>
            </div>
            <p className="text-xs text-[#A9AAA5] leading-relaxed">
              {isExternal
                ? "This listing is verified by NIMBLUX. Applications are submitted on the external host website."
                : "This listing accepts native in-platform applications directly on NIMBLUX."}
            </p>
            <div className="pt-1">
              <Link
                href={`/organizer/${slugify(opportunity.organization)}`}
                className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#D8B77A] hover:text-[#E7D5B2] transition-colors"
              >
                <span>View {opportunity.organization} Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            {opportunity.createdBy && (
              <div className="pt-3 border-t border-white/[0.06] flex items-center space-x-2.5 text-xs text-[#A9AAA5]">
                <div className="w-6 h-6 rounded-full bg-[#D8B77A]/20 text-[#D8B77A] flex items-center justify-center font-bold text-[10px] font-mono">
                  {opportunity.createdBy.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[#F5F1E8] font-medium">{opportunity.createdBy.name}</div>
                  {opportunity.createdBy.college && (
                    <div className="text-[10px] text-[#7E807B]">{opportunity.createdBy.college}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Opportunities */}
      {related.length > 0 && (
        <div className="mt-16 pt-12 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 text-[#D8B77A] text-xs font-mono uppercase tracking-wider mb-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Similar Opportunities</span>
              </div>
              <h2 className="font-semibold text-2xl text-[#F5F1E8] tracking-tight">
                More in {categoryMeta.name}
              </h2>
            </div>
            <Link
              href={`/${opportunity.category.toLowerCase()}`}
              className="text-xs font-semibold text-[#D8B77A] hover:text-[#E7D5B2] transition-colors"
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

      {/* Auth Required Modal (Intercepts unauthenticated users) */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Please sign in to continue."
        actionName={isApplicationFlow ? `apply for "${opportunity.title}"` : `register for "${opportunity.title}"`}
        redirectUrl={`/opportunity/${opportunity.slug}?action=${isApplicationFlow ? "apply" : "register"}`}
        onAuthenticated={handleAuthenticated}
      />

      {/* In-Platform Modals */}
      <OpportunityApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        opportunity={opportunity}
        onSuccess={checkParticipationStatus}
        onRequestAuth={() => setAuthModalOpen(true)}
      />

      <OpportunityRegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        opportunity={opportunity}
        onSuccess={checkParticipationStatus}
        onRequestAuth={() => setAuthModalOpen(true)}
      />

      {/* Share & Report Modals */}
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
