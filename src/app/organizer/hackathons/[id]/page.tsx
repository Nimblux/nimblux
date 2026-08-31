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
  ArrowLeft,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Github,
  Video,
  Presentation,
  Send,
  Award,
  Layers,
  Search,
  SlidersHorizontal,
  Lock,
  Unlock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { formatCurrency, getHackathonStatusBadge } from "@/lib/hackathon";

export default function HackathonOrganizerHubPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("participants");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sub-data states
  const [participants, setParticipants] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals / forms
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "", pinned: false });
  const [judgeEmail, setJudgeEmail] = useState("");
  const [winnerForm, setWinnerForm] = useState({
    title: "1st Place Winner",
    rank: 1,
    teamId: "",
    submissionId: "",
    prizeAmount: "",
    currency: "INR",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hackathons/${params.id}`);
      if (!res.ok) throw new Error("Unauthorized or not found");
      const data = await res.json();
      setHackathon(data.hackathon);

      // Fetch participants, teams, submissions, announcements, leaderboard
      const [teamsRes, subsRes, annRes, leadRes] = await Promise.all([
        fetch(`/api/hackathons/${params.id}/teams`),
        fetch(`/api/hackathons/${params.id}/submissions`),
        fetch(`/api/hackathons/${params.id}/announcements`),
        fetch(`/api/hackathons/${params.id}/leaderboard`),
      ]);

      if (teamsRes.ok) {
        const d = await teamsRes.json();
        setTeams(d.teams || []);
      }
      if (subsRes.ok) {
        const d = await subsRes.json();
        setSubmissions(d.submissions || []);
      }
      if (annRes.ok) {
        const d = await annRes.json();
        setAnnouncements(d.announcements || []);
      }
      if (leadRes.ok) {
        const d = await leadRes.json();
        setLeaderboard(d.leaderboard || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load hackathon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  // Toggle Controls
  const handleToggle = async (field: string, value: boolean) => {
    try {
      const res = await fetch(`/api/hackathons/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setHackathon((prev: any) => ({ ...prev, ...data.hackathon }));
        setSuccess(`Updated ${field} successfully!`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Failed to update control.");
    }
  };

  // CSV Export for Participants
  const handleExportCSV = () => {
    if (!hackathon || !teams) return;
    const headers = [
      "Registration ID",
      "Name",
      "Email",
      "Phone",
      "College",
      "Degree",
      "Grad Year",
      "Skills",
      "GitHub",
      "LinkedIn",
      "Portfolio",
      "Team Name",
    ];

    const rows = teams.flatMap((team: any) =>
      team.members.map((m: any) => [
        m.user.id,
        m.user.name,
        m.user.email,
        m.user.phone || "",
        m.user.college || "",
        m.user.degree || "",
        m.user.graduationYear || "",
        `"${m.user.skills || ""}"`,
        m.user.githubUrl || "",
        m.user.linkedinUrl || "",
        m.user.portfolioUrl || "",
        team.name,
      ])
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${hackathon.slug}-participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Announcement
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/hackathons/${params.id}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announcementForm),
      });
      if (res.ok) {
        setAnnouncementForm({ title: "", content: "", pinned: false });
        fetchData();
        setSuccess("Announcement broadcasted successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch {
      setError("Failed to post announcement.");
    }
  };

  // Generate Certificates
  const handleGenerateCertificates = async () => {
    try {
      const res = await fetch(`/api/hackathons/${params.id}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generateAllParticipants: true }),
      });
      if (res.ok) {
        const d = await res.json();
        setSuccess(`Generated ${d.count} verifiable certificates!`);
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch {
      setError("Failed to generate certificates.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <h2 className="text-xl font-bold text-ivory-100">Hackathon Not Found</h2>
        <Link href="/organizer" className="text-bronze-300 underline text-sm">
          Return to Organizer Dashboard
        </Link>
      </div>
    );
  }

  const statusBadge = getHackathonStatusBadge(hackathon.status);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-cardBorder">
        <div className="flex items-center space-x-3">
          <Link
            href="/organizer"
            className="p-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-400 hover:text-ivory-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
                {hackathon.title}
              </h1>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold border ${statusBadge.className}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
                <span>{statusBadge.label}</span>
              </span>
            </div>
            <p className="text-xs text-ivory-500 font-mono mt-0.5">
              Host Management Console • {hackathon.mode} • {formatCurrency(hackathon.totalPrizePool || 0, hackathon.prizeCurrency)} Pool
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/hackathon/${hackathon.slug}`}
            target="_blank"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-cardBorder text-ivory-200"
          >
            <span>Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Notifications banner */}
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

      {/* Quick Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card">
        {/* Registration Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder">
          <div>
            <div className="font-bold text-xs text-ivory-100">In-Platform Registration</div>
            <div className="text-[10px] text-ivory-500 font-mono">
              {hackathon.isRegistrationOpen ? "Accepting registrations" : "Paused"}
            </div>
          </div>
          <button
            onClick={() => handleToggle("isRegistrationOpen", !hackathon.isRegistrationOpen)}
            className={`p-2 rounded-lg font-mono text-xs font-bold transition-all ${
              hackathon.isRegistrationOpen ? "bg-forest-500/20 text-forest-300" : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {hackathon.isRegistrationOpen ? "OPEN" : "PAUSED"}
          </button>
        </div>

        {/* Late Submissions */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder">
          <div>
            <div className="font-bold text-xs text-ivory-100">Late Submissions</div>
            <div className="text-[10px] text-ivory-500 font-mono">
              {hackathon.allowLateSubmissions ? "Allowed past deadline" : "Strict deadline"}
            </div>
          </div>
          <button
            onClick={() => handleToggle("allowLateSubmissions", !hackathon.allowLateSubmissions)}
            className={`p-2 rounded-lg font-mono text-xs font-bold transition-all ${
              hackathon.allowLateSubmissions ? "bg-forest-500/20 text-forest-300" : "bg-charcoal-800 text-ivory-400"
            }`}
          >
            {hackathon.allowLateSubmissions ? "ENABLED" : "DISABLED"}
          </button>
        </div>

        {/* Leaderboard Public */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder">
          <div>
            <div className="font-bold text-xs text-ivory-100">Public Leaderboard</div>
            <div className="text-[10px] text-ivory-500 font-mono">
              {hackathon.isLeaderboardPublished ? "Live on public page" : "Hidden"}
            </div>
          </div>
          <button
            onClick={() => handleToggle("isLeaderboardPublished", !hackathon.isLeaderboardPublished)}
            className={`p-2 rounded-lg font-mono text-xs font-bold transition-all ${
              hackathon.isLeaderboardPublished ? "bg-amber-500 text-charcoal-950" : "bg-charcoal-800 text-ivory-400"
            }`}
          >
            {hackathon.isLeaderboardPublished ? "PUBLISHED" : "HIDDEN"}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-charcoal-cardBorder">
        {[
          { id: "participants", label: `Participants & Teams (${teams.length} Teams)` },
          { id: "submissions", label: `Submissions (${submissions.length})` },
          { id: "leaderboard", label: "Leaderboard & Judging" },
          { id: "announcements", label: `Announcements (${announcements.length})` },
          { id: "certificates", label: "Certificates Issuer" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-bronze-500 text-charcoal-950 shadow-button"
                : "bg-charcoal-card text-ivory-400 hover:text-ivory-200 border border-charcoal-cardBorder"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: PARTICIPANTS & TEAMS */}
      {activeTab === "participants" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-ivory-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search builder by name, college, or skills..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50 font-mono"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-forest-500/15 text-forest-300 border border-forest-500/30 hover:bg-forest-500/25 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Participants CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-ivory-100">{team.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-mono bg-charcoal-900 text-bronze-300 border border-charcoal-cardBorder">
                    Code: {team.code}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-charcoal-cardBorder">
                  <div className="text-[11px] font-mono text-ivory-500">
                    Members ({team.members.length}):
                  </div>
                  {team.members.map((m: any) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-ivory-200">
                          {m.user.name} {m.user.id === team.leaderId && "👑 (Leader)"}
                        </div>
                        <div className="text-[10px] text-ivory-500 font-mono">
                          {m.user.email} • {m.user.college || "Student"}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {m.user.githubUrl && (
                          <a href={m.user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-ivory-400 hover:text-white">
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUBMISSIONS */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-forest-500/15 text-forest-300 border border-forest-500/30">
                    {sub.status}
                  </span>
                  <span className="text-[11px] font-mono text-ivory-500">
                    {formatDate(sub.submittedAt || sub.createdAt)}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif-heading font-medium text-lg text-ivory-100">
                    {sub.title}
                  </h3>
                  <div className="text-xs text-ivory-400 mt-1">
                    Team: <strong className="text-ivory-200">{sub.team?.name || "Independent"}</strong>
                    {sub.track && ` • Track: ${sub.track.name}`}
                  </div>
                  <p className="text-xs text-ivory-300 mt-2 line-clamp-3">
                    {sub.shortSummary || sub.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-charcoal-cardBorder flex flex-wrap items-center gap-2">
                  {sub.githubUrl && (
                    <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-charcoal-900 text-ivory-300 hover:text-white border border-charcoal-cardBorder text-xs font-mono">
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {sub.demoUrl && (
                    <a href={sub.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-charcoal-900 text-bronze-300 hover:text-white border border-charcoal-cardBorder text-xs font-mono">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Demo</span>
                    </a>
                  )}
                  {sub.videoUrl && (
                    <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-charcoal-900 text-rose-400 hover:text-white border border-charcoal-cardBorder text-xs font-mono">
                      <Video className="w-3.5 h-3.5" />
                      <span>Video</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: LEADERBOARD & JUDGING */}
      {activeTab === "leaderboard" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif-heading font-medium text-xl text-ivory-100">
                Evaluation Matrix & Leaderboard
              </h2>
              <p className="text-xs text-ivory-500 mt-0.5">
                Review scores submitted by designated judges across all scoring criteria.
              </p>
            </div>

            <Link
              href={`/hackathon/${hackathon.slug}/judge`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
            >
              <span>Open Judge Scoring Workspace ⚖️</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-950/80 text-ivory-500 uppercase tracking-wider text-[10px] font-mono border-b border-charcoal-cardBorder">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Project & Team</th>
                  <th className="py-3 px-4">Track</th>
                  <th className="py-3 px-4">Total Score</th>
                  <th className="py-3 px-4">Judge Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-cardBorder/60">
                {leaderboard.map((item, idx) => (
                  <tr key={item.submissionId} className="hover:bg-charcoal-900/40">
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {idx === 0 ? "🥇 1" : idx === 1 ? "🥈 2" : idx === 2 ? "🥉 3" : `#${idx + 1}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-ivory-100">{item.title}</div>
                      <div className="text-[11px] text-ivory-400">{item.teamName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ivory-400">{item.trackName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300 text-sm">
                      {item.weightedScore.toFixed(1)} pts
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ivory-400">{item.judgeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <form onSubmit={handleAddAnnouncement} className="p-6 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-4 text-xs">
            <h3 className="font-serif-heading font-medium text-lg text-ivory-100">
              Broadcast Live Announcement
            </h3>

            <div>
              <label className="font-semibold text-ivory-300 block mb-1 font-mono">Title *</label>
              <input
                type="text"
                required
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                placeholder="e.g. Submissions are now open! Check requirements."
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
              />
            </div>

            <div>
              <label className="font-semibold text-ivory-300 block mb-1 font-mono">Content *</label>
              <textarea
                rows={3}
                required
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                placeholder="Write your broadcast message..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 text-ivory-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementForm.pinned}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, pinned: e.target.checked })}
                  className="rounded"
                />
                <span>Pin to top of public announcements</span>
              </label>

              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Update</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {ann.pinned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bronze-500 text-charcoal-950">
                        PINNED
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-ivory-100">{ann.title}</h4>
                  </div>
                  <span className="text-[11px] font-mono text-ivory-500">{formatDate(ann.createdAt)}</span>
                </div>
                <p className="text-xs text-ivory-300 whitespace-pre-line">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CERTIFICATES */}
      {activeTab === "certificates" && (
        <div className="p-6 sm:p-10 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl">
            📜
          </div>

          <div className="space-y-2">
            <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
              NIMBLUX Verifiable Certificate Generator
            </h2>
            <p className="text-xs sm:text-sm text-ivory-400 leading-relaxed">
              Generate cryptographically indexed participation and winner certificates for all registered builders. Each certificate is verifiable at <code className="text-bronze-300 font-mono">nimblux.xyz/certificate/[code]</code>.
            </p>
          </div>

          <button
            onClick={handleGenerateCertificates}
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate All Certificates Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
