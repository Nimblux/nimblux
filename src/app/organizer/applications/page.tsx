"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  ExternalLink,
  Star,
  FileText,
  Mail,
  Phone,
  GraduationCap,
  Github,
  Linkedin,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { formatDate, getApplicationStageBadge } from "@/lib/utils";
import { APPLICATION_STAGES } from "@/lib/constants";

export default function OrganizerApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState("ALL");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Candidate Details Drawer
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedOppId !== "ALL") params.append("opportunityId", selectedOppId);
    if (selectedStage !== "ALL") params.append("status", selectedStage);
    if (searchQuery) params.append("q", searchQuery);

    fetch(`/api/organizer/applications?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setApplications(d.applications || []);
        if (d.opportunities) setOpportunities(d.opportunities);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedOppId, selectedStage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleOpenCandidate = (app: any) => {
    setSelectedApp(app);
    setRating(app.rating || 0);
    setNotes(app.notes || "");
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/organizer/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          status: newStatus,
          rating,
          notes,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setSelectedApp({ ...selectedApp, status: newStatus, rating, notes });
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? { ...a, status: newStatus, rating, notes } : a))
        );
      }
    } catch {}
    setUpdating(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/organizer/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          rating,
          notes,
        }),
      });
      if (res.ok) {
        setSelectedApp({ ...selectedApp, rating, notes });
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? { ...a, rating, notes } : a))
        );
      }
    } catch {}
    setUpdating(false);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-[#D8B77A] text-xs font-mono font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Candidate Review Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[700] text-[#F5F1E8] tracking-tight">
            Applicant Pipelines
          </h1>
          <p className="text-xs text-[#A9AAA5] mt-1 font-normal">
            Review resumes, evaluate candidates, add internal recruiter ratings, and advance candidates through pipeline stages.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Opportunity Dropdown */}
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
            className="w-full sm:w-72 px-3 py-2 rounded-[10px] bg-[#111615] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
          >
            <option value="ALL">All Opportunities ({opportunities.length})</option>
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#7E807B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate, college, skill..."
              className="w-full pl-8 pr-3 py-2 rounded-[10px] bg-[#111615] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
            />
          </form>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-[10px] bg-[#111615] border border-white/[0.06] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedStage("ALL")}
            className={`px-3 py-1.5 rounded-[7px] text-xs font-medium transition-colors whitespace-nowrap ${
              selectedStage === "ALL"
                ? "bg-[#D8B77A] text-[#090B0B] font-semibold"
                : "text-[#A9AAA5] hover:text-[#F5F1E8]"
            }`}
          >
            All Candidates ({applications.length})
          </button>
          {APPLICATION_STAGES.map((st) => (
            <button
              key={st.key}
              onClick={() => setSelectedStage(st.key)}
              className={`px-3 py-1.5 rounded-[7px] text-xs font-medium transition-colors whitespace-nowrap ${
                selectedStage === st.key
                  ? "bg-[#D8B77A] text-[#090B0B] font-semibold"
                  : "text-[#A9AAA5] hover:text-[#F5F1E8]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="rounded-[18px] bg-[#111615] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin mx-auto" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Users className="w-8 h-8 text-[#A9AAA5] mx-auto opacity-50" />
            <p className="text-xs text-[#A9AAA5]">No candidates found in this stage.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => handleOpenCandidate(app)}
                className="p-5 hover:bg-white/[0.02] cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-[#F5F1E8]">
                      {app.name}
                    </span>
                    {(() => {
                      const badge = getApplicationStageBadge(app.status);
                      return (
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-medium ${badge.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                          <span>{badge.label}</span>
                        </span>
                      );
                    })()}
                    {app.rating > 0 && (
                      <span className="inline-flex items-center text-[#D8B77A] text-xs font-mono">
                        {"★".repeat(app.rating)}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#D8B77A] font-medium">
                    Applied for: {app.opportunity?.title}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#A9AAA5] font-mono">
                    {app.college && <span>🎓 {app.college}</span>}
                    {app.graduationYear && <span>Class of {app.graduationYear}</span>}
                    <span>•</span>
                    <span>Applied: {formatDate(app.createdAt)}</span>
                  </div>

                  {app.skills && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {app.skills.split(",").slice(0, 4).map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-[5px] text-[10px] bg-[#0E1110] text-[#A9AAA5] border border-white/[0.06]"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-[#F5F1E8] text-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#D8B77A]" />
                      <span>Resume</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenCandidate(app)}
                    className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-[8px] bg-[#D8B77A]/10 hover:bg-[#D8B77A]/20 text-[#D8B77A] text-xs font-semibold transition-colors"
                  >
                    <span>Evaluate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Evaluation Modal Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B0B]/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[20px] bg-[#111615] border border-white/[0.12] p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 p-2 rounded-[8px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Candidate Header */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                {(() => {
                  const badge = getApplicationStageBadge(selectedApp.status);
                  return (
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-medium ${badge.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                      <span>{badge.label}</span>
                    </span>
                  );
                })()}
                <span className="text-xs text-[#A9AAA5] font-mono">
                  Applied {formatDate(selectedApp.createdAt)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#F5F1E8]">{selectedApp.name}</h2>
              <div className="text-xs text-[#D8B77A] mt-0.5">
                Target Role: {selectedApp.opportunity?.title}
              </div>
            </div>

            {/* Contact & Profile Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-[12px] bg-[#0E1110] border border-white/[0.06] text-xs">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[#A9AAA5]">
                  <Mail className="w-3.5 h-3.5 text-[#7E807B]" />
                  <a href={`mailto:${selectedApp.email}`} className="hover:text-[#F5F1E8] underline">
                    {selectedApp.email}
                  </a>
                </div>
                {selectedApp.phone && (
                  <div className="flex items-center space-x-2 text-[#A9AAA5]">
                    <Phone className="w-3.5 h-3.5 text-[#7E807B]" />
                    <span>{selectedApp.phone}</span>
                  </div>
                )}
                {selectedApp.college && (
                  <div className="flex items-center space-x-2 text-[#A9AAA5]">
                    <GraduationCap className="w-3.5 h-3.5 text-[#7E807B]" />
                    <span>{selectedApp.college} ({selectedApp.degree || "Student"})</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {selectedApp.resumeUrl && (
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-[#D8B77A] font-semibold hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Candidate Resume (PDF)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <div className="flex items-center space-x-3 pt-1">
                  {selectedApp.githubUrl && (
                    <a
                      href={selectedApp.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#A9AAA5] hover:text-[#F5F1E8]"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {selectedApp.linkedinUrl && (
                    <a
                      href={selectedApp.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#A9AAA5] hover:text-[#F5F1E8]"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {selectedApp.portfolioUrl && (
                    <a
                      href={selectedApp.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#A9AAA5] hover:text-[#F5F1E8]"
                      title="Portfolio"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Key Skills */}
            {selectedApp.skills && (
              <div>
                <label className="block text-xs font-mono font-medium text-[#A9AAA5] mb-1.5">
                  Verified Skills
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.skills.split(",").map((s: string) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-[6px] text-xs bg-[#0E1110] text-[#F5F1E8] border border-white/[0.08]"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Note to Recruiter / Cover Letter */}
            {selectedApp.coverLetter && (
              <div>
                <label className="block text-xs font-mono font-medium text-[#A9AAA5] mb-1.5">
                  Candidate Note / Cover Letter
                </label>
                <div className="p-3.5 rounded-[10px] bg-[#0E1110] border border-white/[0.06] text-xs text-[#F5F1E8] leading-relaxed whitespace-pre-wrap">
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}

            {/* Stage Transition Buttons */}
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <label className="block text-xs font-mono font-medium text-[#A9AAA5]">
                Advance Candidate Stage
              </label>
              <div className="flex flex-wrap gap-2">
                {APPLICATION_STAGES.map((st) => (
                  <button
                    key={st.key}
                    disabled={updating}
                    onClick={() => handleUpdateStatus(st.key)}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                      selectedApp.status === st.key
                        ? "bg-[#D8B77A] text-[#090B0B] ring-2 ring-[#D8B77A]/50"
                        : "bg-[#0E1110] text-[#A9AAA5] hover:text-[#F5F1E8] border border-white/[0.08]"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recruiter Evaluation Notes & Rating */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-medium text-[#A9AAA5]">
                  Internal Recruiter Evaluation
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-base transition-colors ${
                        star <= rating ? "text-[#D8B77A]" : "text-[#7E807B] hover:text-[#D8B77A]"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Private candidate interview notes, technical screening feedback, next steps..."
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0E1110] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-[8px] text-xs font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
                >
                  {updating ? "Saving..." : "Save Evaluation Notes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
