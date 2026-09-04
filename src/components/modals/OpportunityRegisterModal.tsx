"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Ticket,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Lock,
  ArrowRight,
  ShieldCheck,
  Video,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "url";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface OpportunityRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    id: string;
    title: string;
    organization: string;
    logo?: string | null;
    startDate?: string | Date | null;
    deadline?: string | Date | null;
    location?: string;
    venue?: string | null;
    meetingUrl?: string | null;
    customQuestions?: string | null;
  };
  onSuccess?: () => void;
  onRequestAuth?: () => void;
}

export default function OpportunityRegisterModal({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
  onRequestAuth,
}: OpportunityRegisterModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [existingReg, setExistingReg] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
  });

  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [parsedQuestions, setParsedQuestions] = useState<CustomQuestion[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    setError("");
    setSuccess(false);

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

    setFetchingUser(true);
    Promise.all([
      fetch("/api/users/profile").then((r) => r.json()).catch(() => ({})),
      fetch(`/api/opportunities/${opportunity.id}/register`).then((r) => r.json()).catch(() => ({})),
    ])
      .then(([profileData, regData]) => {
        if (profileData.user) {
          const u = profileData.user;
          setUser(u);
          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            college: u.college || "",
          });
        } else {
          setUser(null);
        }

        if (regData.registration && regData.registration.status !== "CANCELLED") {
          setExistingReg(regData.registration);
        } else {
          setExistingReg(null);
        }
      })
      .finally(() => setFetchingUser(false));
  }, [isOpen, opportunity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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

      const res = await fetch(`/api/opportunities/${opportunity.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          answers: answersArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete registration.");
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B0B]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[18px] bg-[#111615] border border-white/[0.08] p-6 sm:p-8 shadow-2xl space-y-5">
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
              <div className="w-full h-full rounded-[7px] bg-[#8FA58E]/15 flex items-center justify-center font-bold text-[#8FA58E] text-sm font-mono">
                {opportunity.organization.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-[11px] font-mono text-[#8FA58E] uppercase tracking-wider font-semibold">
              Instant In-Platform Registration
            </div>
            <h2 className="text-xl sm:text-2xl font-[700] text-[#F5F1E8] leading-snug tracking-tight">
              Register for {opportunity.title}
            </h2>
            <div className="text-xs text-[#A9AAA5] mt-0.5">
              {opportunity.organization} • Free Attendee Pass
            </div>
          </div>
        </div>

        {fetchingUser ? (
          <div className="py-10 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#8FA58E] border-t-transparent animate-spin" />
            <p className="text-xs text-[#A9AAA5] font-mono">Loading attendee details...</p>
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
                You must have an active NIMBLUX account to register for workshops, events, and receive your attendee access pass.
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
        ) : existingReg ? (
          /* DUPLICATE REGISTRATION PROTECTION DISPLAY */
          <div className="py-6 space-y-4">
            <div className="p-5 rounded-[14px] bg-[#151A18] border border-white/[0.08] space-y-3">
              <div className="flex items-center space-x-2 text-[#8FA58E] text-xs font-mono font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRMED REGISTRATION</span>
              </div>

              <h3 className="text-lg font-bold text-[#F5F1E8]">
                You are already registered.
              </h3>

              <p className="text-xs text-[#A9AAA5] leading-relaxed">
                Your attendee pass is active. You can find event reminders, access links, and your ticket details on your dashboard.
              </p>

              <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#7E807B] font-mono text-[10.5px]">Attendance Status</span>
                  <span className="font-semibold text-[#8FA58E]">
                    {existingReg.attended ? "Checked In ✓" : "Registered"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7E807B] font-mono text-[10.5px]">Registration Date</span>
                  <span className="font-mono text-[#D6D5CD]">
                    {formatDate(existingReg.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {opportunity.meetingUrl && (
              <div className="p-3.5 rounded-[10px] bg-[#0E1110] border border-white/[0.06] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-[#F5F1E8]">
                  <Video className="w-4 h-4 text-[#8FA58E]" />
                  <span>Online Meeting Link:</span>
                </div>
                <a
                  href={opportunity.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D8B77A] hover:underline font-mono text-[11px]"
                >
                  Join Meeting →
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-[9px] font-medium text-xs text-[#F5F1E8] bg-[#151A18] hover:bg-[#181F1C] border border-white/[0.08] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#8FA58E]/15 text-[#8FA58E] flex items-center justify-center mx-auto border border-[#8FA58E]/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#F5F1E8]">
              You're Registered! 🎟️
            </h3>
            <p className="text-xs text-[#A9AAA5] max-w-sm mx-auto">
              Your pass has been generated. You can view joining details in your registrations dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[9px] bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Profile Notice */}
            <div className="p-3 rounded-[10px] bg-[#151A18] border border-white/[0.06] flex items-center space-x-2 text-xs text-[#A9AAA5]">
              <ShieldCheck className="w-4 h-4 text-[#8FA58E] flex-shrink-0" />
              <span>Attendee details prefilled from your account.</span>
            </div>

            <div className="space-y-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    College / Organization
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
              </div>
            </div>

            {/* Custom Screening Questions if any */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#D8B77A] font-semibold">
                  Host Questions
                </h4>
                <div className="space-y-3">
                  {parsedQuestions.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <label className="text-xs font-medium text-[#F5F1E8] block">
                        {q.label} {q.required && <span className="text-[#D8B77A]">*</span>}
                      </label>
                      <input
                        type="text"
                        required={q.required}
                        value={customAnswers[q.id] || ""}
                        onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                        placeholder={q.placeholder || "Your answer..."}
                        className="w-full px-3.5 py-2 rounded-[10px] bg-[#090B0B] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Confirm Free Registration</span>
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
