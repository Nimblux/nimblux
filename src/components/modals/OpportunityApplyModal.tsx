"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  GraduationCap,
  Globe,
  Github,
  Linkedin,
  Paperclip,
  ArrowRight,
  ShieldCheck,
  Lock,
  Clock,
  Check,
} from "lucide-react";
import { getApplicationStageBadge, formatDate } from "@/lib/utils";

interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "url";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface OpportunityApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    id: string;
    title: string;
    organization: string;
    logo?: string | null;
    opportunityType?: string;
    customQuestions?: string | null;
  };
  onSuccess?: () => void;
  onRequestAuth?: () => void;
}

export default function OpportunityApplyModal({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
  onRequestAuth,
}: OpportunityApplyModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
    degree: "",
    graduationYear: "2026",
    resumeUrl: "",
    portfolioUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    skills: "",
    coverLetter: "",
  });

  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [parsedQuestions, setParsedQuestions] = useState<CustomQuestion[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    setError("");
    setSuccess(false);

    // Parse custom questions
    if (opportunity.customQuestions) {
      try {
        const parsed =
          typeof opportunity.customQuestions === "string"
            ? JSON.parse(opportunity.customQuestions)
            : opportunity.customQuestions;
        if (Array.isArray(parsed)) {
          setParsedQuestions(parsed);
        }
      } catch {
        setParsedQuestions([]);
      }
    } else {
      setParsedQuestions([]);
    }

    // Check auth, existing application, and prefill profile
    setFetchingUser(true);
    Promise.all([
      fetch("/api/users/profile").then((r) => r.json()).catch(() => ({})),
      fetch(`/api/opportunities/${opportunity.id}/apply`).then((r) => r.json()).catch(() => ({})),
    ])
      .then(([profileData, appData]) => {
        if (profileData.user) {
          const u = profileData.user;
          setUser(u);
          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            college: u.college || "",
            degree: u.degree || "",
            graduationYear: u.graduationYear || "2026",
            resumeUrl: u.resumeUrl || "",
            portfolioUrl: u.portfolioUrl || "",
            githubUrl: u.githubUrl || "",
            linkedinUrl: u.linkedinUrl || "",
            skills: u.skills || "",
            coverLetter: "",
          });
        } else {
          setUser(null);
        }

        if (appData.application) {
          setExistingApp(appData.application);
        } else {
          setExistingApp(null);
        }
      })
      .finally(() => setFetchingUser(false));
  }, [isOpen, opportunity]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required custom questions
      for (const q of parsedQuestions) {
        if (
          q.required &&
          (!customAnswers[q.id] || customAnswers[q.id].toString().trim() === "")
        ) {
          throw new Error(`Please answer required question: "${q.label}"`);
        }
      }

      const answersArray = parsedQuestions.map((q) => ({
        questionId: q.id,
        question: q.label,
        answer: customAnswers[q.id] || "",
      }));

      const res = await fetch(`/api/opportunities/${opportunity.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          answers: answersArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application.");
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B0B]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[18px] bg-[#111615] border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-[8px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3.5 pr-8">
          <div className="w-12 h-12 rounded-[10px] bg-[#0E1110] border border-white/[0.08] p-1 flex items-center justify-center flex-shrink-0">
            {opportunity.logo ? (
              <img
                src={opportunity.logo}
                alt={opportunity.organization}
                className="w-full h-full object-cover rounded-[7px]"
              />
            ) : (
              <div className="w-full h-full rounded-[7px] bg-[#151A18] flex items-center justify-center font-bold text-[#D8B77A] text-sm font-mono">
                {opportunity.organization.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#D8B77A] uppercase tracking-wider font-semibold">
              In-Platform Application
            </div>
            <h2 className="text-xl sm:text-2xl font-[700] text-[#F5F1E8] leading-snug tracking-tight">
              Apply to {opportunity.title}
            </h2>
            <div className="text-xs text-[#A9AAA5] mt-0.5">
              {opportunity.organization} • Direct recruiter pipeline
            </div>
          </div>
        </div>

        {fetchingUser ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
            <p className="text-xs text-[#A9AAA5] font-mono">Loading profile & eligibility...</p>
          </div>
        ) : !user ? (
          /* Logged out state */
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#D8B77A]/10 text-[#D8B77A] flex items-center justify-center mx-auto border border-[#D8B77A]/20">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#F5F1E8]">
                Please sign in to continue.
              </h3>
              <p className="text-xs text-[#A9AAA5] max-w-sm mx-auto leading-relaxed">
                You must have an active NIMBLUX account to apply for opportunities and track your candidate status.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onRequestAuth) onRequestAuth();
              }}
              className="px-6 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors shadow-sm"
            >
              Sign In or Create Account →
            </button>
          </div>
        ) : existingApp ? (
          /* DUPLICATE APPLICATION PROTECTION DISPLAY */
          <div className="py-6 space-y-5">
            <div className="p-5 rounded-[14px] bg-[#151A18] border border-white/[0.08] space-y-3">
              <div className="flex items-center space-x-2 text-[#D8B77A] text-xs font-mono font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>APPLICATION ALREADY SUBMITTED</span>
              </div>

              <h3 className="text-lg font-bold text-[#F5F1E8]">
                You've already applied to this opportunity.
              </h3>

              <p className="text-xs text-[#A9AAA5] leading-relaxed">
                Your application has been received and is being evaluated by the hiring team. You can monitor progress in real-time on your dashboard.
              </p>

              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#7E807B] block font-mono text-[10.5px]">Current Stage</span>
                  <span className="font-semibold text-[#F5F1E8] mt-0.5 inline-block">
                    {existingApp.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#7E807B] block font-mono text-[10.5px]">Submitted On</span>
                  <span className="font-mono text-[#D6D5CD] mt-0.5 inline-block">
                    {formatDate(existingApp.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Tracker */}
            <div className="p-4 rounded-[14px] bg-[#0E1110] border border-white/[0.06] space-y-2">
              <div className="text-[11px] font-mono text-[#7E807B] uppercase tracking-wider">
                Application Pipeline Stage
              </div>
              <div className="grid grid-cols-5 gap-1 pt-1">
                {["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED"].map((st, idx) => {
                  const stageIndexMap: Record<string, number> = {
                    SUBMITTED: 0,
                    UNDER_REVIEW: 1,
                    SHORTLISTED: 2,
                    INTERVIEW: 3,
                    SELECTED: 4,
                    REJECTED: -1,
                  };
                  const currentIdx = stageIndexMap[existingApp.status] ?? 0;
                  const isCurrent = existingApp.status === st;
                  const isPast = currentIdx >= idx;

                  return (
                    <div key={st} className="space-y-1 text-center">
                      <div
                        className={`h-1.5 rounded-full ${
                          isCurrent
                            ? "bg-[#D8B77A]"
                            : isPast
                            ? "bg-[#8FA58E]"
                            : "bg-white/[0.08]"
                        }`}
                      />
                      <span className={`text-[9px] font-mono uppercase truncate block ${
                        isCurrent ? "text-[#D8B77A] font-bold" : "text-[#7E807B]"
                      }`}>
                        {st.replace("_", " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-[9px] font-medium text-xs text-[#F5F1E8] bg-[#151A18] hover:bg-[#181F1C] border border-white/[0.08] transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        ) : success ? (
          /* Success State */
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#8FA58E]/15 text-[#8FA58E] flex items-center justify-center mx-auto border border-[#8FA58E]/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#F5F1E8]">
              Application Submitted Successfully!
            </h3>
            <p className="text-xs text-[#A9AAA5] max-w-md mx-auto">
              Your application was securely transmitted to {opportunity.organization}. You will be notified in-platform as your review progresses.
            </p>
          </div>
        ) : (
          /* Normal Application Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-[9px] bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Profile Prefill Notice */}
            <div className="p-3 rounded-[10px] bg-[#151A18] border border-white/[0.06] flex items-center justify-between text-xs text-[#A9AAA5]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#8FA58E]" />
                <span>Profile information prefilled from your NIMBLUX account.</span>
              </div>
            </div>

            {/* Section: Candidate Identity */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#D8B77A] font-semibold">
                1. Candidate Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                    College / University
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="e.g. BITS Pilani"
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                    Degree / Branch
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                    Graduation Year
                  </label>
                  <select
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 cursor-pointer"
                  >
                    <option value="2024" className="bg-[#111615]">2024</option>
                    <option value="2025" className="bg-[#111615]">2025</option>
                    <option value="2026" className="bg-[#111615]">2026</option>
                    <option value="2027" className="bg-[#111615]">2027</option>
                    <option value="2028" className="bg-[#111615]">2028+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Links & Resume */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#D8B77A] font-semibold">
                2. Links & Portfolio
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                    Resume Link (Google Drive / Notion / PDF URL) *
                  </label>
                  <div className="relative">
                    <Paperclip className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E807B]" />
                    <input
                      type="url"
                      name="resumeUrl"
                      required
                      value={formData.resumeUrl}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full pl-10 pr-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-[#7E807B] block mt-1 font-mono">
                    Ensure link sharing permissions are set to "Anyone with the link can view".
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                      Portfolio / Website
                    </label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      placeholder="https://yourportfolio.dev"
                      className="w-full px-3 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#A9AAA5] block mb-1 uppercase tracking-wider">
                    Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, TypeScript, Python, Tailwind, PostgreSQL"
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section: Custom Questions (if organizer configured them) */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#D8B77A] font-semibold">
                  3. Host Screening Questions
                </h4>
                <div className="space-y-3">
                  {parsedQuestions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <label className="text-xs font-medium text-[#F5F1E8] block">
                        {q.label} {q.required && <span className="text-[#D8B77A]">*</span>}
                      </label>
                      {q.type === "textarea" ? (
                        <textarea
                          rows={3}
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          placeholder={q.placeholder || "Enter your response..."}
                          className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                        />
                      ) : q.type === "select" && q.options ? (
                        <select
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A]/50 cursor-pointer"
                        >
                          <option value="" className="bg-[#111615]">Select an option...</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt} className="bg-[#111615]">
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={q.type === "url" ? "url" : "text"}
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          placeholder={q.placeholder || "Your answer..."}
                          className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section: Short Note / Cover letter */}
            <div className="space-y-1 pt-2">
              <label className="text-[11px] font-mono text-[#A9AAA5] block uppercase tracking-wider">
                Note to Recruiter / Cover Letter (Optional)
              </label>
              <textarea
                rows={3}
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                placeholder="Share relevant project highlights or what excites you about this role..."
                className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[9px] text-xs font-medium text-[#A9AAA5] hover:text-[#F5F1E8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#090B0B] border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
