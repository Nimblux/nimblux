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
          <div key={i} className="h-28 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-bronze-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Platform Overview</span>
          </div>
          <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            Moderation Dashboard
          </h1>
        </div>

        <Link
          href="/admin/opportunities"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all self-start sm:self-auto"
        >
          <span>Open Moderation Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Moderation Alert Banner if Pending > 0 */}
      {stats?.pendingOpportunities > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-card border border-bronze-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-bronze-500/20 border border-bronze-500/40 flex items-center justify-center text-bronze-300 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-ivory-100 font-mono">
                {stats.pendingOpportunities} Opportunity {stats.pendingOpportunities === 1 ? "Submission" : "Submissions"} Awaiting Review
              </div>
              <p className="text-xs text-ivory-500">
                Submissions remain hidden from public users until approved by an administrator.
              </p>
            </div>
          </div>
          <Link
            href="/admin/opportunities?status=PENDING"
            className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-colors whitespace-nowrap text-center shadow-button"
          >
            Review Now →
          </Link>
        </div>
      )}

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-ivory-400 font-mono">
            <span className="font-semibold">Registered Users</span>
            <Users className="w-4 h-4 text-bronze-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {stats?.totalUsers || 0}
          </div>
          <p className="text-[11px] text-ivory-500 font-mono">Students & recruiters</p>
        </div>

        {/* Total Opportunities */}
        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-ivory-400 font-mono">
            <span className="font-semibold">Total Listings</span>
            <Briefcase className="w-4 h-4 text-bronze-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {stats?.totalOpportunities || 0}
          </div>
          <p className="text-[11px] text-ivory-500 font-mono">Across 14 categories</p>
        </div>

        {/* Approved Published */}
        <div className="p-5 rounded-2xl bg-charcoal-card border border-forest-500/30 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-forest-300 font-mono">
            <span className="font-semibold">Published Listings</span>
            <CheckCircle2 className="w-4 h-4 text-forest-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {stats?.approvedOpportunities || 0}
          </div>
          <p className="text-[11px] text-forest-400/80 font-mono">Live in directory</p>
        </div>

        {/* Pending Approval */}
        <div className="p-5 rounded-2xl bg-charcoal-card border border-bronze-500/30 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-bronze-300 font-mono">
            <span className="font-semibold">Pending Approval</span>
            <Clock className="w-4 h-4 text-bronze-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {stats?.pendingOpportunities || 0}
          </div>
          <p className="text-[11px] text-bronze-400/80 font-mono">Awaiting moderation</p>
        </div>

        {/* Rejected / Revisions */}
        <div className="p-5 rounded-2xl bg-charcoal-card border border-rose-500/30 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-rose-300 font-mono">
            <span className="font-semibold">Rejected Listings</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {stats?.rejectedOpportunities || 0}
          </div>
          <p className="text-[11px] text-rose-400/80 font-mono">Returned with feedback</p>
        </div>

        {/* Total Application Clicks */}
        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-ivory-400 font-mono">
            <span className="font-semibold">Application Clicks</span>
            <MousePointerClick className="w-4 h-4 text-forest-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {stats?.totalClicks?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-ivory-500 font-mono">Student conversions</p>
        </div>

        {/* Total Events */}
        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-ivory-400 font-mono">
            <span className="font-semibold">Active Events</span>
            <Calendar className="w-4 h-4 text-sage-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {stats?.totalEvents || 0}
          </div>
          <p className="text-[11px] text-ivory-500 font-mono">Hackathons & summits</p>
        </div>

        {/* User Reports */}
        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-ivory-400 font-mono">
            <span className="font-semibold">User Reports</span>
            <Flag className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {stats?.pendingReports || 0}
          </div>
          <p className="text-[11px] text-ivory-500 font-mono">Flagged listings</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/opportunities"
          className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 flex flex-col justify-between space-y-4 shadow-card transition-all"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-bronze-500/10 border border-bronze-500/25 flex items-center justify-center text-bronze-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading font-medium text-base text-ivory-100">Opportunity Moderation</h3>
            <p className="text-xs text-ivory-500 leading-relaxed">
              Approve pending submissions, reject with custom reasons, feature listings, or edit existing posts.
            </p>
          </div>
          <div className="text-xs font-semibold text-bronze-400 flex items-center space-x-1 font-mono">
            <span>Manage Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 flex flex-col justify-between space-y-4 shadow-card transition-all"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-forest-500/10 border border-forest-500/25 flex items-center justify-center text-forest-300">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading font-medium text-base text-ivory-100">User Accounts</h3>
            <p className="text-xs text-ivory-500 leading-relaxed">
              View registered users, change admin roles, suspend accounts, and inspect individual submissions.
            </p>
          </div>
          <div className="text-xs font-semibold text-forest-400 flex items-center space-x-1 font-mono">
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/events"
          className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 flex flex-col justify-between space-y-4 shadow-card transition-all"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sage-500/10 border border-sage-500/25 flex items-center justify-center text-sage-300">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading font-medium text-base text-ivory-100">NIMBLUX Events</h3>
            <p className="text-xs text-ivory-500 leading-relaxed">
              Create and manage official hackathons, webinars, summits, and campus masterclasses.
            </p>
          </div>
          <div className="text-xs font-semibold text-sage-400 flex items-center space-x-1 font-mono">
            <span>Manage Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
