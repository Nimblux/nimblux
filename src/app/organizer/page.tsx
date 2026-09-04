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
  Briefcase,
  Ticket,
  Send,
  Building2,
  FileText,
} from "lucide-react";
import { formatDate, getStatusBadge } from "@/lib/utils";
import { getHackathonStatusBadge, formatCurrency } from "@/lib/hackathon";

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"opportunities" | "hackathons">("opportunities");

  useEffect(() => {
    fetch("/api/organizer/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setStats(data.stats);
        setHackathons(data.hackathons || []);
        setOpportunities(data.opportunities || []);
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-cardBorder">
        <div>
          <div className="inline-flex items-center space-x-2 text-[#D8B77A] text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Organizer Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            Organizer Hub & Pipelines
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1 font-normal">
            Manage your opportunities, evaluate applicants in candidate pipelines, monitor attendees, broadcast announcements, and issue verifiable certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/submit-opportunity"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Opportunity</span>
          </Link>
          <Link
            href="/organize-hackathon"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] font-medium text-xs text-[#F5F1E8] bg-[#151A18] hover:bg-[#181F1C] border border-white/[0.08] transition-all"
          >
            <Code className="w-4 h-4 text-[#8FA58E]" />
            <span>Host Hackathon</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-1">
          <div className="text-[11px] font-mono text-ivory-500 uppercase tracking-wider">
            Total Opportunities
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-ivory-100 font-mono">
            {stats?.totalOpportunities || 0}
          </div>
          <div className="text-[10.5px] text-forest-300 font-mono">
            {stats?.publishedOpportunities || 0} Published • {stats?.pendingOpportunities || 0} In Review
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-1">
          <div className="text-[11px] font-mono text-ivory-500 uppercase tracking-wider">
            Applications Received
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-bronze-300 font-mono">
            {stats?.totalApplications || 0}
          </div>
          <div className="text-[10.5px] text-ivory-400 font-mono">
            Candidates across all pipelines
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-1">
          <div className="text-[11px] font-mono text-ivory-500 uppercase tracking-wider">
            Event Registrations
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-forest-300 font-mono">
            {stats?.totalRegistrations || 0}
          </div>
          <div className="text-[10.5px] text-ivory-400 font-mono">
            Confirmed attendees
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-1">
          <div className="text-[11px] font-mono text-ivory-500 uppercase tracking-wider">
            Total Hackathons
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300 font-mono">
            {stats?.totalHackathons || 0}
          </div>
          <div className="text-[10.5px] text-ivory-400 font-mono">
            {stats?.totalParticipants || 0} Builders registered
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-charcoal-cardBorder pb-2">
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`pb-2 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "opportunities"
              ? "border-bronze-500 text-bronze-300"
              : "border-transparent text-ivory-500 hover:text-ivory-300"
          }`}
        >
          All Opportunities ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab("hackathons")}
          className={`pb-2 px-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "hackathons"
              ? "border-bronze-500 text-bronze-300"
              : "border-transparent text-ivory-500 hover:text-ivory-300"
          }`}
        >
          Hackathons ({hackathons.length})
        </button>
      </div>

      {/* Content: Opportunities */}
      {activeTab === "opportunities" && (
        <div className="space-y-4">
          {opportunities.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-charcoal-card border border-charcoal-cardBorder space-y-4">
              <div className="w-12 h-12 rounded-full bg-bronze-500/15 text-bronze-300 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
                No Opportunities Posted Yet
              </h3>
              <p className="text-xs text-ivory-400 max-w-sm mx-auto">
                Post internships, jobs, workshops, competitions, scholarships, or meetups to recruit ambitious talent directly on NIMBLUX.
              </p>
              <Link
                href="/submit-opportunity"
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all"
              >
                <span>Post Your First Opportunity</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map((opp) => {
                const statusBadge = getStatusBadge(opp.status);
                return (
                  <div
                    key={opp.id}
                    className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 transition-all flex flex-col justify-between space-y-4 shadow-card"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-bronze-400 bg-bronze-500/10 px-2 py-0.5 rounded-md">
                          {opp.opportunityType || opp.category}
                        </span>
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${statusBadge.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                          <span>{statusBadge.label}</span>
                        </span>
                      </div>

                      <h3 className="font-serif-heading font-medium text-lg text-ivory-100 line-clamp-1">
                        {opp.title}
                      </h3>
                      <div className="text-xs text-ivory-400">
                        {opp.organization} • {opp.location} • Deadline: {formatDate(opp.deadline)}
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-charcoal-cardBorder text-center">
                      <div>
                        <div className="text-[10px] font-mono text-ivory-500 uppercase">Applicants</div>
                        <div className="text-sm font-bold text-ivory-100 font-mono mt-0.5">
                          {opp.applicationCount || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-ivory-500 uppercase">Registered</div>
                        <div className="text-sm font-bold text-forest-300 font-mono mt-0.5">
                          {opp.registrationCount || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-ivory-500 uppercase">Certificates</div>
                        <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                          {opp.certificateCount || 0}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={`/opportunity/${opp.slug}`}
                        target="_blank"
                        className="text-xs text-ivory-500 hover:text-ivory-200 flex items-center space-x-1 transition-colors"
                      >
                        <span>Public View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <Link
                        href={`/organizer/opportunities/${opp.id}`}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all shadow-sm"
                      >
                        <span>Manage Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Content: Hackathons */}
      {activeTab === "hackathons" && (
        <div className="space-y-4">
          {hackathons.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-charcoal-card border border-charcoal-cardBorder space-y-4">
              <div className="w-12 h-12 rounded-full bg-forest-500/15 text-forest-300 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
                No Hackathons Hosted Yet
              </h3>
              <p className="text-xs text-ivory-400 max-w-sm mx-auto">
                Launch a virtual or in-person hackathon with registration, team formation, automated judging, and cryptographic certificates.
              </p>
              <Link
                href="/organize-hackathon"
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all"
              >
                <span>Host Your First Hackathon</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hackathons.map((h) => {
                const statusBadge = getHackathonStatusBadge(h.status);
                return (
                  <div
                    key={h.id}
                    className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder hover:border-forest-500/30 transition-all flex flex-col justify-between space-y-4 shadow-card"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-forest-300 bg-forest-500/10 px-2 py-0.5 rounded-md">
                          {h.theme || "Hackathon"}
                        </span>
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${statusBadge.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                          <span>{statusBadge.label}</span>
                        </span>
                      </div>

                      <h3 className="font-serif-heading font-medium text-lg text-ivory-100 line-clamp-1">
                        {h.title}
                      </h3>
                      <div className="text-xs text-ivory-400">
                        {h.organizerName} • Prize Pool: {formatCurrency(h.prizePoolTotal || 0, h.prizePoolCurrency || "INR")}
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-charcoal-cardBorder text-center">
                      <div>
                        <div className="text-[10px] font-mono text-ivory-500 uppercase">Builders</div>
                        <div className="text-sm font-bold text-ivory-100 font-mono mt-0.5">
                          {h.registrationCount || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-ivory-500 uppercase">Teams</div>
                        <div className="text-sm font-bold text-forest-300 font-mono mt-0.5">
                          {h.teamCount || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-ivory-500 uppercase">Submissions</div>
                        <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                          {h.submissionCount || 0}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={`/hackathons/${h.slug}`}
                        target="_blank"
                        className="text-xs text-ivory-500 hover:text-ivory-200 flex items-center space-x-1 transition-colors"
                      >
                        <span>Public View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <Link
                        href={`/organizer/hackathons/${h.id}`}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-forest-500 hover:bg-forest-400 transition-all shadow-sm"
                      >
                        <span>Manage Hackathon</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
