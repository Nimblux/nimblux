"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, CheckCircle2, XCircle, ExternalLink, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      }
    } catch (e) {
      alert("Failed to update report");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Flag className="w-4 h-4" />
          <span>Integrity Moderation</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          User Reports & Flags ({reports.length})
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Investigate reported broken links, inaccurate stipends, and spam listings.
        </p>
      </div>

      <div className="rounded-3xl glass-panel border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white">All reports clear!</p>
            <p className="text-xs text-slate-400">
              No unresolved user reports in the moderation queue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Reported Listing</th>
                  <th className="py-3.5 px-3 font-semibold">Reason</th>
                  <th className="py-3.5 px-3 font-semibold">Reported By</th>
                  <th className="py-3.5 px-3 font-semibold">Date</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white max-w-xs truncate">
                        {r.opportunity?.title || "Deleted Opportunity"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {r.opportunity?.organization}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-rose-300 font-medium max-w-xs">
                      <div>{r.reason}</div>
                      {r.details && (
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          "{r.details}"
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-3 text-slate-400">
                      {r.user ? r.user.name : "Anonymous User"}
                    </td>
                    <td className="py-4 px-3 text-slate-400 whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "RESOLVED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : r.status === "DISMISSED"
                            ? "bg-slate-800 text-slate-400"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {r.opportunity?.slug && (
                          <Link
                            href={`/opportunity/${r.opportunity.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                            title="Inspect listing"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {r.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(r.id, "RESOLVED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(r.id, "DISMISSED")}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px]"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
