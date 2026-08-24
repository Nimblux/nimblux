"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bookmark,
  PlusCircle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { getStatusBadge, formatDate } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [savedCount, setSavedCount] = useState(0);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/submissions").then((res) => res.json()),
      fetch("/api/bookmarks").then((res) => res.json()),
    ])
      .then(([subData, bookData]) => {
        if (subData.counts) setCounts(subData.counts);
        if (subData.submissions) setRecentSubmissions(subData.submissions.slice(0, 5));
        if (bookData.opportunities) setSavedCount(bookData.opportunities.length);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-ivory-400 font-mono">
            <span className="font-semibold">Submissions</span>
            <Briefcase className="w-4 h-4 text-bronze-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {counts.total}
          </div>
          <p className="text-[11px] text-ivory-500 font-mono">Opportunities posted</p>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-forest-500/30 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-forest-300 font-mono">
            <span className="font-semibold">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-forest-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {counts.approved}
          </div>
          <p className="text-[11px] text-forest-400/80 font-mono">Live in directory</p>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-bronze-500/30 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-bronze-300 font-mono">
            <span className="font-semibold">Under Review</span>
            <Clock className="w-4 h-4 text-bronze-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {counts.pending}
          </div>
          <p className="text-[11px] text-bronze-400/80 font-mono">Moderator queue</p>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-rose-500/30 space-y-2 shadow-card">
          <div className="flex items-center justify-between text-xs text-rose-300 font-mono">
            <span className="font-semibold">Revision Needed</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {counts.rejected}
          </div>
          <p className="text-[11px] text-rose-400/80 font-mono">Feedback available</p>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder space-y-2 shadow-card col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-ivory-400 font-mono">
            <span className="font-semibold">Saved Items</span>
            <Bookmark className="w-4 h-4 text-bronze-400" />
          </div>
          <div className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            {savedCount}
          </div>
          <p className="text-[11px] text-ivory-500 font-mono">Bookmarks stored</p>
        </div>
      </div>

      {/* Recent Submissions Card */}
      <div className="rounded-3xl bg-charcoal-card p-6 sm:p-8 border border-charcoal-cardBorder space-y-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-heading font-medium text-lg sm:text-xl text-ivory-100">
              Recent Submissions
            </h2>
            <p className="text-xs text-ivory-500 mt-0.5">
              Track the moderation and live status of opportunities you posted.
            </p>
          </div>
          <Link
            href="/dashboard/submissions"
            className="text-xs font-semibold text-bronze-400 hover:text-bronze-300 flex items-center space-x-1"
          >
            <span>View all submissions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal-850 flex items-center justify-center mx-auto text-ivory-500">
              <Briefcase className="w-5 h-5" />
            </div>
            <p className="text-xs text-ivory-500">
              You haven't submitted any opportunities yet.
            </p>
            <Link
              href="/submit-opportunity"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-colors shadow-button"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post an Opportunity</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-ivory-500 uppercase tracking-wider border-b border-charcoal-cardBorder text-[10px] font-mono">
                <tr>
                  <th className="pb-3 font-semibold">Opportunity</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Submitted</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-cardBorder/60">
                {recentSubmissions.map((sub) => {
                  const statusBadge = getStatusBadge(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-charcoal-900/40">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-ivory-100 truncate max-w-xs sm:max-w-sm">
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-ivory-500">
                          {sub.organization}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 capitalize text-ivory-300">
                        {sub.category}
                      </td>
                      <td className="py-3.5 pr-4 text-ivory-500 font-mono">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md font-medium text-[10.5px] border ${statusBadge.className}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`}
                          />
                          <span>{statusBadge.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {sub.status === "APPROVED" ? (
                          <Link
                            href={`/opportunity/${sub.slug}`}
                            className="text-xs font-semibold text-bronze-400 hover:text-bronze-300 inline-flex items-center space-x-1"
                          >
                            <span>Live Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <Link
                            href="/dashboard/submissions"
                            className="text-xs font-semibold text-ivory-400 hover:text-ivory-200"
                          >
                            Inspect
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/submit-opportunity"
          className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 flex items-center space-x-4 shadow-card transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-bronze-500/10 text-bronze-300 flex items-center justify-center border border-bronze-500/20">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-ivory-100">Post Opportunity</div>
            <div className="text-xs text-ivory-500">Submit for review</div>
          </div>
        </Link>

        <Link
          href="/opportunities"
          className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 flex items-center space-x-4 shadow-card transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-forest-500/10 text-forest-300 flex items-center justify-center border border-forest-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-ivory-100">Explore Directory</div>
            <div className="text-xs text-ivory-500">Find new openings</div>
          </div>
        </Link>

        <Link
          href="/dashboard/profile"
          className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 flex items-center space-x-4 shadow-card transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-sage-500/10 text-sage-300 flex items-center justify-center border border-sage-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-ivory-100">Update Profile</div>
            <div className="text-xs text-ivory-500">Skills, college & bio</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
