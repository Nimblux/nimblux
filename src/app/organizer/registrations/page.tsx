"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Search,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OrganizerRegistrationsPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRegistrations = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedOppId !== "ALL") params.append("opportunityId", selectedOppId);
    if (searchQuery) params.append("q", searchQuery);

    fetch(`/api/organizer/registrations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setRegistrations(d.registrations || []);
        if (d.opportunities) setOpportunities(d.opportunities);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRegistrations();
  }, [selectedOppId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations();
  };

  const handleToggleAttendance = async (reg: any) => {
    setUpdatingId(reg.id);
    const nextAttendance = !reg.attendanceMarked;
    try {
      const res = await fetch("/api/organizer/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: reg.id,
          attendanceMarked: nextAttendance,
        }),
      });
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === reg.id ? { ...r, attendanceMarked: nextAttendance } : r))
        );
      }
    } catch {}
    setUpdatingId(null);
  };

  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    const headers = ["Name", "Email", "Phone", "College", "Event Title", "Attendance", "Registration Date"];
    const rows = registrations.map((r) => [
      `"${r.name || ""}"`,
      `"${r.email || ""}"`,
      `"${r.phone || ""}"`,
      `"${r.college || ""}"`,
      `"${r.opportunity?.title || ""}"`,
      r.attendanceMarked ? "Attended" : "Registered",
      `"${formatDate(r.createdAt)}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees_${selectedOppId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-[#8FA58E] text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Ticket className="w-4 h-4" />
            <span>Attendee & Event Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            Event Registrations
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1 font-normal">
            Track confirmed attendees, verify check-ins, and export attendee lists for workshops and events.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={registrations.length === 0}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-[9px] font-semibold text-xs text-[#F5F1E8] bg-[#151A18] hover:bg-[#181F1C] border border-white/[0.08] transition-all disabled:opacity-40"
        >
          <Download className="w-4 h-4 text-[#8FA58E]" />
          <span>Export Attendee CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Event Dropdown */}
        <select
          value={selectedOppId}
          onChange={(e) => setSelectedOppId(e.target.value)}
          className="w-full sm:w-80 px-3 py-2 rounded-[10px] bg-[#111615] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
        >
          <option value="ALL">All Events & Workshops ({opportunities.length})</option>
          {opportunities.map((opp) => (
            <option key={opp.id} value={opp.id}>
              {opp.title}
            </option>
          ))}
        </select>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#7E807B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attendee by name, college..."
            className="w-full pl-8 pr-3 py-2 rounded-[10px] bg-[#111615] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
          />
        </form>
      </div>

      {/* Registrations List */}
      <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin mx-auto" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Ticket className="w-8 h-8 text-[#A9AAA5] mx-auto opacity-50" />
            <p className="text-xs text-[#A9AAA5]">No registrations found for this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-[#F5F1E8]">
                      {reg.name}
                    </span>
                    {reg.attendanceMarked ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-[5px] text-[10px] font-mono text-[#8FA58E] bg-[#8FA58E]/15 border border-[#8FA58E]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Attended</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-[5px] text-[10px] font-mono text-[#A9AAA5] bg-white/[0.04] border border-white/[0.06]">
                        <span>Registered</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#8FA58E] font-medium">
                    Event: {reg.opportunity?.title}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#A9AAA5] font-mono">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-[#7E807B]" />
                      <span>{reg.email}</span>
                    </span>
                    {reg.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-[#7E807B]" />
                        <span>{reg.phone}</span>
                      </span>
                    )}
                    {reg.college && (
                      <span className="flex items-center space-x-1">
                        <GraduationCap className="w-3 h-3 text-[#7E807B]" />
                        <span>{reg.college}</span>
                      </span>
                    )}
                    <span>•</span>
                    <span>Registered: {formatDate(reg.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleAttendance(reg)}
                    disabled={updatingId === reg.id}
                    className={`px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                      reg.attendanceMarked
                        ? "bg-white/[0.05] text-[#A9AAA5] hover:text-[#F5F1E8] border border-white/[0.08]"
                        : "bg-[#8FA58E]/15 text-[#8FA58E] hover:bg-[#8FA58E]/25 border border-[#8FA58E]/30"
                    }`}
                  >
                    {updatingId === reg.id ? "Updating..." : reg.attendanceMarked ? "Mark Absent" : "Mark Attended"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
