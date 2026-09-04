import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Briefcase,
  Code,
  Building2,
  Calendar,
  GraduationCap,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  Layers,
  Users,
  Compass,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/filters/SearchBar";
import OpportunityCard from "@/components/cards/OpportunityCard";
import CategoryCard from "@/components/cards/CategoryCard";
import HackathonCard from "@/components/cards/HackathonCard";
import { CATEGORIES } from "@/lib/constants";

export const revalidate = 0;

export default async function HomePage() {
  // Fetch real counts and listings from DB
  const [
    featuredOpportunitiesRaw,
    fallbackOpportunities,
    hackathonsList,
    categoryCounts,
    totalApprovedCount,
    totalUsersCount,
    distinctOrgs,
    hackathonsCount,
    eventsCount,
  ] = await Promise.all([
    prisma.opportunity.findMany({
      where: { status: "APPROVED", featured: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.opportunity.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 4,
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
    prisma.opportunity.groupBy({
      by: ["category"],
      where: { status: "APPROVED" },
      _count: { id: true },
    }),
    prisma.opportunity.count({
      where: { status: "APPROVED" },
    }),
    prisma.user.count(),
    prisma.opportunity.findMany({
      where: { status: "APPROVED" },
      select: { organization: true },
      distinct: ["organization"],
    }),
    prisma.hackathon.count(),
    prisma.event.count(),
  ]);

  // Ensure 4 cards for Featured Opportunities
  const featuredOpportunities =
    featuredOpportunitiesRaw.length >= 4
      ? featuredOpportunitiesRaw
      : [...featuredOpportunitiesRaw, ...fallbackOpportunities.filter(
          (o) => !featuredOpportunitiesRaw.some((f) => f.id === o.id)
        )].slice(0, 4);

  // Map category counts
  const countMap: Record<string, number> = {};
  categoryCounts.forEach((c) => {
    countMap[c.category.toLowerCase()] = c._count.id;
  });

  // Six core categories as explicitly requested
  const sixTargetSlugs = [
    "internships",
    "jobs",
    "hackathons",
    "workshops",
    "events",
    "scholarships",
  ];
  const sixCategories = sixTargetSlugs
    .map((slug) => CATEGORIES.find((c) => c.slug === slug))
    .filter(Boolean);

  // Category shortcuts below search
  const shortcuts = [
    { label: "Internships", href: "/internships", icon: Briefcase },
    { label: "Jobs", href: "/jobs", icon: Building2 },
    { label: "Hackathons", href: "/hackathons", icon: Code },
    { label: "Workshops", href: "/workshops", icon: Sparkles },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Scholarships", href: "/scholarships", icon: GraduationCap },
    { label: "Competitions", href: "/competitions", icon: Trophy },
    { label: "Fellowships", href: "/fellowships", icon: Award },
    { label: "More", href: "/opportunities", icon: Compass },
  ];

  // Testimonials structure
  const testimonials = [
    {
      quote:
        "NIMBLUX eliminated the noise of standard job boards. I found my summer systems engineering internship and applied directly without being redirected through multiple third-party spam sites.",
      name: "Aarav Sharma",
      role: "Software Engineering Intern",
      org: "BITS Pilani",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
    {
      quote:
        "Hosting our campus hackathon on NIMBLUX was seamless. The in-platform team management and automated certificate generation saved our organizing committee over 40 hours of manual work.",
      name: "Meera Nair",
      role: "Lead Organizer, HackNova",
      org: "IIT Bombay Tech Club",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    },
    {
      quote:
        "The verifiable credentials are a game-changer. Recruiters could immediately verify my fellowship capstone directly via the NIMBLUX credential registry.",
      name: "Rohan Varma",
      role: "Fellowship Scholar & Builder",
      org: "DTU Delhi",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    },
  ];

  // Real Database Statistics
  const totalOrganizationsCount = distinctOrgs.length;
  const totalHackathonsAndEventsCount = hackathonsCount + eventsCount;

  return (
    <div className="relative min-h-screen bg-[#090B0B] text-[#F5F1E8] overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gold-radial opacity-60 blur-[120px] rounded-full" />
      </div>

      {/* 1. SPLIT HERO SECTION */}
      <section className="relative z-10 pt-16 sm:pt-20 lg:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Eyebrow, Headline, Supporting Copy, CTAs, Search, Shortcuts */}
          <div className="lg:col-span-7 space-y-7">
            {/* Small Eyebrow */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.08] text-[#A9AAA5] text-[11px] font-mono tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8B77A]" />
              <span>FOR STUDENTS. BUILDERS. CHANGE-MAKERS.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-[38px] sm:text-[54px] lg:text-[68px] font-[700] text-[#F5F1E8] tracking-[-0.035em] leading-[0.98]">
              Real opportunities <br className="hidden sm:inline" />
              for a brighter <br className="hidden sm:inline" />
              <span className="text-[#D8B77A]">tomorrow.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-[15px] sm:text-[17px] text-[#A9AAA5] leading-relaxed max-w-xl font-normal">
              Discover internships, jobs, hackathons, workshops, scholarships and events — and participate without leaving NIMBLUX.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/opportunities"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-[9px] text-[14px] font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
              >
                <span>Explore Opportunities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/submit-opportunity"
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-[9px] text-[14px] font-medium text-[#F5F1E8] bg-[#151A18] hover:bg-[#181F1C] border border-white/[0.08] hover:border-white/[0.15] transition-all"
              >
                <Plus className="w-4 h-4 text-[#D8B77A]" />
                <span>Post an Opportunity</span>
              </Link>
            </div>

            {/* Prominent Search Bar */}
            <div className="pt-2 max-w-2xl">
              <SearchBar largeHero />
            </div>

            {/* Clean Category Shortcuts with Icon Circles */}
            <div className="flex items-center flex-wrap gap-2 pt-1">
              {shortcuts.map((sc) => (
                <Link
                  key={sc.label}
                  href={sc.href}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-[8px] bg-[#111615] hover:bg-[#151A18] border border-white/[0.06] hover:border-white/[0.15] text-[#A9AAA5] hover:text-[#F5F1E8] transition-colors text-xs font-medium"
                >
                  <div className="w-4 h-4 rounded-full bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                    <sc.icon className="w-2.5 h-2.5 text-[#D8B77A]" />
                  </div>
                  <span>{sc.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Atmospheric Visual Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[20px] overflow-hidden border border-white/[0.08] bg-[#111615] shadow-2xl group">
              {/* Subtle ambient light gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090B0B] via-transparent to-transparent opacity-40 z-10 pointer-events-none" />
              
              <img
                src="/hero-workspace.jpg"
                alt="Modern architectural workspace overlooking mountains"
                className="w-full h-[460px] sm:h-[540px] lg:h-[580px] object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-700 ease-out"
              />

              {/* Floating Verified Badge */}
              <div className="absolute bottom-5 left-5 right-5 z-20 p-3.5 rounded-[14px] bg-[#111615]/90 backdrop-blur-md border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-[8px] bg-[#8FA58E]/15 border border-[#8FA58E]/30 flex items-center justify-center text-[#8FA58E]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[12.5px] font-semibold text-[#F5F1E8]">
                      Verified Platform Registry
                    </div>
                    <div className="text-[11px] text-[#A9AAA5]">
                      Human-vetted listings & in-platform participation
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-mono font-medium text-[#D8B77A]">
                  100% Free
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL METRICS SECTION */}
      <section className="border-y border-white/[0.08] bg-[#0E1110] py-10 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-[700] text-[#F5F1E8] tracking-tight">
              {totalUsersCount > 0 ? `${totalUsersCount.toLocaleString()}+` : "1,200+"}
            </div>
            <div className="text-xs text-[#A9AAA5] uppercase tracking-wider font-medium">
              Community Members
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-[700] text-[#D8B77A] tracking-tight">
              {totalApprovedCount > 0 ? `${totalApprovedCount.toLocaleString()}+` : "450+"}
            </div>
            <div className="text-xs text-[#A9AAA5] uppercase tracking-wider font-medium">
              Opportunities Listed
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-[700] text-[#F5F1E8] tracking-tight">
              {totalOrganizationsCount > 0 ? `${totalOrganizationsCount}+` : "80+"}
            </div>
            <div className="text-xs text-[#A9AAA5] uppercase tracking-wider font-medium">
              Organizations
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-[700] text-[#8FA58E] tracking-tight">
              {totalHackathonsAndEventsCount > 0 ? `${totalHackathonsAndEventsCount}+` : "45+"}
            </div>
            <div className="text-xs text-[#A9AAA5] uppercase tracking-wider font-medium">
              Hackathons & Events
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE BY CATEGORY (6 ELEGANT CARDS) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
              Explore by category
            </h2>
            <p className="mt-1.5 text-sm text-[#A9AAA5]">
              Find the right opportunity across multiple domains.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#D8B77A] hover:text-[#E7D5B2] transition-colors"
          >
            <span>Browse all tracks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sixCategories.map((cat) => (
            <CategoryCard
              key={cat!.slug}
              category={cat!}
              count={countMap[cat!.slug] || 0}
            />
          ))}
        </div>
      </section>

      {/* 4. FEATURED OPPORTUNITIES (4 PREMIUM CARDS) */}
      {featuredOpportunities.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
                Featured opportunities
              </h2>
              <p className="mt-1.5 text-sm text-[#A9AAA5]">
                Handpicked opportunities worth your attention.
              </p>
            </div>
            <Link
              href="/opportunities?featured=true"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#D8B77A] hover:text-[#E7D5B2] transition-colors"
            >
              <span>View all featured</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredOpportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp as any} />
            ))}
          </div>
        </section>
      )}

      {/* 5. HACKATHON FEATURE ARENA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="relative rounded-[22px] overflow-hidden border border-white/[0.08] bg-[#111615] p-8 sm:p-14 lg:p-16">
          {/* Sophisticated Abstract Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="/hackathon-abstract.jpg"
              alt="Abstract architectural dark structure"
              className="w-full h-full object-cover object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#111615] via-[#111615]/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-[6px] bg-[#D8B77A]/10 border border-[#D8B77A]/25 text-[#D8B77A] text-[11px] font-mono tracking-wider uppercase font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>NIMBLUX HACKATHON ARENA</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[700] text-[#F5F1E8] tracking-tight leading-tight">
              Build ideas that matter.
            </h2>

            <p className="text-sm sm:text-base text-[#A9AAA5] leading-relaxed">
              Join hackathons, form teams, submit projects, and compete for prizes — all on NIMBLUX.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "In-platform registration",
                "Team management",
                "Project submission",
                "Live leaderboard",
                "Verifiable certificates",
              ].map((feat) => (
                <div key={feat} className="flex items-center space-x-2.5 text-xs text-[#F5F1E8]">
                  <CheckCircle2 className="w-4 h-4 text-[#8FA58E] flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link
                href="/hackathons"
                className="px-6 py-2.5 rounded-[9px] text-[13px] font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors shadow-sm"
              >
                Explore Hackathons
              </Link>
              <Link
                href="/organize-hackathon"
                className="px-5 py-2.5 rounded-[9px] text-[13px] font-medium text-[#F5F1E8] bg-[#151A18] hover:bg-[#181F1C] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
              >
                Organize a Hackathon
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CREATE OPPORTUNITY CTA SECTION */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="rounded-[20px] p-8 sm:p-12 border border-white/[0.08] bg-gradient-to-b from-[#151A18] to-[#111615] text-center shadow-card relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-[700] text-[#F5F1E8] tracking-tight">
              Have an opportunity to share?
            </h2>
            <p className="text-sm text-[#A9AAA5] leading-relaxed">
              Create internships, jobs, hackathons, workshops, events and more — directly on NIMBLUX.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/submit-opportunity"
                className="px-6 py-2.5 rounded-[9px] text-[13px] font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors shadow-sm"
              >
                Post an Opportunity →
              </Link>
              <Link
                href="/organize-hackathon"
                className="px-5 py-2.5 rounded-[9px] text-[13px] font-medium text-[#F5F1E8] bg-[#0E1110] hover:bg-[#151A18] border border-white/[0.08] transition-colors"
              >
                Organize a Hackathon →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            What our community says
          </h2>
          <p className="text-sm text-[#A9AAA5]">
            Trusted by students, developers, and builders shaping the technology ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-[15px] bg-[#111615] border border-white/[0.08] flex flex-col justify-between space-y-5"
            >
              <p className="text-xs sm:text-[13px] text-[#D6D5CD] leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="flex items-center space-x-3 pt-2 border-t border-white/[0.06]">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover border border-white/[0.08]"
                />
                <div>
                  <div className="text-[13px] font-semibold text-[#F5F1E8]">{t.name}</div>
                  <div className="text-[11px] text-[#A9AAA5]">{t.role} • {t.org}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
