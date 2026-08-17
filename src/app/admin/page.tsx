"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MousePointerClick,
  Calendar,
  Flag,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Platform Overview</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            NIMBLUX Moderation Dashboard
          </h1>
        </div>

        <Link
          href="/admin/opportunities"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <span>Open Moderation Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Moderation Alert Banner if Pending > 0 */}
      {stats?.pendingOpportunities > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0 animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">
                {stats.pendingOpportunities} Opportunity {stats.pendingOpportunities === 1 ? "Submission" : "Submissions"} Awaiting Review
              </div>
              <p className="text-xs text-slate-400">
                Submissions remain hidden from public users until approved by an administrator.
              </p>
            </div>
          </div>
          <Link
            href="/admin/opportunities?status=PENDING"
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors whitespace-nowrap text-center"
          >
            Review Now →
          </Link>
        </div>
      )}

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Registered Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {stats?.totalUsers || 0}
          </div>
          <p className="text-[11px] text-slate-500">Students & recruiters</p>
        </div>

        {/* Total Opportunities */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Total Listings</span>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {stats?.totalOpportunities || 0}
          </div>
          <p className="text-[11px] text-slate-500">Across 14 categories</p>
        </div>

        {/* Approved Published */}
        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span className="font-semibold">Published Listings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {stats?.approvedOpportunities || 0}
          </div>
          <p className="text-[11px] text-emerald-400/80">Live on public site</p>
        </div>

        {/* Pending Approval */}
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/20 bg-amber-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span className="font-semibold">Pending Approval</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {stats?.pendingOpportunities || 0}
          </div>
          <p className="text-[11px] text-amber-400/80">Awaiting moderation</p>
        </div>

        {/* Rejected / Revisions */}
        <div className="p-5 rounded-2xl glass-panel border border-rose-500/20 bg-rose-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span className="font-semibold">Rejected Submissions</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {stats?.rejectedOpportunities || 0}
          </div>
          <p className="text-[11px] text-rose-400/80">Returned with feedback</p>
        </div>

        {/* Total Application Clicks */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Application Clicks</span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {stats?.totalClicks?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-500">Student conversions</p>
        </div>

        {/* Total Events */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Active Events</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {stats?.totalEvents || 0}
          </div>
          <p className="text-[11px] text-slate-500">Hackathons & summits</p>
        </div>

        {/* User Reports */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">User Reports</span>
            <Flag className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {stats?.pendingReports || 0}
          </div>
          <p className="text-[11px] text-slate-500">Flagged listings</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/opportunities"
          className="p-6 rounded-3xl glass-panel glass-panel-hover border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Opportunity Moderation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Approve pending submissions, reject with custom reasons, feature listings, or edit existing posts.
            </p>
          </div>
          <div className="text-xs font-bold text-amber-400 flex items-center space-x-1">
            <span>Manage Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="p-6 rounded-3xl glass-panel glass-panel-hover border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">User Accounts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              View registered users, change admin roles, suspend accounts, and inspect individual submissions.
            </p>
          </div>
          <div className="text-xs font-bold text-indigo-400 flex items-center space-x-1">
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/events"
          className="p-6 rounded-3xl glass-panel glass-panel-hover border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">NIMBLUX Events</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create and manage official hackathons, webinars, summits, and campus masterclasses.
            </p>
          </div>
          <div className="text-xs font-bold text-purple-400 flex items-center space-x-1">
            <span>Manage Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
