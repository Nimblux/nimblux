"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  AlertTriangle,
  ChevronRight,
  Shield,
  Eye,
  Check,
  X,
  Save,
} from "lucide-react";
import { getStatusBadge, formatDate } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import RejectReasonModal from "@/components/modals/RejectReasonModal";

function AdminOpportunitiesContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "ALL";

  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Moderation action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalOpp, setRejectModalOpp] = useState<any>(null);

  // Edit Modal state
  const [editingOpp, setEditingOpp] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch("/api/admin/opportunities");
      const data = await res.json();
      if (data.opportunities) {
        setOpportunities(data.opportunities);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  // 1-Click Approve Action
  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/opportunities/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === id ? { ...o, status: "APPROVED", rejectionReason: null } : o
          )
        );
      }
    } catch (e) {
      alert("Failed to approve opportunity");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject Action with reason
  const handleRejectSubmit = async (reason: string) => {
    if (!rejectModalOpp) return;
    const oppId = rejectModalOpp.id;
    try {
      const res = await fetch(`/api/admin/opportunities/${oppId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === oppId
              ? { ...o, status: "REJECTED", rejectionReason: reason }
              : o
          )
        );
      }
    } catch (e) {
      alert("Failed to reject opportunity");
    }
  };

  // Feature Toggle Action
  const handleToggleFeature = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/opportunities/${id}/feature`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === id ? { ...o, featured: data.featured } : o))
        );
      }
    } catch (e) {
      alert("Failed to toggle featured status");
    }
  };

  // Delete Action
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this opportunity?")) return;
    try {
      const res = await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOpportunities((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (e) {
      alert("Failed to delete opportunity");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (opp: any) => {
    setEditingOpp(opp);
    setEditFormData({
      title: opp.title,
      organization: opp.organization,
      category: opp.category,
      mode: opp.mode,
      location: opp.location,
      stipend: opp.stipend || "",
      salary: opp.salary || "",
      applicationUrl: opp.applicationUrl,
      eligibility: opp.eligibility || "",
      skills: opp.skills || "",
      description: opp.description,
      deadline: opp.deadline ? new Date(opp.deadline).toISOString().split("T")[0] : "",
    });
  };

  // Save Edit
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
        setOpportunities((prev) =>
          prev.map((o) => (o.id === editingOpp.id ? { ...o, ...data.opportunity } : o))
        );
        setEditingOpp(null);
      }
    } catch (e) {
      alert("Failed to save opportunity changes");
    } finally {
      setSavingEdit(false);
    }
  };

  // Filtering
  const filtered = opportunities.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (categoryFilter !== "all" && o.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchTitle = o.title.toLowerCase().includes(term);
      const matchOrg = o.organization.toLowerCase().includes(term);
      const matchUser = o.createdBy?.name?.toLowerCase().includes(term) || o.createdBy?.email?.toLowerCase().includes(term);
      if (!matchTitle && !matchOrg && !matchUser) return false;
    }
    return true;
  });

  const pendingCount = opportunities.filter((o) => o.status === "PENDING").length;
  const approvedCount = opportunities.filter((o) => o.status === "APPROVED").length;
  const rejectedCount = opportunities.filter((o) => o.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>Moderation Suite</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Opportunity Moderation Queue
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review, approve, reject with reason, edit, or feature opportunity listings across all categories.
        </p>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === "ALL"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({opportunities.length})
          </button>

          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              statusFilter === "PENDING"
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
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              statusFilter === "APPROVED"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-emerald-300"
            }`}
          >
            <span>Approved (Live)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-[10px]">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              statusFilter === "REJECTED"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "text-slate-400 hover:text-rose-300"
            }`}
          >
            <span>Rejected</span>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-[10px]">
              {rejectedCount}
            </span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, org or user..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Moderation Table */}
      <div className="rounded-3xl glass-panel border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
            Loading opportunities moderation queue...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No opportunities found</p>
            <p className="text-xs text-slate-400">
              No listings match the selected status or search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Title & Organization</th>
                  <th className="py-3.5 px-3 font-semibold">Category</th>
                  <th className="py-3.5 px-3 font-semibold">Submitted By</th>
                  <th className="py-3.5 px-3 font-semibold">Date & Deadline</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 px-3 font-semibold">Featured</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((opp) => {
                  const statusBadge = getStatusBadge(opp.status);
                  const isActioning = actionLoading === opp.id;

                  return (
                    <tr key={opp.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white max-w-xs truncate">
                          {opp.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {opp.organization} • {opp.location} ({opp.mode})
                        </div>
                      </td>

                      <td className="py-4 px-3 capitalize text-slate-300 font-medium whitespace-nowrap">
                        {opp.category}
                      </td>

                      <td className="py-4 px-3">
                        <div className="text-slate-200 font-medium truncate max-w-[120px]">
                          {opp.createdBy?.name || "System"}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                          {opp.createdBy?.email}
                        </div>
                      </td>

                      <td className="py-4 px-3 whitespace-nowrap">
                        <div className="text-slate-300">
                          {formatDate(opp.createdAt)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Due: {formatDate(opp.deadline)}
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${statusBadge.className}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`}
                          />
                          <span>{statusBadge.label}</span>
                        </span>
                        {opp.rejectionReason && (
                          <div className="text-[10px] text-rose-400 mt-1 line-clamp-1 max-w-[130px]" title={opp.rejectionReason}>
                            Reason: {opp.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-3">
                        <button
                          onClick={() => handleToggleFeature(opp.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            opp.featured
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
                          }`}
                          title={opp.featured ? "Featured on Home" : "Click to feature"}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {opp.status !== "APPROVED" && (
                            <button
                              onClick={() => handleApprove(opp.id)}
                              disabled={isActioning}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center space-x-1 shadow-sm transition-colors"
                              title="Approve & Publish Immediately"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {opp.status !== "REJECTED" && (
                            <button
                              onClick={() => setRejectModalOpp(opp)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-[11px] flex items-center space-x-1 transition-colors"
                              title="Reject with custom feedback"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(opp)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            title="Edit opportunity"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {opp.status === "APPROVED" && (
                            <Link
                              href={`/opportunity/${opp.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                              title="View live opportunity"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <button
                            onClick={() => handleDelete(opp.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Delete permanently"
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

      {/* Reject Modal */}
      {rejectModalOpp && (
        <RejectReasonModal
          isOpen={Boolean(rejectModalOpp)}
          opportunityTitle={rejectModalOpp.title}
          onClose={() => setRejectModalOpp(null)}
          onSubmit={handleRejectSubmit}
        />
      )}

      {/* Edit Modal */}
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
                Admin Edit: {editingOpp.title}
              </h3>
              <p className="text-xs text-slate-400">
                Modify opportunity parameters and update database record.
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
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
                      setEditFormData({
                        ...editFormData,
                        organization: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Work Mode
                  </label>
                  <select
                    value={editFormData.mode}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, mode: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">On-site</option>
                  </select>
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Salary
                  </label>
                  <input
                    type="text"
                    value={editFormData.salary}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, salary: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 resize-y"
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
                  className="flex items-center space-x-1.5 px-6 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 shadow-md shadow-amber-400/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? "Saving..." : "Update Opportunity"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOpportunitiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading queue...</div>}>
      <AdminOpportunitiesContent />
    </Suspense>
  );
}
