"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Send,
  Ticket,
  Calendar,
} from "lucide-react";
import { formatDate, getStatusBadge } from "@/lib/utils";

export default function OrganizerOpportunitiesPage() {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/organizer/stats")
      .then((r) => r.json())
      .then((d) => {
        setOpportunities(d.opportunities || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = opportunities.filter((opp) => {
    if (statusFilter !== "ALL" && opp.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return opp.title.toLowerCase().includes(q) || opp.category.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-[#D8B77A] text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Opportunities Portfolio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            Manage Opportunities
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1 font-normal">
            Track published listings, monitor applicant flow, and evaluate candidates across all your postings.
          </p>
        </div>

        <Link
          href="/submit-opportunity"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Opportunity</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1 p-1 rounded-[10px] bg-[#111615] border border-white/[0.06] overflow-x-auto max-w-full">
          {["ALL", "APPROVED", "PENDING", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-[7px] text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-[#D8B77A] text-[#090B0B] font-semibold"
                  : "text-[#A9AAA5] hover:text-[#F5F1E8]"
              }`}
            >
              {st === "ALL" ? "All Statuses" : st === "APPROVED" ? "Published" : st === "PENDING" ? "In Review" : "Rejected"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#7E807B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-8 pr-3 py-1.5 rounded-[9px] bg-[#111615] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
          />
        </div>
      </div>

      {/* Opportunities List */}
      <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Briefcase className="w-8 h-8 text-[#A9AAA5] mx-auto opacity-50" />
            <p className="text-xs text-[#A9AAA5]">No opportunities match your filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((opp) => (
              <div
                key={opp.id}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/organizer/opportunities/${opp.id}`}
                      className="font-semibold text-sm text-[#F5F1E8] hover:text-[#D8B77A] transition-colors truncate"
                    >
                      {opp.title}
                    </Link>
                    <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono uppercase bg-[#0E1110] text-[#A9AAA5] border border-white/[0.06]">
                      {opp.opportunityType || opp.category}
                    </span>
                    {getStatusBadge(opp.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#A9AAA5] font-mono">
                    <span className="flex items-center space-x-1 text-[#D8B77A]">
                      <Send className="w-3.5 h-3.5" />
                      <span>{opp.applicationCount || 0} Applicants</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[#8FA58E]">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{opp.registrationCount || 0} Attendees</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{opp.viewsCount || 0} Views</span>
                    </span>
                    <span>•</span>
                    <span>Deadline: {formatDate(opp.deadline)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Link
                    href={`/organizer/opportunities/${opp.id}`}
                    className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-[8px] bg-[#D8B77A]/10 hover:bg-[#D8B77A]/20 text-[#D8B77A] text-xs font-semibold transition-colors"
                  >
                    <span>Manage Pipeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/opportunity/${opp.slug}`}
                    target="_blank"
                    className="p-2 rounded-[8px] bg-[#0E1110] hover:bg-[#151A18] text-[#A9AAA5] hover:text-[#F5F1E8] border border-white/[0.06] transition-colors"
                    title="View public listing"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
