"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  RotateCcw,
  DollarSign,
  Check,
} from "lucide-react";
import { CATEGORIES, WORK_MODES, SORT_OPTIONS } from "@/lib/constants";

interface FilterSidebarProps {
  selectedCategory?: string;
  selectedMode?: string;
  selectedPaid?: string;
  selectedSort?: string;
  onFilterChange?: (filters: {
    category?: string;
    mode?: string;
    paid?: string;
    sort?: string;
  }) => void;
}

function FilterSidebarInner({
  selectedCategory = "all",
  selectedMode = "all",
  selectedPaid = "all",
  selectedSort = "latest",
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (value === "all" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/opportunities?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/opportunities");
  };

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedMode !== "all" ||
    selectedPaid !== "all" ||
    selectedSort !== "latest";

  return (
    <aside className="w-full lg:w-72 bg-charcoal-card rounded-2xl p-5 border border-charcoal-cardBorder space-y-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-charcoal-cardBorder">
        <div className="flex items-center space-x-2 text-ivory-100 font-bold text-xs font-mono uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-bronze-400" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono font-semibold text-ivory-400 uppercase tracking-wider block">
          Sort By
        </label>
        <select
          value={selectedSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-200 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-charcoal-900 text-ivory-200">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Work Mode */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono font-semibold text-ivory-400 uppercase tracking-wider block">
          Work Mode
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParam("mode", "all")}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              selectedMode === "all"
                ? "bg-bronze-500/15 text-bronze-300 border border-bronze-500/30"
                : "text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-900"
            }`}
          >
            <span>All Modes</span>
            {selectedMode === "all" && <Check className="w-3.5 h-3.5 text-bronze-400" />}
          </button>
          {WORK_MODES.map((m) => {
            const isSelected = selectedMode.toUpperCase() === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => updateParam("mode", isSelected ? "all" : m.value)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-bronze-500/15 text-bronze-300 border border-bronze-500/30"
                    : "text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-900"
                }`}
              >
                <span>{m.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-bronze-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compensation Type */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono font-semibold text-ivory-400 uppercase tracking-wider block">
          Compensation
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => updateParam("paid", selectedPaid === "paid" ? "all" : "paid")}
            className={`flex items-center justify-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              selectedPaid === "paid"
                ? "bg-forest-500/20 text-forest-300 border-forest-500/40"
                : "bg-charcoal-900 text-ivory-400 border-charcoal-cardBorder hover:text-ivory-200"
            }`}
          >
            <DollarSign className="w-3 h-3 text-forest-400" />
            <span>Paid Only</span>
          </button>
          <button
            type="button"
            onClick={() => updateParam("paid", selectedPaid === "free" ? "all" : "free")}
            className={`flex items-center justify-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              selectedPaid === "free"
                ? "bg-sage-500/20 text-sage-300 border-sage-500/40"
                : "bg-charcoal-900 text-ivory-400 border-charcoal-cardBorder hover:text-ivory-200"
            }`}
          >
            <span>Free Entry</span>
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-2 pt-2 border-t border-charcoal-cardBorder">
        <label className="text-[11px] font-mono font-semibold text-ivory-400 uppercase tracking-wider block">
          Categories
        </label>
        <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
          <button
            type="button"
            onClick={() => updateParam("category", "all")}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedCategory === "all"
                ? "bg-bronze-500/15 text-bronze-300 font-semibold"
                : "text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-900"
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === "all" && <Check className="w-3 h-3 text-bronze-400" />}
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => updateParam("category", isSelected ? "all" : cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? "bg-bronze-500/15 text-bronze-300 font-semibold"
                    : "text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-900"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="w-3 h-3 text-bronze-400 flex-shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default function FilterSidebar(props: FilterSidebarProps) {
  return (
    <Suspense fallback={<div className="w-full lg:w-72 h-96 rounded-2xl bg-charcoal-card animate-pulse" />}>
      <FilterSidebarInner {...props} />
    </Suspense>
  );
}
