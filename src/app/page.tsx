import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  PlusCircle,
  Briefcase,
  Code,
  Building2,
  Calendar,
  GraduationCap,
  Trophy,
  ShieldCheck,
  Zap,
  Globe2,
  Users,
  CheckCircle2,
  Flame,
  Award,
  ChevronRight,
  Clock,
  Layers,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/filters/SearchBar";
import OpportunityCard from "@/components/cards/OpportunityCard";
import HackathonCard from "@/components/cards/HackathonCard";
import EventCard from "@/components/cards/EventCard";
import CategoryCard from "@/components/cards/CategoryCard";
import { CATEGORIES } from "@/lib/constants";

export const revalidate = 0;

export default async function HomePage() {
  // Fetch real counts and listings from DB
  const [
    featuredOpportunities,
    latestOpportunities,
    featuredHackathons,
    upcomingEvents,
    categoryCounts,
    totalApprovedCount,
    totalUsersCount,
  ] = await Promise.all([
    prisma.opportunity.findMany({
      where: { status: "APPROVED", featured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.opportunity.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.hackathon.findMany({
      where: { status: { in: ["PUBLISHED", "APPROVED"] } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        _count: {
          select: {
            registrations: true,
            teams: true,
            submissions: true,
          },
        },
      },
    }),
    prisma.event.findMany({
      orderBy: { eventDate: "asc" },
      take: 3,
    }),
    prisma.opportunity.groupBy({
      by: ["category"],
      where: { status: "APPROVED" },
      _count: { id: true },
    }),
    prisma.opportunity.count({
      where: { status: "APPROVED" },
    }),
    prisma.user.count(),
  ]);

  const countMap: Record<string, number> = {};
  categoryCounts.forEach((c) => {
    countMap[c.category.toLowerCase()] = c._count.id;
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-charcoal-950">
      {/* Fog Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-fog-radial opacity-75 blur-[100px] rounded-full" />
      </div>

      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative z-10 pt-20 sm:pt-28 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-charcoal-card border border-charcoal-cardBorder text-ivory-300 text-xs font-mono mb-8 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-bronze-400" />
          <span>Technology • Innovation • Community</span>
        </div>

        {/* Primary Editorial Headline */}
        <h1 className="font-serif-heading font-medium text-4xl sm:text-6xl lg:text-7xl text-ivory-100 tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Opportunities that{" "}
          <span className="italic text-bronze-300 font-normal underline decoration-bronze-500/40 decoration-1 underline-offset-8">
            shape
          </span>{" "}
          your future.
        </h1>

        {/* Supporting Subtitle */}
        <p className="mt-6 text-sm sm:text-lg text-ivory-400 max-w-2xl mx-auto leading-relaxed font-normal">
          NIMBLUX brings internships, hackathons, jobs, events, scholarships, competitions and career opportunities together in one trusted platform.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/opportunities"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/submit-opportunity"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl font-semibold text-xs sm:text-sm text-ivory-200 hover:text-white bg-charcoal-card hover:bg-charcoal-850 border border-charcoal-cardBorder shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-bronze-400" />
            <span>Post an Opportunity</span>
          </Link>
        </div>

        {/* Floating Category Badges (Atmospheric Element) */}
        <div className="mt-10 hidden sm:flex items-center justify-center flex-wrap gap-2 text-[11px] font-mono text-ivory-400">
          <span className="text-ivory-500">Curated tracks:</span>
          {["Internships", "Hackathons", "Tech Jobs", "Scholarships", "Fellowships", "Workshops"].map(
            (track) => (
              <span
                key={track}
                className="px-2.5 py-1 rounded-full bg-charcoal-900/80 border border-charcoal-cardBorder text-ivory-300"
              >
                {track}
              </span>
            )
          )}
        </div>

        {/* Search Bar Interface */}
        <div className="mt-10 max-w-4xl mx-auto">
          <SearchBar largeHero />
        </div>
      </section>

      {/* 2. TRUST STRIP */}
      <section className="border-y border-charcoal-cardBorder bg-charcoal-900/40 py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="text-xs font-mono uppercase tracking-wider text-ivory-500 font-medium">
            Trusted by students, developers and growing communities
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-ivory-400 font-semibold">
            <span>Global Hackathons</span>
            <span>•</span>
            <span>University Tech Labs</span>
            <span>•</span>
            <span>Open Source Cohorts</span>
            <span>•</span>
            <span>Venture Fellowships</span>
          </div>
        </div>
      </section>

      {/* 3. STATS SECTION (Horizontal Metrics) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-8 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card">
          <div className="text-center">
            <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
              {totalUsersCount > 0 ? `${totalUsersCount}+` : "950+"}
            </div>
            <div className="text-[11px] font-mono text-ivory-500 mt-1 uppercase tracking-wider">
              Community Members
            </div>
          </div>

          <div className="text-center">
            <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-bronze-300">
              {totalApprovedCount > 0 ? `${totalApprovedCount}+` : "500+"}
            </div>
            <div className="text-[11px] font-mono text-ivory-500 mt-1 uppercase tracking-wider">
              Opportunities Shared
            </div>
          </div>

          <div className="text-center">
            <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-forest-300">
              14+
            </div>
            <div className="text-[11px] font-mono text-ivory-500 mt-1 uppercase tracking-wider">
              Specialized Tracks
            </div>
          </div>

          <div className="text-center">
            <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-sage-300">
              50+
            </div>
            <div className="text-[11px] font-mono text-ivory-500 mt-1 uppercase tracking-wider">
              Partner Organizations
            </div>
          </div>

          <div className="text-center col-span-2 md:col-span-1">
            <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
              100%
            </div>
            <div className="text-[11px] font-mono text-forest-400 mt-1 uppercase tracking-wider">
              Free For Students
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORIES SECTION */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-bronze-400 text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Browse by Category</span>
            </div>
            <h2 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100 tracking-tight">
              Find opportunities in what you love
            </h2>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-bronze-400 hover:text-bronze-300 transition-colors"
          >
            <span>View all 14 categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.slug}
              category={cat}
              count={countMap[cat.slug] || 0}
            />
          ))}
        </div>
      </section>

      {/* 5. FEATURED HACKATHONS ARENA */}
      {featuredHackathons.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold">
                <Trophy className="w-3.5 h-3.5" />
                <span>Competitions & Sprints</span>
              </div>
              <h2 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100 tracking-tight">
                Live Hackathons on NIMBLUX
              </h2>
            </div>
            <Link
              href="/hackathons"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
            >
              <span>Explore all hackathons</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHackathons.map((hackathon) => (
              <HackathonCard
                key={hackathon.id}
                hackathon={{
                  ...hackathon,
                  registrationCount: hackathon._count.registrations,
                  teamCount: hackathon._count.teams,
                  submissionCount: hackathon._count.submissions,
                } as any}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. FEATURED OPPORTUNITIES (4 Cards per row on desktop) */}
      {featuredOpportunities.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-bronze-400 text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Featured Selection</span>
              </div>
              <h2 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100 tracking-tight">
                Featured Opportunities
              </h2>
            </div>
            <Link
              href="/opportunities?featured=true"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-bronze-400 hover:text-bronze-300 transition-colors"
            >
              <span>View all featured</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featuredOpportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp as any} />
            ))}
          </div>
        </section>
      )}

      {/* 6. LATEST OPPORTUNITIES */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-forest-400 text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>Recently Published</span>
            </div>
            <h2 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100 tracking-tight">
              Latest Open Opportunities
            </h2>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-bronze-400 hover:text-bronze-300 transition-colors"
          >
            <span>See full directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {latestOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp as any} />
          ))}
        </div>
      </section>

      {/* 7. COMMUNITY EVENTS */}
      {upcomingEvents.length > 0 && (
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-bronze-400 text-xs font-mono uppercase tracking-wider mb-1.5 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Gatherings & Summits</span>
              </div>
              <h2 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100 tracking-tight">
                Upcoming Tech Events
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-bronze-400 hover:text-bronze-300 transition-colors"
            >
              <span>View all events</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event as any} />
            ))}
          </div>
        </section>
      )}

      {/* 8. EDITORIAL WHY NIMBLUX */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="rounded-3xl p-8 sm:p-12 border border-charcoal-cardBorder bg-charcoal-card shadow-card">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
              Why Choose NIMBLUX?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-ivory-400">
              Built specifically for students, early-career engineers, and builders navigating the technology ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center text-bronze-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-ivory-100">Verified Opportunities</h3>
              <p className="text-xs text-ivory-500 leading-relaxed">
                Zero spam or misleading listings. Every submission is human-reviewed before going live.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center text-forest-400">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-ivory-100">One Platform for Students</h3>
              <p className="text-xs text-ivory-500 leading-relaxed">
                No scattered tabs across 20 sites. Discover internships, hackathons, and scholarships in one place.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center text-sage-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-ivory-100">Fast Direct Application</h3>
              <p className="text-xs text-ivory-500 leading-relaxed">
                Skip third-party middle steps. Apply directly on official employer and university career portals.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center text-ivory-300">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-ivory-100">Community Powered</h3>
              <p className="text-xs text-ivory-500 leading-relaxed">
                Empowered by student ambassadors and developer leads sharing hidden opportunities and referral openings.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center text-bronze-300">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-ivory-100">Deadline Tracking</h3>
              <p className="text-xs text-ivory-500 leading-relaxed">
                Real-time countdown indicators and urgency tags so you never miss application cutoff dates.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center text-forest-300">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-ivory-100">100% Free Forever</h3>
              <p className="text-xs text-ivory-500 leading-relaxed">
                Completely free for students. No subscription fees, paywalls, or gated job applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. COMMUNITY CTA BANNER */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 mb-10">
        <div className="rounded-3xl p-8 sm:p-12 bg-charcoal-card border border-charcoal-cardBorder text-center shadow-card relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-serif-heading font-medium text-3xl sm:text-4xl text-ivory-100">
              Join the NIMBLUX Community
            </h2>
            <p className="mt-3 text-ivory-400 text-xs sm:text-sm leading-relaxed">
              Have an internship, hackathon, or scholarship to share with thousands of ambitious students? Post it in 2 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/submit-opportunity"
                className="w-full sm:w-auto px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
              >
                Post an Opportunity Now
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold text-xs sm:text-sm text-ivory-200 hover:text-white bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-cardBorder transition-all"
              >
                Create Student Profile
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
