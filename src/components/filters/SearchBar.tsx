"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, MapPin, ArrowRight, Sparkles, Filter } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

interface SearchBarProps {
  initialQuery?: string;
  initialCategory?: string;
  initialMode?: string;
  largeHero?: boolean;
}

export default function SearchBar({
  initialQuery = "",
  initialCategory = "all",
  initialMode = "all",
  largeHero = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [mode, setMode] = useState(initialMode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category && category !== "all") params.set("category", category);
    if (mode && mode !== "all") params.set("mode", mode);

    router.push(`/opportunities?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`w-full glass-panel rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border border-slate-700/70 shadow-2xl transition-all ${
        largeHero
          ? "bg-slate-900/80 shadow-indigo-950/30"
          : "bg-slate-900/60"
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        {/* Keyword Search Input */}
        <div className="flex-1 flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-950/70 rounded-xl sm:rounded-2xl border border-slate-800 focus-within:border-indigo-500/80 transition-colors">
          <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search internships, hackathons, jobs, events, skills..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Category Select Dropdown */}
        <div className="flex items-center space-x-2 px-3 py-2 sm:py-2.5 bg-slate-950/70 rounded-xl sm:rounded-2xl border border-slate-800 focus-within:border-indigo-500/80 transition-colors md:w-52">
          <Compass className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-300">
              All Categories
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug} className="bg-slate-900 text-slate-300">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Select Dropdown */}
        <div className="flex items-center space-x-2 px-3 py-2 sm:py-2.5 bg-slate-950/70 rounded-xl sm:rounded-2xl border border-slate-800 focus-within:border-indigo-500/80 transition-colors md:w-40">
          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-300">
              Any Location
            </option>
            <option value="REMOTE" className="bg-slate-900 text-slate-300">
              Remote Only
            </option>
            <option value="HYBRID" className="bg-slate-900 text-slate-300">
              Hybrid
            </option>
            <option value="ONSITE" className="bg-slate-900 text-slate-300">
              On-site
            </option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl sm:rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-brand-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 glow-button transition-all flex-shrink-0"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
