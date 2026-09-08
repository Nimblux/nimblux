"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  Plus,
  Ticket,
  ExternalLink,
  ChevronRight,
  Clock,
  Video,
  MapPin,
} from "lucide-react";
import { formatDate, getStatusBadge } from "@/lib/utils";

export default function OrganizerEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/organizer/stats")
      .then((r) => r.json())
      .then((d) => {
        const opps = d.opportunities || [];
        const eventList = opps.filter((o: any) =>
          ["WORKSHOP", "EVENT", "COURSE", "BOOTCAMP", "WEBINAR", "CONFERENCE"].includes(
            (o.opportunityType || o.category || "").toUpperCase()
          )
        );
        setEvents(eventList);
      })
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
          <div className="flex items-center space-x-2 text-[#8FA58E] text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Events & Masterclasses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            Workshops & Events Hub
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1 font-normal">
            Host live tech masterclasses, webinars, community meetups, and conferences with real-time attendee tracking.
          </p>
        </div>

        <Link
          href="/submit-opportunity?type=workshop"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Host New Event / Workshop</span>
        </Link>
      </div>

      {/* Events List */}
      <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Calendar className="w-8 h-8 text-[#A9AAA5] mx-auto opacity-50" />
            <p className="text-xs text-[#A9AAA5]">No workshops or events posted yet.</p>
            <Link
              href="/submit-opportunity?type=workshop"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] text-xs font-semibold text-[#090B0B] bg-[#D8B77A]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Host Your First Workshop</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/organizer/opportunities/${ev.id}`}
                      className="font-semibold text-sm text-[#F5F1E8] hover:text-[#D8B77A] transition-colors truncate"
                    >
                      {ev.title}
                    </Link>
                    <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono uppercase bg-[#0E1110] text-[#8FA58E] border border-[#8FA58E]/30">
                      {ev.opportunityType || ev.category}
                    </span>
                    {getStatusBadge(ev.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#A9AAA5] font-mono">
                    <span className="flex items-center space-x-1 text-[#8FA58E]">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{ev.registrationCount || 0} Registered Attendees</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[#7E807B]" />
                      <span>{ev.location || "Online"}</span>
                    </span>
                    <span>•</span>
                    <span>Deadline: {formatDate(ev.deadline)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Link
                    href={`/organizer/opportunities/${ev.id}`}
                    className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-[8px] bg-[#8FA58E]/15 hover:bg-[#8FA58E]/25 text-[#8FA58E] text-xs font-semibold border border-[#8FA58E]/30 transition-colors"
                  >
                    <span>Manage Attendees</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/opportunity/${ev.slug}`}
                    target="_blank"
                    className="p-2 rounded-[8px] bg-[#0E1110] hover:bg-[#151A18] text-[#A9AAA5] hover:text-[#F5F1E8] border border-white/[0.06] transition-colors"
                    title="View public page"
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
