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
      className={`w-full rounded-[14px] p-2 border transition-all ${
        largeHero
          ? "bg-[#111615]/95 backdrop-blur-md border-white/[0.08] shadow-2xl"
          : "bg-[#111615] border-white/[0.08]"
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        {/* Keyword Search Input */}
        <div className="flex-1 flex items-center space-x-3 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#090B0B]/70 rounded-[10px] border border-white/[0.06] focus-within:border-[#D8B77A]/50 transition-colors">
          <Search className="w-4 h-4 text-[#D8B77A] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities, companies, skills..."
            className="w-full bg-transparent text-xs sm:text-[13.5px] text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none"
          />
        </div>

        {/* Category Select Dropdown */}
        <div className="flex items-center space-x-2 px-3 py-2 sm:py-2.5 bg-[#090B0B]/70 rounded-[10px] border border-white/[0.06] focus-within:border-[#D8B77A]/50 transition-colors md:w-48">
          <Compass className="w-4 h-4 text-[#A9AAA5] flex-shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent text-xs text-[#D6D5CD] focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#111615] text-[#F5F1E8]">
              All Categories
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug} className="bg-[#111615] text-[#F5F1E8]">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mode / Location Select Dropdown */}
        <div className="flex items-center space-x-2 px-3 py-2 sm:py-2.5 bg-[#090B0B]/70 rounded-[10px] border border-white/[0.06] focus-within:border-[#D8B77A]/50 transition-colors md:w-36">
          <MapPin className="w-4 h-4 text-[#A9AAA5] flex-shrink-0" />
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full bg-transparent text-xs text-[#D6D5CD] focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#111615] text-[#F5F1E8]">
              Any Location
            </option>
            <option value="REMOTE" className="bg-[#111615] text-[#F5F1E8]">
              Remote
            </option>
            <option value="HYBRID" className="bg-[#111615] text-[#F5F1E8]">
              Hybrid
            </option>
            <option value="ONSITE" className="bg-[#111615] text-[#F5F1E8]">
              On-site
            </option>
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="flex items-center justify-center space-x-1.5 px-6 py-2.5 sm:py-3 rounded-[10px] font-semibold text-xs sm:text-[13px] text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all flex-shrink-0"
        >
          <span>Search</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
