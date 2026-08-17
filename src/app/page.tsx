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
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/filters/SearchBar";
import OpportunityCard from "@/components/cards/OpportunityCard";
import EventCard from "@/components/cards/EventCard";
import CategoryCard from "@/components/cards/CategoryCard";
import { CATEGORIES } from "@/lib/constants";

export const revalidate = 0; // Dynamic server render

export default async function HomePage() {
  // Fetch featured opportunities
  const featuredOpportunities = await prisma.opportunity.findMany({
    where: { status: "APPROVED", featured: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Fetch latest approved opportunities
  const latestOpportunities = await prisma.opportunity.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Fetch upcoming events
  const upcomingEvents = await prisma.event.findMany({
    orderBy: { eventDate: "asc" },
    take: 3,
  });

  // Category counts
  const categoryCounts = await prisma.opportunity.groupBy({
    by: ["category"],
    where: { status: "APPROVED" },
    _count: { id: true },
  });

  const countMap: Record<string, number> = {};
  categoryCounts.forEach((c) => {
    countMap[c.category.toLowerCase()] = c._count.id;
  });

  const popularCategorySlugs = [
    "internships",
    "hackathons",
    "jobs",
    "events",
    "scholarships",
    "competitions",
    "fellowships",
    "workshops",
  ];

  const popularCategories = CATEGORIES.filter((c) =>
    popularCategorySlugs.includes(c.slug)
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-brand-500/15 to-cyan-500/20 blur-[130px] rounded-full" />
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 shadow-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Technology • Innovation • Community</span>
        </div>

        {/* Primary Headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Discover Opportunities.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-brand-300 to-cyan-400">
            Build Your Future.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Find internships, hackathons, jobs, events, scholarships, and fellowships — curated, verified, and all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/opportunities"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-indigo-600 via-brand-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-600/30 glow-button transition-all"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/submit-opportunity"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-2xl font-semibold text-sm sm:text-base text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            <span>Post an Opportunity</span>
          </Link>
        </div>

        {/* Integrated Powerful Search Bar */}
        <div className="mt-12 max-w-4xl mx-auto">
          <SearchBar largeHero />
        </div>

        {/* Key Metrics / Proof Bar */}
        <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="font-display font-black text-2xl sm:text-3xl text-white">
              100%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Verified Listings</div>
          </div>
          <div className="text-center">
            <div className="font-display font-black text-2xl sm:text-3xl text-indigo-400">
              14+
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Categories</div>
          </div>
          <div className="text-center">
            <div className="font-display font-black text-2xl sm:text-3xl text-cyan-400">
              $500K+
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Stipends & Prizes</div>
          </div>
          <div className="text-center">
            <div className="font-display font-black text-2xl sm:text-3xl text-emerald-400">
              Free
            </div>
            <div className="text-xs text-slate-400 mt-0.5">For All Students</div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Zap className="w-4 h-4" />
              <span>Browse by Category</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Popular Opportunity Categories
            </h2>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View all 14 categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularCategories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              category={cat}
              count={countMap[cat.slug] || 0}
            />
          ))}
        </div>
      </section>

      {/* 3. FEATURED OPPORTUNITIES */}
      {featuredOpportunities.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Handpicked for Excellence</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                Featured Opportunities
              </h2>
            </div>
            <Link
              href="/opportunities?featured=true"
              className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Explore all featured</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOpportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp as any} />
            ))}
          </div>
        </section>
      )}

      {/* 4. LATEST OPPORTUNITIES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Flame className="w-4 h-4" />
              <span>Recently Published</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Latest Open Opportunities
            </h2>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>See full directory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp as any} />
          ))}
        </div>
      </section>

      {/* 5. UPCOMING EVENTS */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Calendar className="w-4 h-4" />
                <span>NIMBLUX Community Gatherings</span>
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                Upcoming Tech Events & Summits
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>View all events</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event as any} />
            ))}
          </div>
        </section>
      )}

      {/* 6. WHY NIMBLUX? VALUE PROPOSITION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="rounded-3xl glass-panel p-8 sm:p-12 border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Why Choose NIMBLUX?
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Built specifically for students, early-career engineers, and builders navigating the tech ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Verified Opportunities</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Zero spam or dead links. Every opportunity is reviewed by human moderators before appearing publicly.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">One Platform for Students</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No more scattered tabs across 20 websites. Find internships, hackathons, and scholarships under one roof.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Fast Direct Application</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Skip third-party intermediaries. Apply directly on official employer and organization career portals.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Community Powered</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Empowered by a global community of students and campus leads sharing hidden gems and referral openings.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">Deadline Tracking</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Live countdown timers and urgency badges so you never miss application closing deadlines.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-white">100% Free Forever</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Completely free for students. No subscription fees, paywalls, or gated job applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 mb-12">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 bg-gradient-to-r from-indigo-900/60 via-slate-900/80 to-cyan-950/60 border border-indigo-500/30 text-center shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              Join the NIMBLUX Community
            </h2>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Have an internship, hackathon, or scholarship to share with thousands of ambitious students? Post it in 2 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/submit-opportunity"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-600/30 glow-button transition-all"
              >
                Post an Opportunity Now
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-semibold text-sm text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all"
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

// Clock icon for section
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
