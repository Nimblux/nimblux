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
} from "lucide-react";

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
}

export default function OpportunityApplyModal({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
}: OpportunityApplyModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [user, setUser] = useState<any>(null);
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
        const parsed = typeof opportunity.customQuestions === "string"
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

    // Fetch user profile for prefill
    setFetchingUser(true);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            college: data.user.college || "",
            degree: data.user.degree || "",
            graduationYear: data.user.graduationYear || "2026",
            resumeUrl: "",
            portfolioUrl: data.user.portfolioUrl || "",
            githubUrl: data.user.githubUrl || "",
            linkedinUrl: data.user.linkedinUrl || "",
            skills: data.user.skills || "",
            coverLetter: "",
          });
        }
      })
      .catch(() => {})
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
        if (q.required && (!customAnswers[q.id] || customAnswers[q.id].toString().trim() === "")) {
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
      }, 2500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-ivory-500 hover:text-ivory-100 hover:bg-charcoal-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3.5 pr-8">
          <div className="w-12 h-12 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder p-1 flex items-center justify-center flex-shrink-0">
            {opportunity.logo ? (
              <img
                src={opportunity.logo}
                alt={opportunity.organization}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-bronze-500/15 flex items-center justify-center font-bold text-bronze-300 text-sm font-mono">
                {opportunity.organization.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-[11px] font-mono text-bronze-400 uppercase tracking-wider font-semibold">
              In-Platform Application
            </div>
            <h2 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100 leading-snug">
              Apply to {opportunity.title}
            </h2>
            <div className="text-xs text-ivory-400 mt-0.5">
              {opportunity.organization} • Direct recruiter review
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-10 space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-forest-500/20 text-forest-300 flex items-center justify-center mx-auto border border-forest-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif-heading font-medium text-2xl text-ivory-100">
              Application Submitted!
            </h3>
            <p className="text-xs text-ivory-400 max-w-md mx-auto leading-relaxed">
              Your application has been delivered to the hiring team at {opportunity.organization}. You can track the evaluation progress from your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Step 1: Candidate Profile Info */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ivory-500 font-bold flex items-center space-x-1.5 pb-1 border-b border-charcoal-cardBorder">
                <ShieldCheck className="w-3.5 h-3.5 text-bronze-400" />
                <span>1. Personal & Educational Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    College / University
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Stanford, IIT, MIT..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Degree & Major
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="B.S. Computer Science / AI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Graduation Year
                  </label>
                  <select
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Links, Resume & Skills */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-ivory-500 font-bold flex items-center space-x-1.5 pb-1 border-b border-charcoal-cardBorder">
                <Paperclip className="w-3.5 h-3.5 text-bronze-400" />
                <span>2. Resume, Portfolio & Profiles</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Resume / CV Link (Google Drive / Dropbox / PDF URL) *
                  </label>
                  <input
                    type="url"
                    name="resumeUrl"
                    required
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Portfolio / Personal Website URL
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    placeholder="https://myportfolio.dev"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-ivory-300 block mb-1 font-mono">
                    Relevant Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. React, Next.js, Python, TypeScript, PostgreSQL"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Custom Screening Questions (if organizer added any) */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center space-x-1.5 pb-1 border-b border-charcoal-cardBorder">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3. Organizer Screening Questions</span>
                </div>

                <div className="space-y-3">
                  {parsedQuestions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <label className="font-semibold text-ivory-300 block font-mono">
                        {q.label} {q.required && <span className="text-rose-400">*</span>}
                      </label>

                      {q.type === "textarea" ? (
                        <textarea
                          rows={3}
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          placeholder={q.placeholder || "Enter your response..."}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
                        />
                      ) : q.type === "select" && q.options ? (
                        <select
                          required={q.required}
                          value={customAnswers[q.id] || ""}
                          onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 cursor-pointer"
                        >
                          <option value="">Select option...</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt}>
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Cover Letter / Why You */}
            <div className="space-y-2">
              <label className="font-semibold text-ivory-300 block font-mono">
                Cover Note / Why are you a great fit? (Optional)
              </label>
              <textarea
                rows={3}
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                placeholder="Briefly highlight your past projects, interests, and motivation..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50 resize-y"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-charcoal-cardBorder flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-ivory-500 hover:text-ivory-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-7 py-3 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? "Submitting Application..." : "Submit Application"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
