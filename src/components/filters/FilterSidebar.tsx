"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  X,
  RotateCcw,
  Sparkles,
  DollarSign,
  Briefcase,
  MapPin,
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
    <aside className="w-full lg:w-72 glass-panel rounded-2xl p-5 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-white font-bold text-sm">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filter Opportunities</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sort By */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Sort Order
        </label>
        <select
          value={selectedSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Work Mode */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Work Mode
        </label>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => updateParam("mode", "all")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              selectedMode === "all"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span>All Modes</span>
            {selectedMode === "all" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
          </button>
          {WORK_MODES.map((m) => {
            const isSelected = selectedMode.toUpperCase() === m.value;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => updateParam("mode", isSelected ? "all" : m.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <span>{m.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compensation Type */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Compensation
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => updateParam("paid", selectedPaid === "paid" ? "all" : "paid")}
            className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              selectedPaid === "paid"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paid Only</span>
          </button>
          <button
            type="button"
            onClick={() => updateParam("paid", selectedPaid === "free" ? "all" : "free")}
            className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              selectedPaid === "free"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                : "bg-slate-950/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <span>Free / Unpaid</span>
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Categories
        </label>
        <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
          <button
            type="button"
            onClick={() => updateParam("category", "all")}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedCategory === "all"
                ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === "all" && <Check className="w-3 h-3 text-indigo-400" />}
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
                    ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <Check className="w-3 h-3 text-indigo-400 flex-shrink-0 ml-1" />}
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
    <Suspense fallback={<div className="w-full lg:w-72 h-96 rounded-2xl bg-slate-900 animate-pulse" />}>
      <FilterSidebarInner {...props} />
    </Suspense>
  );
}
