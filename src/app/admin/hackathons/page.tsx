"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
  Search,
  ExternalLink,
  Trash2,
  Eye,
  SlidersHorizontal,
  Clock,
  Building,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatCurrency, getHackathonStatusBadge } from "@/lib/hackathon";

export default function AdminHackathonsPage() {
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/hackathons");
      if (!res.ok) throw new Error("Failed to load admin hackathons");
      const data = await res.json();
      setHackathons(data.hackathons || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/hackathons/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Hackathon approved and published live!");
      setTimeout(() => setSuccess(""), 3000);
      fetchHackathons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/hackathons/${selectedHackathon.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Hackathon marked for revision and organizer notified.");
      setRejectModalOpen(false);
      setRejectReason("");
      setTimeout(() => setSuccess(""), 3000);
      fetchHackathons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeature = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/hackathons/${id}/feature`, { method: "POST" });
      if (res.ok) {
        fetchHackathons();
      }
    } catch {
      setError("Failed to toggle feature");
    }
  };

  const filtered = hackathons.filter((h) => {
    if (statusFilter !== "all" && h.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      return (
        h.title.toLowerCase().includes(term) ||
        h.organizerName.toLowerCase().includes(term) ||
        h.slug.toLowerCase().includes(term)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-cardBorder">
        <div>
          <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            Hackathon Moderation Queue
          </h1>
          <p className="text-xs text-ivory-500 mt-1">
            Review submitted organizer hackathons, approve for public listing, feature on homepage, or request revisions.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-forest-500/10 border border-forest-500/30 text-forest-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ivory-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hackathon by title or organizer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto text-xs">
          {["all", "pending", "published", "rejected", "draft"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                statusFilter === status
                  ? "bg-bronze-500 text-charcoal-950 font-bold shadow-button"
                  : "bg-charcoal-900 text-ivory-400 hover:text-ivory-200 border border-charcoal-cardBorder"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Hackathons Table */}
      <div className="rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-charcoal-950/80 text-ivory-500 uppercase tracking-wider text-[10px] font-mono border-b border-charcoal-cardBorder">
              <tr>
                <th className="py-3 px-4">Hackathon & Organizer</th>
                <th className="py-3 px-4">Mode / Dates</th>
                <th className="py-3 px-4">Prize Pool</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-cardBorder/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ivory-500">
                    No hackathons match the active filter.
                  </td>
                </tr>
              ) : (
                filtered.map((h) => {
                  const statusBadge = getHackathonStatusBadge(h.status);
                  return (
                    <tr key={h.id} className="hover:bg-charcoal-900/40">
                      <td className="py-4 px-4">
                        <div className="font-bold text-ivory-100 text-sm">{h.title}</div>
                        <div className="text-[11px] text-ivory-400 mt-0.5">
                          By: {h.organizerName} • Created by: {h.createdBy?.name || "User"}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px] text-ivory-300">
                        <div>{h.mode}</div>
                        <div className="text-ivory-500">{formatDate(h.startDate)}</div>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-amber-300">
                        {h.totalPrizePool ? formatCurrency(h.totalPrizePool, h.prizeCurrency) : "No Cash Pool"}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold border ${statusBadge.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                          <span>{statusBadge.label}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right space-x-2">
                        {/* Feature Toggle */}
                        <button
                          onClick={() => handleToggleFeature(h.id)}
                          className={`p-1.5 rounded-lg border text-xs ${
                            h.featured
                              ? "bg-bronze-500 text-charcoal-950 border-bronze-400"
                              : "bg-charcoal-900 text-ivory-400 border-charcoal-cardBorder hover:text-white"
                          }`}
                          title="Toggle Featured"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {/* Public Link */}
                        <Link
                          href={`/hackathon/${h.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-charcoal-900 text-ivory-400 hover:text-white border border-charcoal-cardBorder inline-block"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Approve Button */}
                        {h.status !== "PUBLISHED" && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleApprove(h.id)}
                            className="px-3 py-1.5 rounded-lg font-bold text-xs text-charcoal-950 bg-forest-400 hover:bg-forest-300 shadow-button"
                          >
                            Approve
                          </button>
                        )}

                        {/* Reject Button */}
                        {h.status !== "REJECTED" && (
                          <button
                            disabled={actionLoading}
                            onClick={() => {
                              setSelectedHackathon(h);
                              setRejectModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg font-semibold text-xs text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECT MODAL */}
      {rejectModalOpen && selectedHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                Reject Hackathon Submission
              </h2>
              <p className="text-xs text-ivory-500 mt-1">
                Provide feedback to the organizer on why revisions are needed.
              </p>
            </div>

            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">Feedback / Rejection Reason *</label>
                <textarea
                  rows={4}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Please clarify track problem statements and ensure dates are set in the future."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
                />
              </div>

              <div className="pt-3 border-t border-charcoal-cardBorder flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-ivory-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl font-bold text-rose-100 bg-rose-600 hover:bg-rose-500"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
