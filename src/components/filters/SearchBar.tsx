"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, MapPin, ArrowRight } from "lucide-react";
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
      className={`w-full rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border transition-all ${
        largeHero
          ? "bg-charcoal-card/90 backdrop-blur-md border-charcoal-cardBorder shadow-2xl"
          : "bg-charcoal-card border-charcoal-cardBorder"
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        {/* Keyword Search Input */}
        <div className="flex-1 flex items-center space-x-3 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-charcoal-950/80 rounded-xl sm:rounded-2xl border border-charcoal-cardBorder focus-within:border-bronze-500/50 transition-colors">
          <Search className="w-4.5 h-4.5 text-bronze-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities, companies or skills..."
            className="w-full bg-transparent text-xs sm:text-sm text-ivory-100 placeholder-ivory-500 focus:outline-none"
          />
        </div>

        {/* Category Select Dropdown */}
        <div className="flex items-center space-x-2 px-3 py-2 sm:py-2.5 bg-charcoal-950/80 rounded-xl sm:rounded-2xl border border-charcoal-cardBorder focus-within:border-bronze-500/50 transition-colors md:w-48">
          <Compass className="w-4 h-4 text-forest-400 flex-shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent text-xs text-ivory-300 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-charcoal-900 text-ivory-300">
              All Categories
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug} className="bg-charcoal-900 text-ivory-300">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mode Select Dropdown */}
        <div className="flex items-center space-x-2 px-3 py-2 sm:py-2.5 bg-charcoal-950/80 rounded-xl sm:rounded-2xl border border-charcoal-cardBorder focus-within:border-bronze-500/50 transition-colors md:w-36">
          <MapPin className="w-4 h-4 text-sage-400 flex-shrink-0" />
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full bg-transparent text-xs text-ivory-300 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-charcoal-900 text-ivory-300">
              Any Mode
            </option>
            <option value="REMOTE" className="bg-charcoal-900 text-ivory-300">
              Remote
            </option>
            <option value="HYBRID" className="bg-charcoal-900 text-ivory-300">
              Hybrid
            </option>
            <option value="ONSITE" className="bg-charcoal-900 text-ivory-300">
              On-site
            </option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="flex items-center justify-center space-x-2 px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all flex-shrink-0"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
