"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Code,
  Sparkles,
  PlusCircle,
  Calendar,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getHackathonStatusBadge, formatCurrency } from "@/lib/hackathon";

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [hackathons, setHackathons] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/organizer/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setStats(data.stats);
        setHackathons(data.hackathons || []);
      })
      .catch(() => {
        router.push("/login?redirect=/organizer");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-cardBorder">
        <div>
          <div className="inline-flex items-center space-x-2 text-bronze-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Organizer Management Suite</span>
          </div>
          <h1 className="font-serif-heading font-medium text-3xl sm:text-4xl text-ivory-100">
            Hackathon Organizer Console
          </h1>
          <p className="text-xs text-ivory-500 mt-1 font-normal">
            Manage your hackathons, review builder applications, monitor submissions, and publish winners.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/organize-hackathon"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Hackathon</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-1">
          <div className="text-[11px] font-mono text-ivory-500 uppercase tracking-wider">
            Total Hosted
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-ivory-100 font-mono">
            {stats?.totalHackathons || 0}
          </div>
          <div className="text-[10.5px] text-forest-300 font-mono">
            {stats?.published || 0} Live / Published
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-1">
          <div className="text-[11px] font-mono text-ivory-500 uppercase tracking-wider">
            Total Participants
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-bronze-300 font-mono">
            {stats?.totalParticipants || 0}
          </div>
          <div className="text-[10.5px] text-ivory-400 font-mono">
            Across all events
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-1">
          <div className="text-[11px] font-mono text-ivory-500 uppercase tracking-wider">
            Builder Teams
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-forest-300 font-mono">
            {stats?.totalTeams || 0}
          </div>
          <div className="text-[10.5px] text-ivory-400 font-mono">
            Formed in-platform
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-1">
          <div className="text-[11px] font-mono text-ivory-500 uppercase tracking-wider">
            Project Submissions
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300 font-mono">
            {stats?.totalSubmissions || 0}
          </div>
          <div className="text-[10.5px] text-ivory-400 font-mono">
            {stats?.totalWinners || 0} Winners Awarded
          </div>
        </div>
      </div>

      {/* Hosted Hackathons List */}
      <div className="space-y-4">
        <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
          Your Hackathons
        </h2>

        {hackathons.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4">
            <Trophy className="w-12 h-12 text-ivory-500 mx-auto" />
            <h3 className="text-base font-bold text-ivory-100">No hackathons hosted yet</h3>
            <p className="text-xs text-ivory-500 max-w-sm mx-auto leading-relaxed">
              Launch your first student hackathon, configure custom tracks and prize pools, and invite builders.
            </p>
            <div className="pt-2">
              <Link
                href="/organize-hackathon"
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Host a Hackathon</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hackathons.map((h) => {
              const statusBadge = getHackathonStatusBadge(h.status);
              return (
                <div
                  key={h.id}
                  className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card hover:border-bronze-500/30 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold border ${statusBadge.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                        <span>{statusBadge.label}</span>
                      </span>
                      <span className="text-[11px] font-mono text-ivory-500">
                        {h.mode}
                      </span>
                    </div>

                    <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
                      {h.title}
                    </h3>
                    <p className="text-xs text-ivory-400 line-clamp-2">
                      {h.tagline || h.shortDescription}
                    </p>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-center font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-ivory-500">Registered</div>
                        <div className="font-bold text-ivory-100 mt-0.5">{h.registrationCount || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-ivory-500">Teams</div>
                        <div className="font-bold text-bronze-300 mt-0.5">{h.teamCount || 0}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-ivory-500">Submissions</div>
                        <div className="font-bold text-forest-300 mt-0.5">{h.submissionCount || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-charcoal-cardBorder flex items-center justify-between">
                    <Link
                      href={`/hackathon/${h.slug}`}
                      target="_blank"
                      className="inline-flex items-center space-x-1 text-xs text-ivory-400 hover:text-ivory-200"
                    >
                      <span>Public Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <Link
                      href={`/organizer/hackathons/${h.id}`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Manage Hackathon</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
