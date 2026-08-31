"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code,
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  Trophy,
  Inbox,
  ArrowRight,
  Flame,
  Globe,
  SlidersHorizontal,
} from "lucide-react";
import HackathonCard, { HackathonCardData } from "@/components/cards/HackathonCard";

interface HackathonsClientProps {
  initialHackathons: HackathonCardData[];
}

export default function HackathonsClient({ initialHackathons }: HackathonsClientProps) {
  const [hackathons, setHackathons] = useState<HackathonCardData[]>(initialHackathons);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [prizeFilter, setPrizeFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("latest");

  // Client-side filtering and sorting
  const filtered = hackathons.filter((h) => {
    if (modeFilter !== "all" && h.mode.toLowerCase() !== modeFilter.toLowerCase()) {
      return false;
    }
    if (prizeFilter === "prize" && !h.hasPrizePool) {
      return false;
    }
    if (statusFilter === "open") {
      const isPast = new Date(h.regEndDate) < new Date();
      if (isPast || h.status === "COMPLETED") return false;
    } else if (statusFilter === "completed") {
      if (h.status !== "COMPLETED") return false;
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchTitle = h.title.toLowerCase().includes(term);
      const matchOrg = h.organizerName.toLowerCase().includes(term);
      const matchDesc = (h.tagline || h.shortDescription).toLowerCase().includes(term);
      const matchLoc = h.location.toLowerCase().includes(term);
      if (!matchTitle && !matchOrg && !matchDesc && !matchLoc) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortFilter === "deadline") {
      return new Date(a.regEndDate).getTime() - new Date(b.regEndDate).getTime();
    }
    if (sortFilter === "startDate") {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }
    if (sortFilter === "featured") {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
    if (sortFilter === "popular") {
      return (b.registrationCount || 0) - (a.registrationCount || 0);
    }
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* 1. HERO BANNER */}
      <section className="relative rounded-3xl bg-gradient-to-b from-charcoal-card via-charcoal-card to-charcoal-950 p-8 sm:p-12 border border-charcoal-cardBorder shadow-card overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 w-96 h-96 bg-forest-radial opacity-60 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest-500/10 border border-forest-500/20 text-forest-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NIMBLUX Hackathon Arena</span>
            </div>
            <h1 className="font-serif-heading font-medium text-3xl sm:text-4xl lg:text-5xl text-ivory-100 tracking-tight leading-tight">
              Build, Compete & Win Global Hackathons
            </h1>
            <p className="text-xs sm:text-sm text-ivory-400 leading-relaxed font-normal">
              Participate directly in online and onsite hackathons, form student teams, submit projects, and compete for verified prize pools and official certificates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
            <Link
              href="/organize-hackathon"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all text-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Organize a Hackathon</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS BAR */}
      <section className="p-4 sm:p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ivory-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons by title, organizer, tech stack, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 transition-colors font-mono"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-ivory-500 font-mono hidden sm:inline-block">Sort:</span>
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-200 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
            >
              <option value="latest">Latest First</option>
              <option value="deadline">Registration Closing Soonest</option>
              <option value="startDate">Event Start Date</option>
              <option value="featured">Featured First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-charcoal-cardBorder/60 text-xs">
          <div className="flex items-center space-x-1 text-ivory-500 font-mono text-[11px] mr-2">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Mode Pills */}
          {[
            { label: "All Modes", value: "all" },
            { label: "Online / Virtual", value: "online" },
            { label: "Onsite / In-Person", value: "offline" },
            { label: "Hybrid", value: "hybrid" },
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => setModeFilter(mode.value)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                modeFilter === mode.value
                  ? "bg-bronze-500 text-charcoal-950 font-bold shadow-button"
                  : "bg-charcoal-900 text-ivory-400 hover:text-ivory-200 border border-charcoal-cardBorder"
              }`}
            >
              {mode.label}
            </button>
          ))}

          {/* Prize Pool Toggle Pill */}
          <button
            onClick={() => setPrizeFilter(prizeFilter === "prize" ? "all" : "prize")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
              prizeFilter === "prize"
                ? "bg-amber-500 text-charcoal-950 font-bold shadow-button"
                : "bg-charcoal-900 text-ivory-400 hover:text-amber-300 border border-charcoal-cardBorder"
            }`}
          >
            <Trophy className="w-3 h-3" />
            <span>Prize Pool Only</span>
          </button>

          {/* Status Filter */}
          <button
            onClick={() => setStatusFilter(statusFilter === "open" ? "all" : "open")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              statusFilter === "open"
                ? "bg-forest-500 text-charcoal-950 font-bold shadow-button"
                : "bg-charcoal-900 text-ivory-400 hover:text-forest-300 border border-charcoal-cardBorder"
            }`}
          >
            Open Registration
          </button>
        </div>
      </section>

      {/* 3. RESULTS SUMMARY */}
      <div className="flex items-center justify-between pb-2 border-b border-charcoal-cardBorder text-xs text-ivory-500 font-mono">
        <div>
          Showing <span className="font-bold text-ivory-100">{filtered.length}</span> hackathons
        </div>
        {searchQuery && (
          <div>
            Filtered by query: <span className="text-bronze-300">"{searchQuery}"</span>
          </div>
        )}
      </div>

      {/* 4. HACKATHONS GRID */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-8 space-y-4 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center mx-auto text-ivory-500">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-ivory-100">
            No hackathons match your active filters
          </h3>
          <p className="text-xs text-ivory-500 max-w-md mx-auto leading-relaxed">
            Try adjusting your search terms or filters to discover other competitions, or organize your own community hackathon.
          </p>
          <div className="pt-2">
            <Link
              href="/organize-hackathon"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all shadow-button"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Organize a Hackathon</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hackathon) => (
            <HackathonCard key={hackathon.id} hackathon={hackathon} />
          ))}
        </div>
      )}
    </div>
  );
}
