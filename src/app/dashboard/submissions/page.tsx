"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Edit,
  Trash2,
  PlusCircle,
  X,
  Save,
} from "lucide-react";
import { getStatusBadge, formatDate } from "@/lib/utils";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingOpp, setEditingOpp] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Rejection Reason Modal State
  const [reasonModalOpp, setReasonModalOpp] = useState<any>(null);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/users/submissions");
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;
    try {
      await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert("Failed to delete submission");
    }
  };

  const handleOpenEdit = (opp: any) => {
    setEditingOpp(opp);
    setEditFormData({
      title: opp.title,
      organization: opp.organization,
      description: opp.description,
      eligibility: opp.eligibility || "",
      skills: opp.skills || "",
      stipend: opp.stipend || "",
      salary: opp.salary || "",
      applicationUrl: opp.applicationUrl,
      deadline: opp.deadline ? new Date(opp.deadline).toISOString().split("T")[0] : "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/opportunities/${editingOpp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmissions((prev) =>
          prev.map((s) => (s.id === editingOpp.id ? data.opportunity : s))
        );
        setEditingOpp(null);
      }
    } catch (e) {
      alert("Failed to save changes.");
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === "ALL") return true;
    return s.status === filter;
  });

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const approvedCount = submissions.filter((s) => s.status === "APPROVED").length;
  const rejectedCount = submissions.filter((s) => s.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100">
            My Opportunity Submissions
          </h2>
          <p className="text-xs text-ivory-500 mt-0.5">
            Track, update, or remove opportunities you submitted to the platform.
          </p>
        </div>

        <Link
          href="/submit-opportunity"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-colors shadow-button self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-charcoal-cardBorder pb-3">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            filter === "ALL"
              ? "bg-charcoal-card text-ivory-100 border border-charcoal-cardBorder font-semibold"
              : "text-ivory-500 hover:text-ivory-200"
          }`}
        >
          All ({submissions.length})
        </button>

        <button
          onClick={() => setFilter("PENDING")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5 ${
            filter === "PENDING"
              ? "bg-bronze-500/15 text-bronze-300 border border-bronze-500/30"
              : "text-ivory-500 hover:text-bronze-300"
          }`}
        >
          <span>Under Review</span>
          <span className="px-1.5 py-0.2 rounded-full bg-bronze-500/20 text-[10px] font-mono">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5 ${
            filter === "APPROVED"
              ? "bg-forest-500/15 text-forest-300 border border-forest-500/30"
              : "text-ivory-500 hover:text-forest-300"
          }`}
        >
          <span>Published</span>
          <span className="px-1.5 py-0.2 rounded-full bg-forest-500/20 text-[10px] font-mono">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setFilter("REJECTED")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5 ${
            filter === "REJECTED"
              ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
              : "text-ivory-500 hover:text-rose-300"
          }`}
        >
          <span>Needs Revision</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[10px] font-mono">
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Submissions Table */}
      <div className="rounded-3xl bg-charcoal-card border border-charcoal-cardBorder overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-ivory-500 text-xs animate-pulse">
            Loading your submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-charcoal-900 flex items-center justify-center mx-auto text-ivory-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-ivory-100">No submissions found</p>
            <p className="text-xs text-ivory-500 max-w-sm mx-auto">
              {filter === "ALL"
                ? "You haven't posted any opportunities yet."
                : `You don't have any opportunities with status ${filter}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-950/80 text-ivory-500 uppercase tracking-wider border-b border-charcoal-cardBorder text-[10px] font-mono">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Opportunity</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Engagement</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-cardBorder/60">
                {filteredSubmissions.map((sub) => {
                  const statusBadge = getStatusBadge(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-charcoal-900/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-ivory-100 max-w-xs sm:max-w-sm truncate">
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-ivory-500 mt-0.5">
                          {sub.organization} • {sub.location}
                        </div>
                      </td>
                      <td className="py-4 px-4 capitalize text-ivory-300 font-medium">
                        {sub.category}
                      </td>
                      <td className="py-4 px-4 text-ivory-500 font-mono whitespace-nowrap">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md font-medium text-[10.5px] border ${statusBadge.className}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`}
                            />
                            <span>{statusBadge.label}</span>
                          </span>

                          {sub.status === "REJECTED" && sub.rejectionReason && (
                            <button
                              onClick={() => setReasonModalOpp(sub)}
                              className="block text-[11px] text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer mt-1"
                            >
                              View Feedback →
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-ivory-500 font-mono text-[11px]">
                        {sub.status === "APPROVED" ? (
                          <div>
                            <span className="text-ivory-100 font-semibold">{sub.clicksCount}</span> clicks
                            <br />
                            <span className="text-ivory-500">{sub.viewsCount} views</span>
                          </div>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {sub.status === "APPROVED" && (
                            <Link
                              href={`/opportunity/${sub.slug}`}
                              className="p-1.5 rounded-lg bg-charcoal-900 text-bronze-300 hover:bg-charcoal-850 transition-colors"
                              title="View live page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 rounded-lg bg-charcoal-900 text-ivory-300 hover:text-white hover:bg-charcoal-850 transition-colors"
                            title="Edit details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {reasonModalOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-charcoal-card border border-rose-500/40 p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setReasonModalOpp(null)}
              className="absolute top-4 right-4 p-2 text-ivory-500 hover:text-ivory-100 rounded-xl hover:bg-charcoal-900"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ivory-100">
                  Submission Feedback
                </h3>
                <p className="text-xs text-ivory-500">
                  Moderator review feedback
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-300 truncate">
              <span className="text-ivory-500 font-mono">Opportunity:</span>{" "}
              {reasonModalOpp.title}
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 leading-relaxed">
              <div className="font-bold text-rose-300 mb-1 font-mono text-[11px]">
                Moderator Note:
              </div>
              {reasonModalOpp.rejectionReason}
            </div>

            <p className="text-xs text-ivory-500 leading-relaxed">
              💡 Update the fields using the <strong>Edit</strong> button. Once saved, your submission will be placed back into the review queue.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setReasonModalOpp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ivory-400 hover:text-ivory-100 bg-charcoal-900 border border-charcoal-cardBorder"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const opp = reasonModalOpp;
                  setReasonModalOpp(null);
                  handleOpenEdit(opp);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button"
              >
                Edit & Resubmit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setEditingOpp(null)}
              className="absolute top-4 right-4 p-2 text-ivory-500 hover:text-ivory-100 rounded-xl hover:bg-charcoal-900"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-ivory-100">
                Edit Opportunity Details
              </h3>
              <p className="text-xs text-ivory-500 mt-0.5">
                {editingOpp.status === "REJECTED"
                  ? "Saving changes will submit this listing for re-moderation."
                  : "Modify opportunity fields and update."}
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.organization}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, organization: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.deadline}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, deadline: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Application URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={editFormData.applicationUrl}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        applicationUrl: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Stipend
                  </label>
                  <input
                    type="text"
                    value={editFormData.stipend}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, stipend: e.target.value })
                    }
                    placeholder="e.g. $8,000 / month"
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={editFormData.skills}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, skills: e.target.value })
                    }
                    placeholder="React, Python, AWS"
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-charcoal-cardBorder">
                <button
                  type="button"
                  onClick={() => setEditingOpp(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-ivory-400 hover:text-ivory-100 bg-charcoal-900 border border-charcoal-cardBorder"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 disabled:opacity-50 shadow-button"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? "Saving..." : "Save & Update"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
