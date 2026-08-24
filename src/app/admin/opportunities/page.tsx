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
        <div className="flex items-center space-x-2 text-bronze-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>Moderation Suite</span>
        </div>
        <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
          Opportunity Moderation Queue
        </h1>
        <p className="text-xs text-ivory-500 mt-0.5">
          Review, approve, reject with feedback, edit, or feature opportunity listings across all categories.
        </p>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-charcoal-cardBorder pb-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === "ALL"
                ? "bg-charcoal-card text-ivory-100 border border-charcoal-cardBorder font-semibold"
                : "text-ivory-500 hover:text-ivory-200"
            }`}
          >
            All ({opportunities.length})
          </button>

          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              statusFilter === "PENDING"
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
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              statusFilter === "APPROVED"
                ? "bg-forest-500/15 text-forest-300 border border-forest-500/30"
                : "text-ivory-500 hover:text-forest-300"
            }`}
          >
            <span>Approved (Live)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-forest-500/20 text-[10px] font-mono">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
              statusFilter === "REJECTED"
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

        {/* Search & Category Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ivory-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, org or user..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-200 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 w-48 sm:w-60 font-mono"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug} className="bg-charcoal-900">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Moderation Table */}
      <div className="rounded-3xl bg-charcoal-card border border-charcoal-cardBorder overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-ivory-500 text-xs animate-pulse font-mono">
            Loading opportunities moderation queue...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-charcoal-900 flex items-center justify-center mx-auto text-ivory-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-ivory-100">No opportunities found</p>
            <p className="text-xs text-ivory-500">
              No listings match the selected status or search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-950/90 text-ivory-500 uppercase tracking-wider border-b border-charcoal-cardBorder text-[10px] font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Title & Organization</th>
                  <th className="py-3.5 px-3 font-semibold">Category</th>
                  <th className="py-3.5 px-3 font-semibold">Submitted By</th>
                  <th className="py-3.5 px-3 font-semibold">Date & Due</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 px-3 font-semibold">Featured</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-cardBorder/60">
                {filtered.map((opp) => {
                  const statusBadge = getStatusBadge(opp.status);
                  const isActioning = actionLoading === opp.id;

                  return (
                    <tr key={opp.id} className="hover:bg-charcoal-900/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-ivory-100 max-w-xs truncate">
                          {opp.title}
                        </div>
                        <div className="text-[11px] text-ivory-500 mt-0.5">
                          {opp.organization} • {opp.location} ({opp.mode})
                        </div>
                      </td>

                      <td className="py-4 px-3 capitalize text-ivory-300 font-medium whitespace-nowrap">
                        {opp.category}
                      </td>

                      <td className="py-4 px-3">
                        <div className="text-ivory-200 font-medium truncate max-w-[120px]">
                          {opp.createdBy?.name || "System"}
                        </div>
                        <div className="text-[10px] text-ivory-500 font-mono truncate max-w-[120px]">
                          {opp.createdBy?.email}
                        </div>
                      </td>

                      <td className="py-4 px-3 whitespace-nowrap font-mono text-[11px]">
                        <div className="text-ivory-300">
                          {formatDate(opp.createdAt)}
                        </div>
                        <div className="text-[10px] text-ivory-500">
                          Due: {formatDate(opp.deadline)}
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md font-medium text-[10.5px] border ${statusBadge.className}`}
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
                              ? "bg-bronze-500/20 text-bronze-300 border-bronze-500/40"
                              : "bg-charcoal-900 text-ivory-500 border-charcoal-cardBorder hover:text-ivory-300"
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
                              className="px-2.5 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-500 text-white font-bold text-[11px] flex items-center space-x-1 shadow-sm transition-colors"
                              title="Approve & Publish Immediately"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {opp.status !== "REJECTED" && (
                            <button
                              onClick={() => setRejectModalOpp(opp)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-[11px] flex items-center space-x-1 transition-colors"
                              title="Reject with custom feedback"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(opp)}
                            className="p-1.5 rounded-lg bg-charcoal-900 text-ivory-300 hover:text-white hover:bg-charcoal-850 border border-charcoal-cardBorder transition-colors"
                            title="Edit opportunity"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {opp.status === "APPROVED" && (
                            <Link
                              href={`/opportunity/${opp.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-charcoal-900 text-bronze-300 hover:bg-charcoal-850 border border-charcoal-cardBorder transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setEditingOpp(null)}
              className="absolute top-4 right-4 p-2 text-ivory-500 hover:text-ivory-100 rounded-xl hover:bg-charcoal-900"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-ivory-100">
                Admin Edit: {editingOpp.title}
              </h3>
              <p className="text-xs text-ivory-500">
                Modify opportunity parameters and update database record.
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
                      setEditFormData({
                        ...editFormData,
                        organization: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Category *
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug} className="bg-charcoal-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Work Mode
                  </label>
                  <select
                    value={editFormData.mode}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, mode: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  >
                    <option value="REMOTE" className="bg-charcoal-900">Remote</option>
                    <option value="HYBRID" className="bg-charcoal-900">Hybrid</option>
                    <option value="ONSITE" className="bg-charcoal-900">On-site</option>
                  </select>
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
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Salary
                  </label>
                  <input
                    type="text"
                    value={editFormData.salary}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, salary: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
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
                  className="flex items-center space-x-1.5 px-6 py-2 rounded-xl font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 disabled:opacity-50 shadow-button"
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
    <Suspense fallback={<div className="p-8 text-center text-ivory-500 text-xs font-mono">Loading queue...</div>}>
      <AdminOpportunitiesContent />
    </Suspense>
  );
}
