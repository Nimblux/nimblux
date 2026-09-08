"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Plus,
  Users,
  Code,
  FileCode,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getHackathonStatusBadge } from "@/lib/hackathon";

export default function OrganizerHackathonsPage() {
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/organizer/stats")
      .then((r) => r.json())
      .then((d) => setHackathons(d.hackathons || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            <Trophy className="w-4 h-4" />
            <span>Hackathon Management Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            Hosted Hackathons
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1 font-normal">
            Manage registrations, builder teams, track submissions, assign judges, and announce winners.
          </p>
        </div>

        <Link
          href="/organize-hackathon"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Host New Hackathon</span>
        </Link>
      </div>

      {/* Hackathons List */}
      <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] overflow-hidden">
        {hackathons.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Trophy className="w-8 h-8 text-[#A9AAA5] mx-auto opacity-50" />
            <p className="text-xs text-[#A9AAA5]">You haven't hosted any hackathons yet.</p>
            <Link
              href="/organize-hackathon"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] text-xs font-semibold text-[#090B0B] bg-[#D8B77A]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Host Your First Hackathon</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {hackathons.map((h) => (
              <div
                key={h.id}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/organizer/hackathons/${h.id}`}
                      className="font-semibold text-sm text-[#F5F1E8] hover:text-[#D8B77A] transition-colors truncate"
                    >
                      {h.title}
                    </Link>
                    {(() => {
                      const badge = getHackathonStatusBadge(h.status);
                      return (
                        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-medium ${badge.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                          <span>{badge.label}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#A9AAA5] font-mono">
                    <span className="flex items-center space-x-1 text-[#D8B77A]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{h.registrationCount || 0} Registered Builders</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[#8FA58E]">
                      <Code className="w-3.5 h-3.5" />
                      <span>{h.teamCount || 0} Teams</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileCode className="w-3.5 h-3.5" />
                      <span>{h.submissionCount || 0} Projects</span>
                    </span>
                    <span>•</span>
                    <span>Starts: {formatDate(h.startDate)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Link
                    href={`/organizer/hackathons/${h.id}`}
                    className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-[8px] bg-[#D8B77A]/10 hover:bg-[#D8B77A]/20 text-[#D8B77A] text-xs font-semibold transition-colors"
                  >
                    <span>Manage Hackathon</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/hackathon/${h.slug}`}
                    target="_blank"
                    className="p-2 rounded-[8px] bg-[#0E1110] hover:bg-[#151A18] text-[#A9AAA5] hover:text-[#F5F1E8] border border-white/[0.06] transition-colors"
                    title="View public hackathon"
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
