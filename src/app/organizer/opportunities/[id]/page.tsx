"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Briefcase,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Send,
  Download,
  Star,
  FileText,
  Mail,
  Phone,
  GraduationCap,
  Github,
  Linkedin,
  Globe,
  Award,
  Trophy,
  Filter,
  Search,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { formatDate, getStatusBadge, getApplicationStageBadge, getRegistrationStatusBadge } from "@/lib/utils";
import { APPLICATION_STAGES } from "@/lib/constants";

export default function OpportunityManagePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<"pipeline" | "attendees" | "announcements" | "certificates" | "settings">("pipeline");

  // Selected candidate drawer
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [candidateNotes, setCandidateNotes] = useState("");
  const [candidateRating, setCandidateRating] = useState(0);
  const [updatingCandidate, setUpdatingCandidate] = useState(false);

  // Search & Filter
  const [candidateSearch, setCandidateSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementTarget, setAnnouncementTarget] = useState("ALL");
  const [announcementPinned, setAnnouncementPinned] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  // Certificate state
  const [issuingCertificates, setIssuingCertificates] = useState(false);
  const [certSuccessMessage, setCertSuccessMessage] = useState("");

  const fetchData = async () => {
    try {
      const [oppRes, appRes, regRes, annRes] = await Promise.all([
        fetch(`/api/organizer/opportunities/${id}`),
        fetch(`/api/organizer/opportunities/${id}/applications`),
        fetch(`/api/organizer/opportunities/${id}/registrations`),
        fetch(`/api/organizer/opportunities/${id}/announcements`),
      ]);

      if (!oppRes.ok) {
        throw new Error("Unauthorized or not found");
      }

      const oppData = await oppRes.json();
      const appData = await appRes.json();
      const regData = await regRes.json();
      const annData = await annRes.json();

      setOpportunity(oppData.opportunity);
      setApplications(appData.applications || []);
      setRegistrations(regData.registrations || []);
      setAnnouncements(annData.announcements || []);

      // Default active tab based on opportunity type
      const isRegistrationType = ["WORKSHOP", "EVENT", "COURSE", "BOOTCAMP", "WEBINAR", "CONFERENCE"].includes(
        (oppData.opportunity.opportunityType || oppData.opportunity.category).toUpperCase()
      );
      if (isRegistrationType && appData.applications?.length === 0 && regData.registrations?.length > 0) {
        setActiveTab("attendees");
      }
    } catch {
      router.push("/organizer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Open candidate details drawer
  const handleSelectCandidate = (app: any) => {
    setSelectedCandidate(app);
    setCandidateNotes(app.notes || "");
    setCandidateRating(app.rating || 0);
  };

  // Update Candidate Status / Notes / Rating
  const handleUpdateCandidateStage = async (applicationId: string, newStatus: string) => {
    setUpdatingCandidate(true);
    try {
      const res = await fetch(`/api/organizer/opportunities/${id}/applications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          notes: candidateNotes,
          rating: candidateRating,
        }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus, notes: candidateNotes, rating: candidateRating } : a))
        );
        if (selectedCandidate && selectedCandidate.id === applicationId) {
          setSelectedCandidate((prev: any) => ({ ...prev, status: newStatus, notes: candidateNotes, rating: candidateRating }));
        }
      }
    } finally {
      setUpdatingCandidate(false);
    }
  };

  // Save Recruiter Notes & Rating
  const handleSaveEvaluation = async () => {
    if (!selectedCandidate) return;
    setUpdatingCandidate(true);
    try {
      await fetch(`/api/organizer/opportunities/${id}/applications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedCandidate.id,
          notes: candidateNotes,
          rating: candidateRating,
        }),
      });

      setApplications((prev) =>
        prev.map((a) => (a.id === selectedCandidate.id ? { ...a, notes: candidateNotes, rating: candidateRating } : a))
      );
    } finally {
      setUpdatingCandidate(false);
    }
  };

  // Toggle Attendance Check-in
  const handleToggleAttendance = async (reg: any) => {
    const nextAttendance = !reg.attendanceMarked;
    try {
      const res = await fetch(`/api/organizer/opportunities/${id}/registrations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: reg.id,
          attendanceMarked: nextAttendance,
          status: nextAttendance ? "ATTENDED" : "REGISTERED",
        }),
      });

      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === reg.id ? { ...r, attendanceMarked: nextAttendance, status: nextAttendance ? "ATTENDED" : "REGISTERED" } : r))
        );
      }
    } catch {}
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "College", "Status", "Attended", "Registration Date"];
    const rows = registrations.map((r) => [
      `"${r.name || r.user?.name || ""}"`,
      `"${r.email || r.user?.email || ""}"`,
      `"${r.phone || r.user?.phone || ""}"`,
      `"${r.college || r.user?.college || ""}"`,
      `"${r.status}"`,
      `"${r.attendanceMarked ? "Yes" : "No"}"`,
      `"${new Date(r.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${opportunity.slug}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Broadcast Announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    setBroadcasting(true);
    try {
      const res = await fetch(`/api/organizer/opportunities/${id}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
          target: announcementTarget,
          pinned: announcementPinned,
        }),
      });

      const data = await res.json();
      if (res.ok && data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setAnnouncementTitle("");
        setAnnouncementContent("");
      }
    } finally {
      setBroadcasting(false);
    }
  };

  // Batch Issue Certificates
  const handleIssueCertificates = async () => {
    setIssuingCertificates(true);
    setCertSuccessMessage("");
    try {
      const res = await fetch(`/api/organizer/opportunities/${id}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generateAllParticipants: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCertSuccessMessage(data.message || "Certificates issued successfully!");
      }
    } finally {
      setIssuingCertificates(false);
    }
  };

  if (loading || !opportunity) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Filter candidates
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.name && app.name.toLowerCase().includes(candidateSearch.toLowerCase())) ||
      (app.email && app.email.toLowerCase().includes(candidateSearch.toLowerCase())) ||
      (app.skills && app.skills.toLowerCase().includes(candidateSearch.toLowerCase())) ||
      (app.college && app.college.toLowerCase().includes(candidateSearch.toLowerCase()));

    const matchesStage = stageFilter === "ALL" || app.status === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-cardBorder">
        <div className="space-y-1">
          <Link
            href="/organizer"
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-ivory-500 hover:text-ivory-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Organizer Console</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-bronze-400 bg-bronze-500/10 px-2 py-0.5 rounded-md">
              {opportunity.opportunityType || opportunity.category}
            </span>
            <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
              {opportunity.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/opportunity/${opportunity.slug}`}
            target="_blank"
            className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-ivory-300 bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-cardBorder transition-colors"
          >
            <span>Public View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-charcoal-cardBorder pb-2">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
            activeTab === "pipeline"
              ? "bg-bronze-500/20 text-bronze-300 border border-bronze-500/40"
              : "text-ivory-500 hover:text-ivory-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Candidate Pipeline ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("attendees")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
            activeTab === "attendees"
              ? "bg-bronze-500/20 text-bronze-300 border border-bronze-500/40"
              : "text-ivory-500 hover:text-ivory-200"
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Attendees ({registrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
            activeTab === "announcements"
              ? "bg-bronze-500/20 text-bronze-300 border border-bronze-500/40"
              : "text-ivory-500 hover:text-ivory-200"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
            activeTab === "certificates"
              ? "bg-bronze-500/20 text-bronze-300 border border-bronze-500/40"
              : "text-ivory-500 hover:text-ivory-200"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Issue Certificates</span>
        </button>
      </div>

      {/* TAB 1: KANBAN CANDIDATE PIPELINE */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-ivory-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                placeholder="Search candidates by name, email, college, skills..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-ivory-500 font-mono text-[11px]">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Stages ({applications.length})</option>
                {APPLICATION_STAGES.map((st) => (
                  <option key={st.key} value={st.key}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start">
            {APPLICATION_STAGES.map((stage) => {
              const stageApps = filteredApplications.filter((a) => a.status === stage.key);
              return (
                <div
                  key={stage.key}
                  className="rounded-2xl bg-charcoal-card border border-charcoal-cardBorder flex flex-col min-h-[550px] shadow-sm overflow-hidden"
                >
                  {/* Column Header */}
                  <div className="p-3 bg-charcoal-900/90 border-b border-charcoal-cardBorder flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-ivory-200">
                      {stage.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-charcoal-800 text-ivory-400 font-mono text-[11px] flex items-center justify-center font-bold">
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Candidate Cards List */}
                  <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[600px]">
                    {stageApps.length === 0 ? (
                      <div className="py-12 text-center text-[11px] text-ivory-600 font-mono italic">
                        No candidates
                      </div>
                    ) : (
                      stageApps.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => handleSelectCandidate(app)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                            selectedCandidate?.id === app.id
                              ? "bg-bronze-500/15 border-bronze-500 shadow-md"
                              : "bg-charcoal-900/80 border-charcoal-cardBorder hover:border-charcoal-700 hover:bg-charcoal-900"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="font-bold text-xs text-ivory-100 truncate">
                              {app.name}
                            </div>
                            {app.rating > 0 && (
                              <div className="flex items-center text-amber-400 text-[10px] font-mono">
                                <span>★ {app.rating}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-[10.5px] text-ivory-400 truncate">
                            {app.college || app.degree || "Candidate"}
                          </div>

                          {app.skills && (
                            <div className="text-[10px] text-bronze-300/90 font-mono truncate">
                              {app.skills}
                            </div>
                          )}

                          <div className="text-[9.5px] text-ivory-600 font-mono">
                            {formatDate(app.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDEES TABLE (FOR WORKSHOPS, EVENTS, COURSES) */}
      {activeTab === "attendees" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder">
            <div className="text-xs text-ivory-300">
              Total Registrations: <strong className="text-forest-300 font-mono">{registrations.length}</strong>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all shadow-button"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Attendees CSV</span>
            </button>
          </div>

          <div className="rounded-2xl bg-charcoal-card border border-charcoal-cardBorder overflow-x-auto shadow-card">
            <table className="w-full text-left text-xs text-ivory-300">
              <thead className="bg-charcoal-900 border-b border-charcoal-cardBorder font-mono text-[10.5px] uppercase tracking-wider text-ivory-500">
                <tr>
                  <th className="p-3.5">Attendee</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">College / Org</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-cardBorder">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-ivory-500 font-mono">
                      No attendees registered yet.
                    </td>
                  </tr>
                ) : (
                  registrations.map((reg) => {
                    const badge = getRegistrationStatusBadge(reg.status);
                    return (
                      <tr key={reg.id} className="hover:bg-charcoal-900/50 transition-colors">
                        <td className="p-3.5 font-bold text-ivory-100">
                          {reg.name || reg.user?.name}
                        </td>
                        <td className="p-3.5 font-mono text-ivory-400">
                          {reg.email || reg.user?.email}
                        </td>
                        <td className="p-3.5 font-mono text-ivory-400">
                          {reg.phone || reg.user?.phone || "—"}
                        </td>
                        <td className="p-3.5 text-ivory-400">
                          {reg.college || reg.user?.college || "—"}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${badge.className}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                            <span>{badge.label}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleAttendance(reg)}
                            className={`px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold transition-colors ${
                              reg.attendanceMarked
                                ? "bg-forest-500/20 text-forest-300 border border-forest-500/40"
                                : "bg-charcoal-900 text-ivory-400 border border-charcoal-cardBorder hover:text-white"
                            }`}
                          >
                            {reg.attendanceMarked ? "✓ Checked In" : "Mark Attended"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          {/* Post announcement box */}
          <div className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4">
            <h3 className="text-sm font-bold text-ivory-100 font-mono uppercase tracking-wider flex items-center space-x-2">
              <Send className="w-4 h-4 text-bronze-400" />
              <span>Broadcast Announcement</span>
            </h3>

            <form onSubmit={handlePostAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Interview shortlist published / Workshop zoom link ready"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                  Announcement Message *
                </label>
                <textarea
                  rows={3}
                  required
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  placeholder="Detailed message or instructions broadcasted via notification..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 text-ivory-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementPinned}
                    onChange={(e) => setAnnouncementPinned(e.target.checked)}
                    className="rounded"
                  />
                  <span>Pin to top</span>
                </label>

                <button
                  type="submit"
                  disabled={broadcasting}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{broadcasting ? "Broadcasting..." : "Broadcast Update"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Announcements list */}
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-ivory-100">{ann.title}</span>
                  <span className="text-[10px] font-mono text-ivory-500">{formatDate(ann.createdAt)}</span>
                </div>
                <p className="text-xs text-ivory-400 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATES ISSUANCE */}
      {activeTab === "certificates" && (
        <div className="p-8 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest-500/10 text-forest-300 border border-forest-500/20 text-xs font-mono font-bold">
              <Award className="w-3.5 h-3.5" />
              <span>Verifiable Credential Generator</span>
            </div>
            <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
              Issue Official Verified Certificates
            </h2>
            <p className="text-xs text-ivory-400 max-w-xl leading-relaxed">
              Generate unique cryptographically verifiable certificates for your participants, shortlisted candidates, and winners with public links on <strong className="text-ivory-200">nimblux.xyz/certificate/[code]</strong>.
            </p>
          </div>

          {certSuccessMessage && (
            <div className="p-4 rounded-2xl bg-forest-500/15 border border-forest-500/30 text-forest-300 text-xs flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{certSuccessMessage}</span>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-ivory-100">
                1-Click Batch Issue to All Participants
              </div>
              <div className="text-[11px] text-ivory-500">
                Issues verifiable certificate codes to all confirmed registered attendees and selected applicants.
              </div>
            </div>

            <button
              onClick={handleIssueCertificates}
              disabled={issuingCertificates}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50 transition-all flex-shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>{issuingCertificates ? "Generating..." : "Generate Certificates"}</span>
            </button>
          </div>
        </div>
      )}

      {/* CANDIDATE INSPECTOR DRAWER */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl h-full bg-charcoal-card border-l border-charcoal-cardBorder p-6 sm:p-8 overflow-y-auto space-y-6 shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-ivory-500 hover:text-ivory-100 hover:bg-charcoal-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Candidate Header */}
            <div className="space-y-2 pr-8">
              <div className="flex items-center space-x-2">
                <span className="text-[10.5px] font-mono uppercase tracking-wider text-bronze-400 font-bold">
                  Applicant Profile
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono ${getApplicationStageBadge(selectedCandidate.status).className}`}>
                  {getApplicationStageBadge(selectedCandidate.status).label}
                </span>
              </div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                {selectedCandidate.name}
              </h2>
              <div className="text-xs text-ivory-400">
                {selectedCandidate.college || "University"} • {selectedCandidate.degree || "Degree"} • Graduating {selectedCandidate.graduationYear || "2026"}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-2">
              <div className="text-[10.5px] font-mono text-ivory-500 uppercase tracking-wider font-bold">
                Advance Candidate Stage
              </div>
              <div className="flex flex-wrap gap-1.5">
                {APPLICATION_STAGES.map((st) => (
                  <button
                    key={st.key}
                    onClick={() => handleUpdateCandidateStage(selectedCandidate.id, st.key)}
                    disabled={updatingCandidate}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      selectedCandidate.status === st.key
                        ? "bg-bronze-500 text-charcoal-950"
                        : "bg-charcoal-800 text-ivory-300 hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact & Profiles */}
            <div className="space-y-2.5 text-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ivory-500 font-bold">
                Contact Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-ivory-300">
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-charcoal-900 font-mono">
                  <Mail className="w-3.5 h-3.5 text-bronze-400" />
                  <span className="truncate">{selectedCandidate.email}</span>
                </div>
                <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-charcoal-900 font-mono">
                  <Phone className="w-3.5 h-3.5 text-bronze-400" />
                  <span>{selectedCandidate.phone || "No phone"}</span>
                </div>
              </div>
            </div>

            {/* Links & Resume */}
            <div className="space-y-2.5 text-xs">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ivory-500 font-bold">
                Portfolios & Resume
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedCandidate.resumeUrl && (
                  <a
                    href={selectedCandidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-bronze-500/15 text-bronze-300 border border-bronze-500/30 font-bold hover:bg-bronze-500/25 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Resume / CV</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedCandidate.portfolioUrl && (
                  <a
                    href={selectedCandidate.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-charcoal-900 text-ivory-300 border border-charcoal-cardBorder hover:text-white"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
                {selectedCandidate.githubUrl && (
                  <a
                    href={selectedCandidate.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-charcoal-900 text-ivory-300 border border-charcoal-cardBorder hover:text-white"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {selectedCandidate.linkedinUrl && (
                  <a
                    href={selectedCandidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-charcoal-900 text-ivory-300 border border-charcoal-cardBorder hover:text-white"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>

            {/* Custom Question Responses */}
            {selectedCandidate.answers && (
              <div className="space-y-2.5 text-xs">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Screening Responses
                </div>
                <div className="space-y-2">
                  {(() => {
                    try {
                      const parsed = typeof selectedCandidate.answers === "string"
                        ? JSON.parse(selectedCandidate.answers)
                        : selectedCandidate.answers;
                      if (Array.isArray(parsed)) {
                        return parsed.map((ans: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder space-y-1">
                            <div className="text-ivory-400 font-bold">{ans.question}</div>
                            <div className="text-ivory-100 whitespace-pre-line">{ans.answer || "No response"}</div>
                          </div>
                        ));
                      }
                      return null;
                    } catch {
                      return null;
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Cover Note */}
            {selectedCandidate.coverLetter && (
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-mono uppercase tracking-wider text-ivory-500 font-bold">
                  Cover Note / Statement
                </div>
                <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-300 leading-relaxed whitespace-pre-line">
                  {selectedCandidate.coverLetter}
                </div>
              </div>
            )}

            {/* Evaluation Notes & Rating */}
            <div className="space-y-3 pt-4 border-t border-charcoal-cardBorder text-xs">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono uppercase tracking-wider text-ivory-400 font-bold">
                  Candidate Rating
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCandidateRating(star)}
                      className="p-1 text-base text-amber-400 hover:scale-110 transition-transform"
                    >
                      {star <= candidateRating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-ivory-400 font-bold block mb-1">
                  Internal Evaluation Notes
                </label>
                <textarea
                  rows={3}
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  placeholder="Add private evaluation notes visible only to your team..."
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveEvaluation}
                disabled={updatingCandidate}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all shadow-button"
              >
                {updatingCandidate ? "Saving Evaluation..." : "Save Evaluation Notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
