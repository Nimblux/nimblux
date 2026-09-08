"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Search,
  CheckCircle2,
  Mail,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: nextRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: nextRole } : u))
        );
      }
    } catch (e) {
      alert("Failed to update role");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleToggleOrganizerVerification = async (userId: string, currentVerified: boolean) => {
    const nextVerified = !currentVerified;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isVerifiedOrganizer: nextVerified }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isVerifiedOrganizer: nextVerified } : u))
        );
      }
    } catch (e) {
      alert("Failed to update verification");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (e) {
      alert("Failed to delete user");
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.college && u.college.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-bronze-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>User Directory</span>
          </div>
          <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
            Registered Users ({users.length})
          </h1>
          <p className="text-xs text-ivory-500 mt-0.5">
            Manage permissions, student profiles, and moderation status.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-ivory-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, college..."
            className="pl-8 pr-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 w-64 font-mono"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-charcoal-card border border-charcoal-cardBorder overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-ivory-500 text-xs animate-pulse font-mono">
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 p-6 text-ivory-500 text-xs">
            No users matched your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-950/90 text-ivory-500 uppercase tracking-wider border-b border-charcoal-cardBorder text-[10px] font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-3 font-semibold">Education</th>
                  <th className="py-3.5 px-3 font-semibold">Role</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 px-3 font-semibold">Submissions</th>
                  <th className="py-3.5 px-3 font-semibold">Joined</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-cardBorder/60">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-charcoal-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-ivory-100">{u.name}</span>
                        {u.isVerifiedOrganizer && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold text-forest-300 bg-forest-500/15 border border-forest-500/30">
                            Verified Org
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ivory-500 font-mono">{u.email}</div>
                      {u.isOrganizer && (
                        <div className="text-[10px] text-bronze-300 font-mono mt-0.5">
                          🏢 {u.organizationName || "Organizer Workspace"}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-ivory-300 truncate max-w-[150px]">
                        {u.college || "Not specified"}
                      </div>
                      <div className="text-[10px] text-ivory-500 truncate max-w-[150px]">
                        {u.degree || "—"}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                          u.role === "ADMIN"
                            ? "bg-bronze-500/20 text-bronze-300 border-bronze-500/30"
                            : "bg-charcoal-900 text-ivory-300 border-charcoal-cardBorder hover:bg-charcoal-850"
                        }`}
                        title="Click to toggle role"
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          u.status === "ACTIVE"
                            ? "bg-forest-500/10 text-forest-300 border border-forest-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === "ACTIVE" ? "bg-forest-400" : "bg-rose-400"
                          }`}
                        />
                        <span>{u.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-ivory-300 font-mono text-[11px]">
                      <span className="font-bold text-ivory-100">
                        {u._count?.opportunities || 0}
                      </span>{" "}
                      posted
                    </td>
                    <td className="py-3.5 px-3 text-ivory-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {u.isOrganizer && (
                          <button
                            onClick={() => handleToggleOrganizerVerification(u.id, u.isVerifiedOrganizer)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                              u.isVerifiedOrganizer
                                ? "bg-forest-500/15 text-forest-300 border-forest-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
                                : "bg-bronze-500/15 text-bronze-300 border-bronze-500/30 hover:bg-bronze-500/25"
                            }`}
                            title={u.isVerifiedOrganizer ? "Revoke organizer verification" : "Grant Verified Organizer badge"}
                          >
                            {u.isVerifiedOrganizer ? "Verified ✓" : "Verify Org"}
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                            u.status === "ACTIVE"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                              : "bg-forest-500/10 text-forest-300 border-forest-500/30 hover:bg-forest-500/20"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
