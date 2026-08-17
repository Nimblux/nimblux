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
  Info,
  Save,
  ArrowRight,
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
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
            My Opportunity Submissions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track, update, or remove opportunities you submitted to the platform.
          </p>
        </div>

        <Link
          href="/submit-opportunity"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Submission</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filter === "ALL"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All ({submissions.length})
        </button>

        <button
          onClick={() => setFilter("PENDING")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            filter === "PENDING"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-slate-400 hover:text-amber-300"
          }`}
        >
          <span>Pending Review</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-[10px]">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setFilter("APPROVED")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            filter === "APPROVED"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "text-slate-400 hover:text-emerald-300"
          }`}
        >
          <span>Published</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[10px]">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setFilter("REJECTED")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
            filter === "REJECTED"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              : "text-slate-400 hover:text-rose-300"
          }`}
        >
          <span>Needs Revision</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-[10px]">
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Submissions Table */}
      <div className="rounded-3xl glass-panel border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading your submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No submissions found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {filter === "ALL"
                ? "You haven't posted any opportunities yet."
                : `You don't have any opportunities with status ${filter}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Opportunity</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Engagement</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubmissions.map((sub) => {
                  const statusBadge = getStatusBadge(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-white max-w-xs sm:max-w-sm truncate">
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {sub.organization} • {sub.location}
                        </div>
                      </td>
                      <td className="py-4 px-4 capitalize text-slate-300 font-medium">
                        {sub.category}
                      </td>
                      <td className="py-4 px-4 text-slate-400 whitespace-nowrap">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] ${statusBadge.className}`}
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
                              View Rejection Reason →
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {sub.status === "APPROVED" ? (
                          <div className="text-[11px]">
                            <span className="text-white font-semibold">{sub.clicksCount}</span> applications
                            <br />
                            <span className="text-slate-500">{sub.viewsCount} views</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {sub.status === "APPROVED" && (
                            <Link
                              href={`/opportunity/${sub.slug}`}
                              className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                              title="View live page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            title="Edit details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glass-dropdown border border-rose-500/40 p-6 shadow-2xl bg-slate-950 space-y-4">
            <button
              onClick={() => setReasonModalOpp(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Submission Feedback
                </h3>
                <p className="text-xs text-slate-400">
                  Moderator review feedback
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500 font-medium">Opportunity:</span>{" "}
              {reasonModalOpp.title}
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 leading-relaxed">
              <div className="font-bold text-rose-300 mb-1">
                Moderator Reason:
              </div>
              {reasonModalOpp.rejectionReason}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              💡 You can update the details using the <strong>Edit</strong> button. Once saved, your opportunity will be queued back for re-review!
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setReasonModalOpp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
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
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
              >
                Edit & Resubmit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Opportunity Modal */}
      {editingOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-dropdown border border-slate-800 p-6 sm:p-8 shadow-2xl bg-slate-950 space-y-6">
            <button
              onClick={() => setEditingOpp(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">
                Edit Opportunity Details
              </h3>
              <p className="text-xs text-slate-400">
                {editingOpp.status === "REJECTED"
                  ? "Updating this submission will set its status back to Pending for re-review."
                  : "Modify fields and update listing."}
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.organization}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, organization: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.deadline}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, deadline: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Stipend
                  </label>
                  <input
                    type="text"
                    value={editFormData.stipend}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, stipend: e.target.value })
                    }
                    placeholder="e.g. $8,000 / month"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={editFormData.skills}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, skills: e.target.value })
                    }
                    placeholder="React, Python, AWS"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 resize-y"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingOpp(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center space-x-1.5 px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 shadow-md shadow-indigo-600/30"
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
