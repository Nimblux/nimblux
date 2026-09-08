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
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Ticket,
  Building2,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Plus,
} from "lucide-react";
import { formatDate, getStatusBadge } from "@/lib/utils";
import { getHackathonStatusBadge, formatCurrency } from "@/lib/hackathon";

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [orgData, setOrgData] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/organizer/stats").then((r) => r.json()),
      fetch("/api/organizer/organization").then((r) => r.json()),
    ])
      .then(([statsRes, orgRes]) => {
        setStats(statsRes.stats);
        setHackathons(statsRes.hackathons || []);
        setOpportunities(statsRes.opportunities || []);
        setOrgData(orgRes.organization || null);
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
      {/* Organization Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-[#D8B77A] text-xs font-mono font-semibold uppercase tracking-wider mb-1.5">
            <Building2 className="w-4 h-4" />
            <span>Organizer Workspace</span>
            {orgData?.isVerifiedOrganizer && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-[5px] text-[10px] text-[#8FA58E] bg-[#8FA58E]/15 border border-[#8FA58E]/30">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Organizer</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            {orgData?.organizationName || "Your Organization"}
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1 font-normal max-w-2xl">
            {orgData?.organizationBio || "Manage your candidate pipelines, event attendees, hackathon tracks, and organization profile."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/submit-opportunity"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Post Opportunity</span>
          </Link>
          <Link
            href="/organize-hackathon"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] font-medium text-xs text-[#F5F1E8] bg-[#151A18] hover:bg-[#181F1C] border border-white/[0.08] transition-all"
          >
            <Trophy className="w-4 h-4 text-[#D8B77A]" />
            <span>Host Hackathon</span>
          </Link>
          <Link
            href="/organizer/organization"
            className="p-2 rounded-[9px] text-[#A9AAA5] hover:text-[#F5F1E8] bg-[#111615] border border-white/[0.08] transition-colors"
            title="Organization Profile"
          >
            <Building2 className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/organizer/opportunities"
          className="p-5 rounded-[15px] bg-[#111615] border border-white/[0.08] hover:border-[#D8B77A]/30 transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A9AAA5] uppercase tracking-wider">
            <span>Total Listings</span>
            <Briefcase className="w-3.5 h-3.5 text-[#D8B77A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#F5F1E8] font-mono">
            {stats?.totalOpportunities || 0}
          </div>
          <div className="text-[10.5px] text-[#8FA58E] font-mono">
            {stats?.publishedOpportunities || 0} Published • {stats?.pendingOpportunities || 0} In Review
          </div>
        </Link>

        <Link
          href="/organizer/applications"
          className="p-5 rounded-[15px] bg-[#111615] border border-white/[0.08] hover:border-[#D8B77A]/30 transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A9AAA5] uppercase tracking-wider">
            <span>Applications</span>
            <Users className="w-3.5 h-3.5 text-[#D8B77A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#D8B77A] font-mono">
            {stats?.totalApplications || 0}
          </div>
          <div className="text-[10.5px] text-[#A9AAA5] font-mono">
            Candidates across all pipelines
          </div>
        </Link>

        <Link
          href="/organizer/registrations"
          className="p-5 rounded-[15px] bg-[#111615] border border-white/[0.08] hover:border-[#D8B77A]/30 transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A9AAA5] uppercase tracking-wider">
            <span>Event Attendees</span>
            <Ticket className="w-3.5 h-3.5 text-[#8FA58E] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#8FA58E] font-mono">
            {stats?.totalRegistrations || 0}
          </div>
          <div className="text-[10.5px] text-[#A9AAA5] font-mono">
            Workshops, events & webinars
          </div>
        </Link>

        <Link
          href="/organizer/hackathons"
          className="p-5 rounded-[15px] bg-[#111615] border border-white/[0.08] hover:border-[#D8B77A]/30 transition-all space-y-1 group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A9AAA5] uppercase tracking-wider">
            <span>Hackathons</span>
            <Trophy className="w-3.5 h-3.5 text-[#D8B77A] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#F5F1E8] font-mono">
            {stats?.totalHackathons || 0}
          </div>
          <div className="text-[10.5px] text-[#A9AAA5] font-mono">
            {stats?.totalParticipants || 0} Builders registered
          </div>
        </Link>
      </div>

      {/* Quick Operations Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/organizer/applications"
          className="p-4 rounded-[12px] bg-[#111615] border border-white/[0.08] hover:bg-[#151A18] hover:border-white/[0.15] transition-all flex items-center space-x-3 group"
        >
          <div className="p-2 rounded-[8px] bg-[#D8B77A]/10 text-[#D8B77A]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#F5F1E8] group-hover:text-[#D8B77A] transition-colors">
              Candidate Pipelines
            </div>
            <div className="text-[11px] text-[#A9AAA5]">Review & rate applicants</div>
          </div>
        </Link>

        <Link
          href="/organizer/registrations"
          className="p-4 rounded-[12px] bg-[#111615] border border-white/[0.08] hover:bg-[#151A18] hover:border-white/[0.15] transition-all flex items-center space-x-3 group"
        >
          <div className="p-2 rounded-[8px] bg-[#8FA58E]/10 text-[#8FA58E]">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#F5F1E8] group-hover:text-[#8FA58E] transition-colors">
              Event Attendees
            </div>
            <div className="text-[11px] text-[#A9AAA5]">Track attendance & CSV</div>
          </div>
        </Link>

        <Link
          href="/organizer/participants"
          className="p-4 rounded-[12px] bg-[#111615] border border-white/[0.08] hover:bg-[#151A18] hover:border-white/[0.15] transition-all flex items-center space-x-3 group"
        >
          <div className="p-2 rounded-[8px] bg-white/[0.05] text-[#F5F1E8]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#F5F1E8] group-hover:text-[#D8B77A] transition-colors">
              Talent Directory
            </div>
            <div className="text-[11px] text-[#A9AAA5]">Past applicants & builders</div>
          </div>
        </Link>

        <Link
          href="/organizer/analytics"
          className="p-4 rounded-[12px] bg-[#111615] border border-white/[0.08] hover:bg-[#151A18] hover:border-white/[0.15] transition-all flex items-center space-x-3 group"
        >
          <div className="p-2 rounded-[8px] bg-[#D8B77A]/10 text-[#D8B77A]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#F5F1E8] group-hover:text-[#D8B77A] transition-colors">
              Operations Analytics
            </div>
            <div className="text-[11px] text-[#A9AAA5]">Funnel & demographics</div>
          </div>
        </Link>
      </div>

      {/* Main Section: Opportunities & Hackathons */}
      <div className="space-y-6">
        {/* Opportunities List */}
        <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-[#F5F1E8]">Recent Opportunity Listings</h2>
              <p className="text-xs text-[#A9AAA5]">Jobs, internships, workshops and events created by your team</p>
            </div>
            <Link
              href="/organizer/opportunities"
              className="text-xs text-[#D8B77A] hover:underline inline-flex items-center space-x-1"
            >
              <span>View all ({opportunities.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {opportunities.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Briefcase className="w-8 h-8 text-[#A9AAA5] mx-auto opacity-50" />
              <p className="text-xs text-[#A9AAA5]">You haven't posted any opportunities yet.</p>
              <Link
                href="/submit-opportunity"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] text-xs font-semibold text-[#090B0B] bg-[#D8B77A]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Opportunity</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {opportunities.slice(0, 5).map((opp) => (
                <div
                  key={opp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[12px] bg-[#0E1110] border border-white/[0.06] hover:border-white/[0.12] transition-colors gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-[#F5F1E8] truncate">
                        {opp.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-[5px] text-[10px] font-mono uppercase bg-white/[0.05] text-[#A9AAA5] border border-white/[0.06]">
                        {opp.opportunityType || opp.category}
                      </span>
                      {getStatusBadge(opp.status)}
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-[#A9AAA5] font-mono mt-1">
                      <span>{opp.applicationCount || 0} Applications</span>
                      <span>•</span>
                      <span>{opp.registrationCount || 0} Registrations</span>
                      <span>•</span>
                      <span>{opp.viewsCount || 0} Views</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Link
                      href={`/organizer/opportunities/${opp.id}`}
                      className="px-3 py-1.5 rounded-[8px] bg-[#D8B77A]/10 hover:bg-[#D8B77A]/20 text-[#D8B77A] text-xs font-semibold transition-colors"
                    >
                      Manage Pipeline
                    </Link>
                    <Link
                      href={`/opportunity/${opp.slug}`}
                      className="p-1.5 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-[#A9AAA5] hover:text-[#F5F1E8] transition-colors"
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

        {/* Hackathons List */}
        <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-[#F5F1E8]">Hosted Hackathons</h2>
              <p className="text-xs text-[#A9AAA5]">Competitions, builder teams, and submissions</p>
            </div>
            <Link
              href="/organizer/hackathons"
              className="text-xs text-[#D8B77A] hover:underline inline-flex items-center space-x-1"
            >
              <span>View all ({hackathons.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {hackathons.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Trophy className="w-8 h-8 text-[#A9AAA5] mx-auto opacity-50" />
              <p className="text-xs text-[#A9AAA5]">You haven't hosted any hackathons yet.</p>
              <Link
                href="/organize-hackathon"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[9px] text-xs font-semibold text-[#090B0B] bg-[#D8B77A]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Host a Hackathon</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {hackathons.slice(0, 3).map((h) => (
                <div
                  key={h.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[12px] bg-[#0E1110] border border-white/[0.06] hover:border-white/[0.12] transition-colors gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-[#F5F1E8] truncate">
                        {h.title}
                      </span>
                      {getHackathonStatusBadge(h.status)}
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-[#A9AAA5] font-mono mt-1">
                      <span>{h.registrationCount || 0} Builders</span>
                      <span>•</span>
                      <span>{h.teamCount || 0} Teams</span>
                      <span>•</span>
                      <span>{h.submissionCount || 0} Projects</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Link
                      href={`/organizer/hackathons/${h.id}`}
                      className="px-3 py-1.5 rounded-[8px] bg-[#D8B77A]/10 hover:bg-[#D8B77A]/20 text-[#D8B77A] text-xs font-semibold transition-colors"
                    >
                      Manage Hackathon
                    </Link>
                    <Link
                      href={`/hackathon/${h.slug}`}
                      className="p-1.5 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-[#A9AAA5] hover:text-[#F5F1E8] transition-colors"
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
    </div>
  );
}
