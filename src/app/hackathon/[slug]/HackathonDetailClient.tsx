"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  Globe,
  Share2,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  PlusCircle,
  FileCode,
  Github,
  Video,
  Presentation,
  Flame,
  AlertCircle,
  MessageSquare,
  Building,
  Check,
  X,
  Lock,
  ArrowRight,
} from "lucide-react";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { formatCurrency, getParticipationModeBadge, getHackathonStatusBadge } from "@/lib/hackathon";
import ShareModal from "@/components/modals/ShareModal";

interface HackathonDetailProps {
  hackathon: any;
  userState: {
    isRegistered: boolean;
    registration: any;
    team: any;
    submission: any;
    isOrganizer: boolean;
    isAdmin: boolean;
    isJudge: boolean;
  };
  currentUser: any;
}

export default function HackathonDetailClient({
  hackathon,
  userState,
  currentUser,
}: HackathonDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [shareOpen, setShareOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Registration Form State prefilled from current user
  const [regForm, setRegForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    college: currentUser?.college || "",
    degree: currentUser?.degree || "",
    graduationYear: currentUser?.graduationYear || "",
    skills: currentUser?.skills || "",
    githubUrl: currentUser?.githubUrl || "",
    linkedinUrl: currentUser?.linkedinUrl || "",
    portfolioUrl: currentUser?.portfolioUrl || "",
  });

  const daysInfo = getDaysRemaining(hackathon.regEndDate);
  const modeBadge = getParticipationModeBadge(hackathon.mode);
  const statusBadge = getHackathonStatusBadge(hackathon.status);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegistering(true);

    try {
      const res = await fetch(`/api/hackathons/${hackathon.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register for hackathon.");
      }

      setRegSuccess(true);
      setTimeout(() => {
        setRegisterModalOpen(false);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setRegError(err.message || "An error occurred during registration.");
    } finally {
      setRegistering(false);
    }
  };

  const navTabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "tracks", label: `Tracks (${hackathon.tracks?.length || 0})` },
    { id: "prizes", label: "Prize Pool" },
    { id: "rules", label: "Rules & Criteria" },
    ...(hackathon.announcements?.length > 0
      ? [{ id: "announcements", label: `Updates (${hackathon.announcements.length})` }]
      : []),
    ...(hackathon.isLeaderboardPublished
      ? [{ id: "leaderboard", label: "Leaderboard 🏆" }]
      : []),
    ...(hackathon.winners?.length > 0
      ? [{ id: "winners", label: "Winners 🥇" }]
      : []),
    ...(hackathon.sponsors?.length > 0
      ? [{ id: "sponsors", label: "Sponsors" }]
      : []),
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-mono text-ivory-500">
        <Link href="/hackathons" className="hover:text-ivory-200 transition-colors">
          Hackathons
        </Link>
        <span>/</span>
        <span className="text-ivory-300 truncate max-w-sm">{hackathon.title}</span>
      </nav>

      {/* 1. HERO BANNER */}
      <section className="relative rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card overflow-hidden">
        {/* Cover Image */}
        {hackathon.coverImage && (
          <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-charcoal-cardBorder">
            <img
              src={hackathon.coverImage}
              alt={hackathon.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-card via-charcoal-card/40 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-6">
          {/* Header row: Organizer branding & status badges */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder p-1.5 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                {hackathon.organizerLogo ? (
                  <img
                    src={hackathon.organizerLogo}
                    alt={hackathon.organizerName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-bronze-500/15 flex items-center justify-center font-bold text-bronze-300 text-sm font-mono">
                    {hackathon.organizerName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-ivory-300">
                    Organized by <strong className="text-ivory-100">{hackathon.organizerName}</strong>
                  </span>
                  {hackathon.verified && (
                    <span title="Verified by NIMBLUX">
                      <ShieldCheck className="w-4 h-4 text-sage-400" />
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold ${modeBadge.className}`}>
                    {modeBadge.label}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10.5px] font-mono bg-charcoal-900 text-ivory-300 border border-charcoal-cardBorder">
                    {hackathon.location}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10.5px] font-mono bg-bronze-500/10 text-bronze-300 border border-bronze-500/20">
                    Team: {hackathon.minTeamSize}-{hackathon.maxTeamSize} Members
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Share, Manage) */}
            <div className="flex items-center space-x-2 self-start">
              {userState.isOrganizer && (
                <Link
                  href={`/organizer/hackathons/${hackathon.id}`}
                  className="px-4 py-2 rounded-xl bg-bronze-500/15 hover:bg-bronze-500/25 border border-bronze-500/30 text-bronze-300 text-xs font-semibold transition-colors"
                >
                  Organizer Console ⚙️
                </Link>
              )}
              {userState.isJudge && (
                <Link
                  href={`/hackathon/${hackathon.slug}/judge`}
                  className="px-4 py-2 rounded-xl bg-forest-500/15 hover:bg-forest-500/25 border border-forest-500/30 text-forest-300 text-xs font-semibold transition-colors"
                >
                  Judging Portal ⚖️
                </Link>
              )}
              <button
                onClick={() => setShareOpen(true)}
                className="p-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-cardBorder text-ivory-300 hover:text-white transition-colors"
                title="Share hackathon"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Tagline */}
          <div>
            <h1 className="font-serif-heading font-medium text-3xl sm:text-4xl lg:text-5xl text-ivory-100 leading-tight">
              {hackathon.title}
            </h1>
            {hackathon.tagline && (
              <p className="mt-2.5 text-sm sm:text-base text-ivory-300 font-normal">
                {hackathon.tagline}
              </p>
            )}
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-ivory-500">
                Prize Pool
              </div>
              <div className="text-sm sm:text-base font-bold text-amber-300 font-mono mt-0.5">
                {hackathon.totalPrizePool
                  ? formatCurrency(hackathon.totalPrizePool, hackathon.prizeCurrency)
                  : "Certificates & Swag"}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-ivory-500">
                Registration Deadline
              </div>
              <div className={`text-xs sm:text-sm font-bold font-mono mt-0.5 ${daysInfo.isUrgent ? "text-rose-400" : "text-ivory-100"}`}>
                {formatDate(hackathon.regEndDate)} ({daysInfo.text})
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-ivory-500">
                Hackathon Dates
              </div>
              <div className="text-xs sm:text-sm font-bold text-ivory-200 font-mono mt-0.5">
                {formatDate(hackathon.startDate)} — {formatDate(hackathon.endDate)}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-ivory-500">
                Community
              </div>
              <div className="text-xs sm:text-sm font-bold text-forest-300 font-mono mt-0.5">
                {hackathon.registrationCount || 0} Registered • {hackathon.teamCount || 0} Teams
              </div>
            </div>
          </div>

          {/* Primary Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {hackathon.isExternalRegistration && hackathon.externalRegistrationUrl ? (
              <a
                href={hackathon.externalRegistrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
              >
                <span>Register Externally</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : userState.isRegistered ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-forest-300 bg-forest-500/15 border border-forest-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You Are Registered!</span>
                </div>

                <Link
                  href="/dashboard/hackathons"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
                >
                  <span>Go to My Hackathons Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!currentUser) {
                    router.push(`/login?redirect=/hackathon/${hackathon.slug}`);
                  } else {
                    setRegisterModalOpen(true);
                  }
                }}
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Register for Hackathon (Free)</span>
              </button>
            )}

            {hackathon.discordUrl && (
              <a
                href={hackathon.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl font-semibold text-xs text-ivory-200 bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-cardBorder transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Join Discord Community</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-charcoal-cardBorder scrollbar-none sticky top-20 z-30 bg-charcoal-950/90 backdrop-blur-md pt-2">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-bronze-500 text-charcoal-950 shadow-button"
                : "bg-charcoal-card text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-900 border border-charcoal-cardBorder"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. TAB CONTENTS */}
      <div className="space-y-8">
        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About description */}
              <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4">
                <h2 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100">
                  About {hackathon.title}
                </h2>
                <div className="text-xs sm:text-sm text-ivory-300 leading-relaxed whitespace-pre-line">
                  {hackathon.description}
                </div>
              </div>

              {/* Tracks preview */}
              {hackathon.tracks?.length > 0 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4">
                  <h2 className="font-serif-heading font-medium text-xl text-ivory-100 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-bronze-400" />
                    <span>Hackathon Tracks & Themes</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hackathon.tracks.map((track: any) => (
                      <div
                        key={track.id}
                        className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-2"
                      >
                        <div className="font-bold text-xs sm:text-sm text-ivory-100">
                          {track.name}
                        </div>
                        {track.description && (
                          <p className="text-xs text-ivory-400 line-clamp-3">
                            {track.description}
                          </p>
                        )}
                        {track.prize && (
                          <div className="text-[11px] font-mono font-bold text-amber-300">
                            🏆 Track Prize: {track.prize}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Organizer Profile Card */}
              <div className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-3">
                <h3 className="text-xs font-bold text-ivory-100 font-mono uppercase tracking-wider">
                  Hosted by
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder p-1 flex items-center justify-center">
                    {hackathon.organizerLogo ? (
                      <img src={hackathon.organizerLogo} alt={hackathon.organizerName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="font-bold text-bronze-300 text-xs font-mono">{hackathon.organizerName.slice(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-ivory-100">{hackathon.organizerName}</div>
                    <div className="text-[10px] text-ivory-500 font-mono">{hackathon.contactEmail}</div>
                  </div>
                </div>
                {hackathon.organizerDescription && (
                  <p className="text-xs text-ivory-400 leading-relaxed pt-2 border-t border-charcoal-cardBorder">
                    {hackathon.organizerDescription}
                  </p>
                )}
              </div>

              {/* Eligibility card */}
              <div className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-3">
                <h3 className="text-xs font-bold text-ivory-100 font-mono uppercase tracking-wider">
                  Participation Eligibility
                </h3>
                <div className="space-y-2 text-xs text-ivory-300">
                  <div>
                    <span className="text-ivory-500 block text-[10.5px]">Experience Level:</span>
                    <span className="font-semibold text-ivory-200 capitalize">{hackathon.experienceLevel.toLowerCase()}</span>
                  </div>
                  <div>
                    <span className="text-ivory-500 block text-[10.5px]">Team Size:</span>
                    <span className="font-semibold text-ivory-200">{hackathon.minTeamSize} to {hackathon.maxTeamSize} builders</span>
                  </div>
                  {hackathon.eligibility && (
                    <div className="pt-2 border-t border-charcoal-cardBorder">
                      <span className="text-ivory-500 block text-[10.5px]">Requirements:</span>
                      <p className="text-xs text-ivory-400 mt-0.5">{hackathon.eligibility}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TIMELINE */}
        {activeTab === "timeline" && (
          <div className="p-6 sm:p-10 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-6">
            <div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                Hackathon Schedule & Milestones
              </h2>
              <p className="text-xs text-ivory-500 mt-1">
                Mark your calendar for all critical registration, hacking, and judging deadlines.
              </p>
            </div>

            <div className="relative border-l-2 border-charcoal-800 ml-4 sm:ml-6 space-y-8 py-4">
              {/* Milestone 1: Registration Opening */}
              <div className="relative pl-6 sm:pl-8">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-forest-500 border-4 border-charcoal-card" />
                <div className="text-[11px] font-mono text-forest-400 font-semibold uppercase tracking-wider">
                  Registration Window
                </div>
                <div className="font-bold text-sm text-ivory-100 mt-0.5">
                  {formatDate(hackathon.regStartDate)} — {formatDate(hackathon.regEndDate)}
                </div>
                <p className="text-xs text-ivory-400 mt-1">
                  Builders register and form teams before registration closes.
                </p>
              </div>

              {/* Milestone 2: Hackathon Window */}
              <div className="relative pl-6 sm:pl-8">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-bronze-400 border-4 border-charcoal-card" />
                <div className="text-[11px] font-mono text-bronze-400 font-semibold uppercase tracking-wider">
                  Hacking Window
                </div>
                <div className="font-bold text-sm text-ivory-100 mt-0.5">
                  {formatDate(hackathon.startDate)} — {formatDate(hackathon.endDate)}
                </div>
                <p className="text-xs text-ivory-400 mt-1">
                  Build and prototype your solution with your team.
                </p>
              </div>

              {/* Milestone 3: Submission Deadline */}
              <div className="relative pl-6 sm:pl-8">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-rose-400 border-4 border-charcoal-card" />
                <div className="text-[11px] font-mono text-rose-400 font-semibold uppercase tracking-wider">
                  Submission Deadline
                </div>
                <div className="font-bold text-sm text-ivory-100 mt-0.5">
                  {formatDate(hackathon.submissionDeadline)}
                </div>
                <p className="text-xs text-ivory-400 mt-1">
                  All repositories, demo links, and video walkthroughs must be submitted directly on NIMBLUX.
                </p>
              </div>

              {/* Milestone 4: Judging Window */}
              {hackathon.judgingStartDate && (
                <div className="relative pl-6 sm:pl-8">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-400 border-4 border-charcoal-card" />
                  <div className="text-[11px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
                    Judging & Scoring
                  </div>
                  <div className="font-bold text-sm text-ivory-100 mt-0.5">
                    {formatDate(hackathon.judgingStartDate)} — {formatDate(hackathon.judgingEndDate)}
                  </div>
                  <p className="text-xs text-ivory-400 mt-1">
                    Judges evaluate submissions across innovation, code quality, and impact criteria.
                  </p>
                </div>
              )}

              {/* Milestone 5: Winner Announcement */}
              {hackathon.winnersAnnouncedDate && (
                <div className="relative pl-6 sm:pl-8">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-forest-400 border-4 border-charcoal-card" />
                  <div className="text-[11px] font-mono text-forest-400 font-semibold uppercase tracking-wider">
                    Results & Winner Announcement 🏆
                  </div>
                  <div className="font-bold text-sm text-ivory-100 mt-0.5">
                    {formatDate(hackathon.winnersAnnouncedDate)}
                  </div>
                  <p className="text-xs text-ivory-400 mt-1">
                    Winners published, prize pool distributed, and certificates generated.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: TRACKS */}
        {activeTab === "tracks" && (
          <div className="p-6 sm:p-10 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-6">
            <div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                Hackathon Tracks & Problem Statements
              </h2>
              <p className="text-xs text-ivory-500 mt-1">
                Choose a track that aligns with your team's expertise and project vision.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {hackathon.tracks?.map((track: any) => (
                <div
                  key={track.id}
                  className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif-heading font-medium text-lg text-ivory-100">
                        {track.name}
                      </h3>
                      {track.prize && (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          🏆 {track.prize}
                        </span>
                      )}
                    </div>
                    {track.description && (
                      <p className="text-xs text-ivory-400 leading-relaxed">
                        {track.description}
                      </p>
                    )}
                    {track.problemStatement && (
                      <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder/80 space-y-1 mt-3">
                        <div className="text-[10px] font-mono text-bronze-300 uppercase tracking-wider font-semibold">
                          Problem Statement
                        </div>
                        <p className="text-xs text-ivory-300 leading-relaxed">
                          {track.problemStatement}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PRIZES */}
        {activeTab === "prizes" && (
          <div className="p-6 sm:p-10 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-8">
            {/* Total Prize Pool Spotlight Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500/15 via-bronze-500/10 to-charcoal-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                  <Trophy className="w-4 h-4" />
                  <span>Official Prize Pool</span>
                </div>
                <div className="font-serif-heading font-medium text-3xl sm:text-4xl text-ivory-100">
                  {hackathon.totalPrizePool
                    ? `${formatCurrency(hackathon.totalPrizePool, hackathon.prizeCurrency)} Total Prize Pool`
                    : "Prizes & Recognition"}
                </div>
                <p className="text-xs text-ivory-400 mt-1">
                  Rewarding innovation, technical execution, design excellence, and community impact.
                </p>
              </div>

              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  📜 Verifiable Certificates Included
                </span>
              </div>
            </div>

            {/* Main Prize Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {hackathon.prizes?.map((prize: any) => (
                <div
                  key={prize.id}
                  className={`p-6 rounded-2xl bg-charcoal-900 border space-y-3 text-center flex flex-col justify-between ${
                    prize.type === "1ST"
                      ? "border-amber-500/40 shadow-editorial"
                      : prize.type === "2ND"
                      ? "border-stone-400/30"
                      : "border-bronze-500/30"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="text-3xl">
                      {prize.type === "1ST" ? "🥇" : prize.type === "2ND" ? "🥈" : prize.type === "3RD" ? "🥉" : "🏅"}
                    </div>
                    <h3 className="font-serif-heading font-medium text-lg text-ivory-100">
                      {prize.name}
                    </h3>
                    {prize.amount && (
                      <div className="text-xl sm:text-2xl font-bold text-amber-300 font-mono">
                        {formatCurrency(prize.amount, prize.currency)}
                      </div>
                    )}
                    {prize.description && (
                      <p className="text-xs text-ivory-400">{prize.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-charcoal-cardBorder text-[11px] text-ivory-500 font-mono space-y-1">
                    {prize.physicalReward && <div>🎁 {prize.physicalReward}</div>}
                    {prize.additionalBenefits && <div>✨ {prize.additionalBenefits}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: RULES & CRITERIA */}
        {activeTab === "rules" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rules */}
            <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4">
              <h2 className="font-serif-heading font-medium text-xl text-ivory-100">
                Hackathon Rules & Guidelines
              </h2>
              <div className="text-xs sm:text-sm text-ivory-300 leading-relaxed whitespace-pre-line">
                {hackathon.rules || "All projects must be built during the official hacking window. Open-source libraries and APIs are permitted with proper attribution."}
              </div>
              {hackathon.submissionRequirements && (
                <div className="pt-4 border-t border-charcoal-cardBorder space-y-2">
                  <h3 className="text-xs font-bold text-ivory-100 font-mono uppercase">Submission Requirements</h3>
                  <p className="text-xs text-ivory-400 whitespace-pre-line">{hackathon.submissionRequirements}</p>
                </div>
              )}
            </div>

            {/* Judging Criteria */}
            <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4">
              <h2 className="font-serif-heading font-medium text-xl text-ivory-100">
                Judging Criteria & Weights
              </h2>
              <div className="space-y-3">
                {hackathon.criteria?.map((crit: any) => (
                  <div key={crit.id} className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-ivory-100">{crit.name}</span>
                      <span className="text-[11px] font-mono text-bronze-300 font-semibold">
                        Max {crit.maxScore} pts (Weight: {crit.weight}x)
                      </span>
                    </div>
                    {crit.description && (
                      <p className="text-xs text-ivory-400 mt-1">{crit.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ANNOUNCEMENTS */}
        {activeTab === "announcements" && (
          <div className="p-6 sm:p-10 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-6">
            <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
              Live Announcements
            </h2>
            <div className="space-y-4">
              {hackathon.announcements?.map((ann: any) => (
                <div
                  key={ann.id}
                  className={`p-5 rounded-2xl bg-charcoal-900 border space-y-2 ${
                    ann.pinned ? "border-bronze-500/40 bg-bronze-500/5" : "border-charcoal-cardBorder"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {ann.pinned && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bronze-500 text-charcoal-950">
                          PINNED
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-ivory-100">{ann.title}</h3>
                    </div>
                    <span className="text-[11px] font-mono text-ivory-500">{formatDate(ann.createdAt)}</span>
                  </div>
                  <p className="text-xs text-ivory-300 leading-relaxed whitespace-pre-line">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="p-6 sm:p-10 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-6">
            <div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                Official Hackathon Leaderboard
              </h2>
              <p className="text-xs text-ivory-500 mt-1">
                Final scored standings based on judge evaluations across all criteria.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-charcoal-950/80 text-ivory-500 uppercase tracking-wider text-[10px] font-mono border-b border-charcoal-cardBorder">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Team & Project</th>
                    <th className="py-3 px-4">Track</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4 text-right">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-cardBorder/60">
                  {hackathon.winners?.map((w: any, idx: number) => (
                    <tr key={w.id} className="hover:bg-charcoal-900/40">
                      <td className="py-4 px-4 font-mono font-bold text-sm">
                        {idx === 0 ? "🥇 1" : idx === 1 ? "🥈 2" : idx === 2 ? "🥉 3" : `#${idx + 1}`}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-ivory-100 text-sm">
                          {w.submission?.title || w.title}
                        </div>
                        <div className="text-[11px] text-ivory-400 mt-0.5">
                          {w.team?.name || "Independent Builder"} • {w.title}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-ivory-400">
                        {w.submission?.track?.name || "General Track"}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-amber-300">
                        {w.submission?.totalScore || "Evaluated"}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        {w.submission?.githubUrl && (
                          <a href={w.submission.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-charcoal-900 text-ivory-300 inline-block">
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {w.submission?.demoUrl && (
                          <a href={w.submission.demoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-charcoal-900 text-bronze-300 inline-block">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: WINNERS */}
        {activeTab === "winners" && (
          <div className="p-6 sm:p-10 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="text-3xl">🏆</div>
              <h2 className="font-serif-heading font-medium text-3xl text-ivory-100">
                Hackathon Winners Showcase
              </h2>
              <p className="text-xs sm:text-sm text-ivory-400">
                Congratulations to the standout builders and teams who excelled in {hackathon.title}!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {hackathon.winners?.map((winner: any) => (
                <div
                  key={winner.id}
                  className="p-6 rounded-3xl bg-gradient-to-b from-charcoal-900 via-charcoal-card to-charcoal-card border border-amber-500/30 text-center space-y-4 shadow-editorial"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl">
                    {winner.rank === 1 ? "🥇" : winner.rank === 2 ? "🥈" : "🥉"}
                  </div>

                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      {winner.title}
                    </div>
                    <h3 className="font-serif-heading font-medium text-xl text-ivory-100 mt-1">
                      {winner.submission?.title || "Winner Project"}
                    </h3>
                    <div className="text-xs text-ivory-400 mt-1">
                      Team: <strong className="text-ivory-200">{winner.team?.name || "Independent"}</strong>
                    </div>
                  </div>

                  {winner.prizeAmount && (
                    <div className="py-2 px-3 rounded-xl bg-charcoal-950 border border-charcoal-cardBorder font-mono font-bold text-amber-300 text-sm">
                      {formatCurrency(winner.prizeAmount, winner.currency)}
                    </div>
                  )}

                  {winner.submission?.githubUrl && (
                    <div className="pt-2 border-t border-charcoal-cardBorder flex items-center justify-center space-x-2">
                      <a
                        href={winner.submission.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-bronze-300 hover:underline font-mono"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: SPONSORS */}
        {activeTab === "sponsors" && (
          <div className="p-6 sm:p-10 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-6">
            <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
              Community & Corporate Sponsors
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {hackathon.sponsors?.map((sponsor: any) => (
                <div
                  key={sponsor.id}
                  className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder text-center space-y-2 flex flex-col items-center justify-center"
                >
                  {sponsor.logo ? (
                    <img src={sponsor.logo} alt={sponsor.name} className="h-10 object-contain mx-auto" />
                  ) : (
                    <div className="font-bold text-ivory-200 text-sm">{sponsor.name}</div>
                  )}
                  <span className="text-[10px] font-mono uppercase text-ivory-500 px-2 py-0.5 rounded bg-charcoal-950">
                    {sponsor.tier} Sponsor
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. REGISTRATION MODAL */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setRegisterModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-ivory-500 hover:text-ivory-100 rounded-xl hover:bg-charcoal-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-forest-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>In-Platform Registration</span>
              </div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                Register for {hackathon.title}
              </h2>
              <p className="text-xs text-ivory-500 mt-1">
                Confirm your profile details below to complete your registration.
              </p>
            </div>

            {regError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {regError}
              </div>
            )}

            {regSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-forest-500/20 text-forest-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
                  Registration Successful! 🎉
                </h3>
                <p className="text-xs text-ivory-400">
                  You are now registered for the hackathon. Refreshing your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">College / University</label>
                    <input
                      type="text"
                      value={regForm.college}
                      onChange={(e) => setRegForm({ ...regForm, college: e.target.value })}
                      placeholder="e.g. Stanford / IIT / MIT"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">Degree / Major</label>
                    <input
                      type="text"
                      value={regForm.degree}
                      onChange={(e) => setRegForm({ ...regForm, degree: e.target.value })}
                      placeholder="e.g. B.S. Computer Science"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">Graduation Year</label>
                    <input
                      type="text"
                      value={regForm.graduationYear}
                      onChange={(e) => setRegForm({ ...regForm, graduationYear: e.target.value })}
                      placeholder="e.g. 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">Key Skills (Comma separated)</label>
                    <input
                      type="text"
                      value={regForm.skills}
                      onChange={(e) => setRegForm({ ...regForm, skills: e.target.value })}
                      placeholder="e.g. React, Python, Next.js, Smart Contracts, AI/ML"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">GitHub Profile URL</label>
                    <input
                      type="url"
                      value={regForm.githubUrl}
                      onChange={(e) => setRegForm({ ...regForm, githubUrl: e.target.value })}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-ivory-300 block mb-1 font-mono">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={regForm.linkedinUrl}
                      onChange={(e) => setRegForm({ ...regForm, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-charcoal-cardBorder flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setRegisterModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-semibold text-ivory-400 hover:text-ivory-100 bg-charcoal-900 border border-charcoal-cardBorder"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={registering}
                    className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 disabled:opacity-50 shadow-button"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{registering ? "Registering..." : "Confirm Registration"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        title={hackathon.title}
        url={typeof window !== "undefined" ? window.location.href : `https://nimblux.xyz/hackathon/${hackathon.slug}`}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
