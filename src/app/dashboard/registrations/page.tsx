"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
} from "lucide-react";
import { formatDate, getRegistrationStatusBadge } from "@/lib/utils";

export default function MyRegistrationsPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchRegistrations = () => {
    fetch("/api/users/registrations")
      .then((res) => res.json())
      .then((data) => {
        setRegistrations(data.registrations || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancelRegistration = async (opportunityId: string) => {
    if (!confirm("Are you sure you want to cancel your registration?")) return;

    setCancellingId(opportunityId);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/register`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRegistrations();
      }
    } finally {
      setCancellingId(null);
    }
  };

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
            My Registrations
          </h2>
          <p className="text-xs text-ivory-400 mt-0.5">
            Workshops, tech meetups, webinars, conferences, and courses you are attending.
          </p>
        </div>
        <div className="text-xs font-mono text-forest-300">
          {registrations.filter((r) => r.status !== "CANCELLED").length} active registrations
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-charcoal-card border border-charcoal-cardBorder space-y-4">
          <div className="w-12 h-12 rounded-full bg-forest-500/15 text-forest-300 flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
            No Event Registrations Yet
          </h3>
          <p className="text-xs text-ivory-400 max-w-sm mx-auto">
            Register with 1 click for masterclasses, developer events, bootcamps, and webinars.
          </p>
          <Link
            href="/workshops"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all"
          >
            <span>Browse Workshops & Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map((reg) => {
            const opp = reg.opportunity;
            const badge = getRegistrationStatusBadge(reg.status);
            const isCancelled = reg.status === "CANCELLED";

            return (
              <div
                key={reg.id}
                className={`p-6 rounded-3xl bg-charcoal-card border transition-all flex flex-col justify-between space-y-4 shadow-card ${
                  isCancelled
                    ? "opacity-60 border-charcoal-cardBorder"
                    : "border-charcoal-cardBorder hover:border-forest-500/30"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-forest-300 bg-forest-500/10 px-2 py-0.5 rounded-md">
                      {opp?.opportunityType || opp?.category}
                    </span>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono ${badge.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <Link
                    href={`/opportunity/${opp?.slug}`}
                    className="font-serif-heading font-medium text-lg text-ivory-100 hover:text-bronze-300 transition-colors line-clamp-1 block"
                  >
                    {opp?.title}
                  </Link>

                  <div className="text-xs text-ivory-400 space-y-1">
                    <div>Hosted by <strong className="text-ivory-200">{opp?.organization}</strong></div>
                    {opp?.instructor && <div>Instructor: <strong className="text-ivory-200">{opp.instructor}</strong></div>}
                    <div className="flex items-center space-x-2 text-ivory-500 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Date: {formatDate(opp?.startDate || opp?.deadline)}</span>
                    </div>
                  </div>

                  {/* Meeting URL if available & registered */}
                  {!isCancelled && opp?.meetingUrl && (
                    <div className="p-3 rounded-2xl bg-forest-500/10 border border-forest-500/20 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-forest-300 font-mono text-[11px]">
                        <Video className="w-4 h-4" />
                        <span>Online Meeting Access</span>
                      </div>
                      <a
                        href={opp.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-xl bg-forest-500 text-charcoal-950 font-bold text-[11px] hover:bg-forest-400 transition-all flex items-center space-x-1"
                      >
                        <span>Join Call</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-charcoal-cardBorder flex items-center justify-between text-xs">
                  <Link
                    href={`/opportunity/${opp?.slug}`}
                    className="text-xs font-bold text-bronze-400 hover:text-bronze-300 transition-colors"
                  >
                    Event Details →
                  </Link>

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancelRegistration(opp?.id)}
                      disabled={cancellingId === opp?.id}
                      className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors font-mono"
                    >
                      {cancellingId === opp?.id ? "Cancelling..." : "Cancel Registration"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
