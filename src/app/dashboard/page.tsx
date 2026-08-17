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
          <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Total Submissions</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {counts.total}
          </div>
          <p className="text-[11px] text-slate-500">Opportunities posted</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span className="font-semibold">Approved (Live)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {counts.approved}
          </div>
          <p className="text-[11px] text-emerald-400/80">Publicly visible</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-amber-500/20 bg-amber-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span className="font-semibold">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {counts.pending}
          </div>
          <p className="text-[11px] text-amber-400/80">In moderation queue</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-rose-500/20 bg-rose-500/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span className="font-semibold">Needs Revision</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {counts.rejected}
          </div>
          <p className="text-[11px] text-rose-400/80">Check feedback</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-indigo-500/20 bg-indigo-500/5 space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-indigo-300">
            <span className="font-semibold">Saved Items</span>
            <Bookmark className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {savedCount}
          </div>
          <p className="text-[11px] text-indigo-400/80">Bookmarked opportunities</p>
        </div>
      </div>

      {/* Recent Submissions Card */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 bg-slate-900/40 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-white">
              Recent Submissions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track the verification status of opportunities you posted.
            </p>
          </div>
          <Link
            href="/dashboard/submissions"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>View all submissions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400">
              You haven't submitted any opportunities yet.
            </p>
            <Link
              href="/submit-opportunity"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post an Opportunity</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="pb-3 font-semibold">Opportunity</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Submitted</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentSubmissions.map((sub) => {
                  const statusBadge = getStatusBadge(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-900/40">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-white truncate max-w-xs sm:max-w-sm">
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.organization}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 capitalize text-slate-300">
                        {sub.category}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-400">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] ${statusBadge.className}`}
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
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1"
                          >
                            <span>Live Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <Link
                            href="/dashboard/submissions"
                            className="text-xs font-semibold text-slate-300 hover:text-white"
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
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 bg-slate-900/40 flex items-center space-x-4"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">Post Opportunity</div>
            <div className="text-xs text-slate-400">Submit for review</div>
          </div>
        </Link>

        <Link
          href="/opportunities"
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 bg-slate-900/40 flex items-center space-x-4"
        >
          <div className="w-11 h-11 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">Explore Directory</div>
            <div className="text-xs text-slate-400">Find new openings</div>
          </div>
        </Link>

        <Link
          href="/dashboard/profile"
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 bg-slate-900/40 flex items-center space-x-4"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">Update Profile</div>
            <div className="text-xs text-slate-400">Skills, college & bio</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
