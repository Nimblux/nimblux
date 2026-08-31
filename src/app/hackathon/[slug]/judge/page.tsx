"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Code,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Github,
  Video,
  Presentation,
  CheckCircle2,
  AlertCircle,
  Save,
  Sliders,
  Send,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function HackathonJudgePortalPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hackathons/${params.slug}`);
      if (!res.ok) throw new Error("Hackathon not found");
      const data = await res.json();
      setHackathon(data.hackathon);
      setCriteria(data.hackathon.criteria || []);

      // Fetch submissions to judge
      const judgeRes = await fetch(`/api/hackathons/${data.hackathon.id}/judging`);
      if (judgeRes.ok) {
        const jd = await judgeRes.json();
        setSubmissions(jd.submissions || []);
        if (jd.submissions?.length > 0) {
          selectSubmission(jd.submissions[0], jd.criteria || data.hackathon.criteria);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load judging portal");
    } finally {
      setLoading(false);
    }
  };

  const selectSubmission = (sub: any, critList: any[]) => {
    setSelectedSub(sub);
    setFeedback(sub.judgeFeedback || "");
    const initialScores: Record<string, number> = {};
    critList.forEach((c: any) => {
      initialScores[c.id] = sub.existingScores?.[c.id] || 7;
    });
    setScores(initialScores);
  };

  useEffect(() => {
    fetchData();
  }, [params.slug]);

  const handleScoreChange = (criterionId: string, value: number) => {
    setScores((prev) => ({ ...prev, [criterionId]: value }));
  };

  const handleSaveScore = async () => {
    if (!selectedSub || !hackathon) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const criteriaScores = Object.entries(scores).map(([criterionId, score]) => ({
        criterionId,
        score,
      }));

      const res = await fetch(`/api/hackathons/${hackathon.id}/judging`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          criteriaScores,
          feedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save score");

      setSuccess("Evaluation saved successfully! Total score calculated.");
      setTimeout(() => setSuccess(""), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to submit score");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-cardBorder">
        <div className="flex items-center space-x-3">
          <Link
            href={`/hackathon/${params.slug}`}
            className="p-2 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-400 hover:text-ivory-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif-heading font-medium text-2xl sm:text-3xl text-ivory-100">
                Judging Portal — {hackathon?.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Judge Workspace ⚖️
              </span>
            </div>
            <p className="text-xs text-ivory-500 font-mono mt-0.5">
              Review deliverables, test live applications, and score submissions based on weighted criteria.
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-forest-500/10 border border-forest-500/30 text-forest-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Main 2-Column Judging Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Submissions Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-ivory-100 font-mono uppercase tracking-wider px-1">
            Submissions Queue ({submissions.length})
          </div>

          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {submissions.map((sub) => {
              const isSelected = selectedSub?.id === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => selectSubmission(sub, criteria)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? "bg-charcoal-card border-bronze-500/40 shadow-editorial"
                      : "bg-charcoal-900 border-charcoal-cardBorder hover:border-bronze-500/20 text-ivory-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-ivory-500">
                      {sub.track?.name || "General Track"}
                    </span>
                    {sub.isEvaluated && (
                      <span className="text-[10px] font-mono text-forest-400 font-bold">
                        Scored ✅
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-ivory-100 mt-1 line-clamp-1">
                    {sub.title}
                  </h4>
                  <div className="text-[11px] text-ivory-500 mt-0.5">
                    Team: {sub.team?.name || "Solo Builder"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Scoring Workspace */}
        <div className="lg:col-span-8">
          {selectedSub ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-card border border-charcoal-cardBorder shadow-card space-y-6">
              {/* Project Header */}
              <div className="space-y-2 pb-4 border-b border-charcoal-cardBorder">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-mono bg-bronze-500/15 text-bronze-300">
                    {selectedSub.track?.name || "General Track"}
                  </span>
                  <span className="text-xs text-ivory-400 font-mono">
                    Team: <strong className="text-ivory-200">{selectedSub.team?.name || "Solo Builder"}</strong>
                  </span>
                </div>
                <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
                  {selectedSub.title}
                </h2>
                <p className="text-xs text-ivory-400 leading-relaxed">
                  {selectedSub.shortSummary || selectedSub.description}
                </p>

                {/* Resource Links */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {selectedSub.githubUrl && (
                    <a
                      href={selectedSub.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-charcoal-900 text-ivory-200 hover:text-white border border-charcoal-cardBorder text-xs font-mono"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Source Code Repository</span>
                      <ExternalLink className="w-3 h-3 ml-1 text-ivory-500" />
                    </a>
                  )}

                  {selectedSub.demoUrl && (
                    <a
                      href={selectedSub.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-charcoal-900 text-bronze-300 hover:text-white border border-charcoal-cardBorder text-xs font-mono"
                    >
                      <span>Live Deployed Demo</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}

                  {selectedSub.videoUrl && (
                    <a
                      href={selectedSub.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-charcoal-900 text-rose-400 hover:text-white border border-charcoal-cardBorder text-xs font-mono"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Demo</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>

              {/* Scoring Sliders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-heading font-medium text-lg text-ivory-100">
                    Criteria Scoring Sliders
                  </h3>
                  <span className="text-xs text-ivory-500 font-mono">1 to 10 Scale</span>
                </div>

                <div className="space-y-4">
                  {criteria.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-cardBorder space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-ivory-100">{c.name}</div>
                          <div className="text-[10.5px] text-ivory-500">{c.description}</div>
                        </div>
                        <div className="text-sm font-bold font-mono text-amber-300">
                          {scores[c.id] || 0} / {c.maxScore}
                        </div>
                      </div>

                      <input
                        type="range"
                        min={1}
                        max={c.maxScore || 10}
                        step={1}
                        value={scores[c.id] || 7}
                        onChange={(e) => handleScoreChange(c.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-charcoal-800 rounded-lg appearance-none cursor-pointer accent-bronze-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualitative Feedback */}
              <div className="space-y-2">
                <label className="font-semibold text-ivory-300 block text-xs font-mono">
                  Qualitative Judge Feedback & Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Notes on code cleanliness, creativity, or suggestions for the builders..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
                />
              </div>

              {/* Submit Evaluation */}
              <div className="pt-4 border-t border-charcoal-cardBorder flex items-center justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveScore}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Evaluation..." : "Save Final Evaluation"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-charcoal-card border border-charcoal-cardBorder">
              <Trophy className="w-10 h-10 text-ivory-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-ivory-100">Select a project to evaluate</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
