"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Code,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  Plus,
  UserPlus,
  Send,
  Github,
  Video,
  Presentation,
  Award,
  AlertCircle,
  FileCode,
  X,
} from "lucide-react";
import { formatDate, getDaysRemaining } from "@/lib/utils";
import { formatCurrency, getParticipationModeBadge } from "@/lib/hackathon";

export default function ParticipantHackathonsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [joinTeamModalOpen, setJoinTeamModalOpen] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null);

  // Form states
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submittingProject, setSubmittingProject] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    title: "",
    shortSummary: "",
    description: "",
    problemStatement: "",
    techStack: "",
    githubUrl: "",
    demoUrl: "",
    videoUrl: "",
    presentationUrl: "",
    trackId: "",
    isDraft: false,
  });

  const fetchMyHackathons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hackathons?userParticipating=true");
      if (!res.ok) throw new Error("Please log in");
      const data = await res.json();
      setHackathons(data.hackathons || []);
    } catch (err: any) {
      setError(err.message || "Failed to load hackathons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHackathons();
  }, []);

  // Handle Team Creation
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon || !teamName.trim()) return;
    try {
      const res = await fetch(`/api/hackathons/${selectedHackathon.id}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create team");
      setSuccess(`Team "${data.team.name}" created! Invite code: ${data.team.code}`);
      setCreateTeamModalOpen(false);
      setTeamName("");
      fetchMyHackathons();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle Join Team
  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon || !joinCode.trim()) return;
    try {
      const res = await fetch(`/api/hackathons/${selectedHackathon.id}/teams/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join team");
      setSuccess(`Successfully joined team "${data.team.name}"!`);
      setJoinTeamModalOpen(false);
      setJoinCode("");
      fetchMyHackathons();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle Project Submission
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon || !submissionForm.title.trim()) return;
    try {
      setSubmittingProject(true);
      const res = await fetch(`/api/hackathons/${selectedHackathon.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit project");
      setSuccess("Project successfully submitted to the hackathon! 🚀");
      setSubmissionModalOpen(false);
      fetchMyHackathons();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingProject(false);
    }
  };

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
            My Hackathons & Competitions
          </h1>
          <p className="text-xs text-ivory-500 mt-1">
            Track your registered hackathons, manage your builder team, submit project deliverables, and view results.
          </p>
        </div>

        <Link
          href="/hackathons"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all self-start"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore More Hackathons</span>
        </Link>
      </div>

      {/* Notifications */}
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

      {/* Hackathons List */}
      {hackathons.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4">
          <Trophy className="w-12 h-12 text-ivory-500 mx-auto" />
          <h3 className="text-base font-bold text-ivory-100">No active hackathon registrations</h3>
          <p className="text-xs text-ivory-500 max-w-sm mx-auto leading-relaxed">
            Discover upcoming hackathons, register in 1 click, and start building with student teams.
          </p>
          <div className="pt-2">
            <Link
              href="/hackathons"
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Browse Open Hackathons</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {hackathons.map((h) => {
            const daysInfo = getDaysRemaining(h.submissionDeadline);
            return (
              <div
                key={h.id}
                className="p-6 sm:p-8 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-bronze-300 font-bold">
                        Organized by {h.organizerName}
                      </span>
                      <span className="text-ivory-600">•</span>
                      <span className="text-[11px] font-mono text-ivory-400">{h.mode}</span>
                    </div>
                    <Link href={`/hackathon/${h.slug}`} className="block group">
                      <h2 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100 group-hover:text-bronze-300 transition-colors">
                        {h.title}
                      </h2>
                    </Link>
                    <p className="text-xs text-ivory-400 font-mono">
                      Submissions Due: {formatDate(h.submissionDeadline)} ({daysInfo.text})
                    </p>
                  </div>

                  <Link
                    href={`/hackathon/${h.slug}`}
                    className="inline-flex items-center space-x-1 text-xs text-ivory-400 hover:text-ivory-200"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* 5-Step Participant Workflow Progress */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-charcoal-cardBorder">
                  {/* 1. Registration */}
                  <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-1.5">
                    <div className="text-[10.5px] font-mono uppercase text-forest-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>1. Registered</span>
                    </div>
                    <div className="text-xs font-semibold text-ivory-200">Participation Active</div>
                  </div>

                  {/* 2. Team Status */}
                  <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-2">
                    <div className="text-[10.5px] font-mono uppercase text-ivory-500 font-bold">
                      2. Team
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedHackathon(h);
                          setCreateTeamModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-bronze-500/15 text-bronze-300 border border-bronze-500/30 text-[11px] font-mono font-bold hover:bg-bronze-500/25"
                      >
                        Create Team
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHackathon(h);
                          setJoinTeamModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-charcoal-800 text-ivory-300 border border-charcoal-700 text-[11px] font-mono hover:text-white"
                      >
                        Join Code
                      </button>
                    </div>
                  </div>

                  {/* 3. Project Submission */}
                  <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-2">
                    <div className="text-[10.5px] font-mono uppercase text-ivory-500 font-bold">
                      3. Project Submission
                    </div>
                    <button
                      onClick={() => {
                        setSelectedHackathon(h);
                        setSubmissionModalOpen(true);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all text-center"
                    >
                      Submit Deliverables
                    </button>
                  </div>

                  {/* 4. Results & Certificates */}
                  <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-1.5">
                    <div className="text-[10.5px] font-mono uppercase text-ivory-500 font-bold">
                      4. Verification & Award
                    </div>
                    <div className="text-xs text-ivory-400 font-mono">
                      {h.status === "COMPLETED" ? "🏆 Concluded" : "⏳ In Progress"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      {createTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setCreateTeamModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-ivory-500 hover:text-ivory-100 rounded-xl hover:bg-charcoal-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                Form a Builder Team
              </h2>
              <p className="text-xs text-ivory-500 mt-1">
                Creating a team generates a unique invite code for teammates to join.
              </p>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">Team Name *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Quantum Builders / AI Pioneers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div className="pt-3 border-t border-charcoal-cardBorder flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCreateTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-ivory-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN TEAM MODAL */}
      {joinTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setJoinTeamModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-ivory-500 hover:text-ivory-100 rounded-xl hover:bg-charcoal-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                Join an Existing Team
              </h2>
              <p className="text-xs text-ivory-500 mt-1">
                Enter the 6-character team invite code shared by your team leader.
              </p>
            </div>

            <form onSubmit={handleJoinTeam} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">Team Invite Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A9B2X7"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono tracking-widest text-center text-base uppercase"
                />
              </div>

              <div className="pt-3 border-t border-charcoal-cardBorder flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setJoinTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-ivory-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button"
                >
                  Join Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT SUBMISSION MODAL */}
      {submissionModalOpen && selectedHackathon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setSubmissionModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-ivory-500 hover:text-ivory-100 rounded-xl hover:bg-charcoal-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                Submit Hackathon Deliverables
              </h2>
              <p className="text-xs text-ivory-500 mt-1">
                Provide your code repository, demo URL, video walkthrough, and architecture summary.
              </p>
            </div>

            <form onSubmit={handleSubmitProject} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">Project Title *</label>
                <input
                  type="text"
                  required
                  value={submissionForm.title}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, title: e.target.value })}
                  placeholder="e.g. NextGen Autonomous AI Agent Platform"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">One-line Tagline / Elevator Pitch</label>
                <input
                  type="text"
                  value={submissionForm.shortSummary}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, shortSummary: e.target.value })}
                  placeholder="e.g. AI-assisted multi-agent framework for automated bug triage"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">Detailed Description & Solution *</label>
                <textarea
                  rows={4}
                  required
                  value={submissionForm.description}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })}
                  placeholder="Explain the problem you solved, your technical architecture, and key innovations..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">GitHub Repository URL *</label>
                  <input
                    type="url"
                    required
                    value={submissionForm.githubUrl}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/org/repo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">Live Demo / Deployed URL</label>
                  <input
                    type="url"
                    value={submissionForm.demoUrl}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, demoUrl: e.target.value })}
                    placeholder="https://myproject.vercel.app"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">Video Walkthrough (YouTube / Loom)</label>
                  <input
                    type="url"
                    value={submissionForm.videoUrl}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">Presentation Slide Deck URL</label>
                  <input
                    type="url"
                    value={submissionForm.presentationUrl}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, presentationUrl: e.target.value })}
                    placeholder="https://slides.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-ivory-300 block mb-1 font-mono">Tech Stack (Comma separated)</label>
                <input
                  type="text"
                  value={submissionForm.techStack}
                  onChange={(e) => setSubmissionForm({ ...submissionForm, techStack: e.target.value })}
                  placeholder="e.g. Next.js, Python, PostgreSQL, Gemini API, PyTorch"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>

              <div className="pt-4 border-t border-charcoal-cardBorder flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSubmissionModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-ivory-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProject}
                  className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 disabled:opacity-50 shadow-button"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingProject ? "Submitting..." : "Submit Project"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
