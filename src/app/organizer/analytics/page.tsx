"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Send,
  Ticket,
  Trophy,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function OrganizerAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch("/api/organizer/analytics")
      .then((r) => r.json())
      .then((d) => setAnalytics(d))
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

  const summary = analytics?.summary || {};
  const stageCounts = analytics?.stageCounts || {};
  const topColleges = analytics?.topColleges || [];
  const topSkills = analytics?.topSkills || [];

  const maxCollegeCount = topColleges.length > 0 ? topColleges[0].count : 1;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center space-x-2 text-[#D8B77A] text-xs font-mono font-semibold uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Operational Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
          Performance & Candidate Analytics
        </h1>
        <p className="text-xs text-[#A9AAA5] mt-1 font-normal">
          Real-time metrics on candidate flow, applicant demographics, engagement conversion, and top university talent.
        </p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[15px] bg-[#111615] border border-white/[0.08] space-y-1">
          <div className="text-[11px] font-mono text-[#A9AAA5] uppercase tracking-wider">
            Total Views
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#F5F1E8]">
            {summary.totalViews || 0}
          </div>
          <div className="text-[10.5px] text-[#A9AAA5] font-mono">
            {summary.totalClicks || 0} Engaged interactions
          </div>
        </div>

        <div className="p-5 rounded-[15px] bg-[#111615] border border-white/[0.08] space-y-1">
          <div className="text-[11px] font-mono text-[#A9AAA5] uppercase tracking-wider">
            Applications
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#D8B77A]">
            {summary.totalApplications || 0}
          </div>
          <div className="text-[10.5px] text-[#8FA58E] font-mono">
            Across {summary.totalOpportunities || 0} postings
          </div>
        </div>

        <div className="p-5 rounded-[15px] bg-[#111615] border border-white/[0.08] space-y-1">
          <div className="text-[11px] font-mono text-[#A9AAA5] uppercase tracking-wider">
            Application Conversion
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#8FA58E]">
            {summary.conversionRate}%
          </div>
          <div className="text-[10.5px] text-[#A9AAA5] font-mono">
            Views to submitted applications
          </div>
        </div>

        <div className="p-5 rounded-[15px] bg-[#111615] border border-white/[0.08] space-y-1">
          <div className="text-[11px] font-mono text-[#A9AAA5] uppercase tracking-wider">
            Event & Hackathon Reach
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#F5F1E8]">
            {(summary.totalRegistrations || 0) + (summary.totalHackathonRegistrations || 0)}
          </div>
          <div className="text-[10.5px] text-[#A9AAA5] font-mono">
            {summary.totalRegistrations || 0} Attendees • {summary.totalHackathonRegistrations || 0} Builders
          </div>
        </div>
      </div>

      {/* Grid: Funnel & Demographic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Pipeline Stage Distribution */}
        <div className="p-6 rounded-[18px] bg-[#111615] border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-[#F5F1E8]">Candidate Pipeline Funnel</h3>
              <p className="text-xs text-[#A9AAA5]">Distribution of candidates across evaluation stages</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#D8B77A]" />
          </div>

          <div className="space-y-3">
            {[
              { label: "Submitted", count: stageCounts.SUBMITTED || 0, color: "bg-[#7E807B]" },
              { label: "Under Review", count: stageCounts.UNDER_REVIEW || 0, color: "bg-blue-500" },
              { label: "Shortlisted", count: stageCounts.SHORTLISTED || 0, color: "bg-[#D8B77A]" },
              { label: "Interview", count: stageCounts.INTERVIEW || 0, color: "bg-purple-500" },
              { label: "Selected", count: stageCounts.SELECTED || 0, color: "bg-[#8FA58E]" },
              { label: "Rejected", count: stageCounts.REJECTED || 0, color: "bg-rose-500" },
            ].map((stage) => {
              const pct = summary.totalApplications > 0 ? ((stage.count / summary.totalApplications) * 100).toFixed(0) : "0";
              return (
                <div key={stage.label} className="space-y-1 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-[#F5F1E8]">{stage.label}</span>
                    <span className="text-[#A9AAA5]">{stage.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0E1110] overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(Number(pct), 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Universities / Colleges */}
        <div className="p-6 rounded-[18px] bg-[#111615] border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-[#F5F1E8]">Top Candidate Universities</h3>
              <p className="text-xs text-[#A9AAA5]">Most represented campuses among your applicant pool</p>
            </div>
            <GraduationCap className="w-4 h-4 text-[#8FA58E]" />
          </div>

          {topColleges.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#A9AAA5]">
              No university data recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topColleges.map((col: any) => {
                const pct = ((col.count / maxCollegeCount) * 100).toFixed(0);
                return (
                  <div key={col.name} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#F5F1E8] truncate font-medium max-w-[280px]">{col.name}</span>
                      <span className="text-[#D8B77A] font-mono font-semibold">{col.count} candidates</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0E1110] overflow-hidden">
                      <div
                        className="h-full bg-[#8FA58E] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Verified Candidate Skills */}
      <div className="p-6 rounded-[18px] bg-[#111615] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-[#F5F1E8]">Most Common Candidate Skills</h3>
            <p className="text-xs text-[#A9AAA5]">Key technical abilities identified across your applicant pipeline</p>
          </div>
          <Sparkles className="w-4 h-4 text-[#D8B77A]" />
        </div>

        {topSkills.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#A9AAA5]">
            No skills data recorded yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topSkills.map((sk: any) => (
              <div
                key={sk.name}
                className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-[8px] bg-[#0E1110] border border-white/[0.08]"
              >
                <span className="text-xs font-medium text-[#F5F1E8]">{sk.name}</span>
                <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-mono font-bold text-[#D8B77A] bg-[#D8B77A]/10">
                  {sk.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
