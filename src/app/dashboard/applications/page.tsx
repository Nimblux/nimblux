"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Send,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { formatDate, getApplicationStageBadge } from "@/lib/utils";
import { APPLICATION_STAGES } from "@/lib/constants";

export default function MyApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => {
    fetch("/api/users/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-charcoal-cardBorder">
        <div>
          <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
            My Applications
          </h2>
          <p className="text-xs text-ivory-400 mt-0.5">
            Track active internship, job, scholarship, fellowship, and volunteer applications.
          </p>
        </div>
        <div className="text-xs font-mono text-bronze-300">
          {applications.length} {applications.length === 1 ? "application" : "applications"} submitted
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-charcoal-card border border-charcoal-cardBorder space-y-4">
          <div className="w-12 h-12 rounded-full bg-bronze-500/15 text-bronze-300 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
            No Applications Yet
          </h3>
          <p className="text-xs text-ivory-400 max-w-sm mx-auto">
            Discover internships, jobs, scholarships, and fellowships accepting native 1-click in-platform applications.
          </p>
          <Link
            href="/internships"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const opp = app.opportunity;
            const badge = getApplicationStageBadge(app.status);
            const currentStageIndex = APPLICATION_STAGES.findIndex((s) => s.key === app.status);

            return (
              <div
                key={app.id}
                className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder hover:border-bronze-500/30 transition-all shadow-card space-y-5"
              >
                {/* Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder flex items-center justify-center p-1.5 shadow-sm overflow-hidden flex-shrink-0">
                      {opp?.logo ? (
                        <img
                          src={opp.logo}
                          alt={opp.organization}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-bronze-500/15 flex items-center justify-center font-bold text-bronze-300 text-xs font-mono">
                          {opp?.organization?.slice(0, 2).toUpperCase() || "OP"}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-ivory-300">
                          {opp?.organization}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-bronze-400 bg-bronze-500/10 px-2 py-0.5 rounded">
                          {opp?.opportunityType || opp?.category}
                        </span>
                      </div>

                      <Link
                        href={`/opportunity/${opp?.slug}`}
                        className="font-serif-heading font-medium text-lg text-ivory-100 hover:text-bronze-300 transition-colors line-clamp-1 block"
                      >
                        {opp?.title}
                      </Link>

                      <div className="text-xs text-ivory-500 flex flex-wrap items-center gap-3">
                        <span>Applied on: {formatDate(app.createdAt)}</span>
                        {opp?.stipend && <span>• Stipend: {opp.stipend}</span>}
                        {opp?.salary && <span>• Salary: {opp.salary}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${badge.className}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Visual Pipeline Progress Tracker */}
                <div className="pt-2">
                  <div className="text-[11px] font-mono uppercase text-ivory-500 font-bold mb-2">
                    Application Stage Progress
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {APPLICATION_STAGES.filter((s) => s.key !== "REJECTED").map((stage, idx) => {
                      const isCompleted = app.status === "SELECTED" || (currentStageIndex >= 0 && currentStageIndex >= idx && app.status !== "REJECTED");
                      const isCurrent = app.status === stage.key;

                      return (
                        <div
                          key={stage.key}
                          className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? "bg-bronze-500/20 border-bronze-500 text-ivory-100"
                              : isCompleted
                              ? "bg-forest-500/10 border-forest-500/30 text-forest-300"
                              : "bg-charcoal-900 border-charcoal-cardBorder text-ivory-600"
                          }`}
                        >
                          <div className="text-[10px] sm:text-xs font-mono font-bold truncate">
                            {stage.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {app.status === "REJECTED" && (
                    <div className="mt-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Application not selected for this position.</span>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-charcoal-cardBorder flex items-center justify-between text-xs">
                  <div className="text-ivory-500 font-mono text-[11px]">
                    {app.resumeUrl ? "✓ Resume linked" : "Profile submitted"}
                  </div>

                  <Link
                    href={`/opportunity/${opp?.slug}`}
                    className="text-xs font-bold text-bronze-400 hover:text-bronze-300 transition-colors inline-flex items-center space-x-1"
                  >
                    <span>View Opportunity</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
