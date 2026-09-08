"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  Github,
  Linkedin,
  Globe,
  Award,
  Calendar,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OrganizerParticipantsPage() {
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchParticipants = (q = "") => {
    setLoading(true);
    const url = q ? `/api/organizer/participants?q=${encodeURIComponent(q)}` : "/api/organizer/participants";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setParticipants(d.participants || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParticipants(searchQuery);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-[#D8B77A] text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Community & Talent Database</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            Participant & Talent Directory
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1 font-normal">
            Unified directory of candidates, attendees, and hackathon builders who have engaged with your organization.
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-[#D8B77A]">{participants.length}</div>
          <div className="text-[11px] font-mono text-[#A9AAA5]">Engaged Builders</div>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#7E807B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, university, skill..."
          className="w-full pl-8 pr-3 py-2 rounded-[10px] bg-[#111615] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
        />
      </form>

      {/* Talent Directory List */}
      <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin mx-auto" />
          </div>
        ) : participants.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users className="w-8 h-8 text-[#A9AAA5] mx-auto opacity-50" />
            <p className="text-xs text-[#A9AAA5]">No participants found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {participants.map((p) => (
              <div
                key={p.email}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-[#F5F1E8]">
                      {p.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono text-[#D8B77A] bg-[#D8B77A]/10 border border-[#D8B77A]/25">
                      {p.activities?.length || 1} Interactions
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#A9AAA5] font-mono">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-[#7E807B]" />
                      <a href={`mailto:${p.email}`} className="hover:text-[#F5F1E8]">{p.email}</a>
                    </span>
                    {p.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-[#7E807B]" />
                        <span>{p.phone}</span>
                      </span>
                    )}
                    {p.college && (
                      <span className="flex items-center space-x-1">
                        <GraduationCap className="w-3 h-3 text-[#7E807B]" />
                        <span>{p.college}</span>
                      </span>
                    )}
                  </div>

                  {/* Skills tags */}
                  {p.skills && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.skills.split(",").slice(0, 6).map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-[5px] text-[10px] bg-[#0E1110] text-[#A9AAA5] border border-white/[0.06]"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Activities summary */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.activities?.map((act: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-[5px] text-[10.5px] text-[#A9AAA5] bg-white/[0.03] border border-white/[0.06]"
                      >
                        {act.category}: {act.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0 pt-1">
                  {p.resumeUrl && (
                    <a
                      href={p.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-[#F5F1E8] text-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#D8B77A]" />
                      <span>Resume</span>
                    </a>
                  )}
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-[8px] bg-[#0E1110] hover:bg-white/[0.05] text-[#A9AAA5] hover:text-[#F5F1E8] border border-white/[0.06] transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {p.linkedinUrl && (
                    <a
                      href={p.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-[8px] bg-[#0E1110] hover:bg-white/[0.05] text-[#A9AAA5] hover:text-[#F5F1E8] border border-white/[0.06] transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {p.portfolioUrl && (
                    <a
                      href={p.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-[8px] bg-[#0E1110] hover:bg-white/[0.05] text-[#A9AAA5] hover:text-[#F5F1E8] border border-white/[0.06] transition-colors"
                      title="Portfolio"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
