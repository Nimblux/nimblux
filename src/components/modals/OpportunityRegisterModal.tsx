"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Send,
  Ticket,
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
    mode?: string;
    location?: string;
    price?: string | null;
    registrationFee?: string | null;
    customQuestions?: string | null;
  };
  onSuccess?: () => void;
}

export default function OpportunityRegisterModal({
  isOpen,
  onClose,
  opportunity,
  onSuccess,
}: OpportunityRegisterModalProps) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
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
          });
        }
      })
      .catch(() => {});
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
        if (q.required && (!customAnswers[q.id] || customAnswers[q.id].toString().trim() === "")) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-charcoal-card border border-charcoal-cardBorder p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-ivory-500 hover:text-ivory-100 hover:bg-charcoal-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 pr-6">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-forest-500/10 text-forest-300 border border-forest-500/20 text-[10.5px] font-mono font-bold uppercase">
            <Ticket className="w-3 h-3" />
            <span>Instant Registration</span>
          </div>
          <h2 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100 leading-snug">
            Register for {opportunity.title}
          </h2>
          <div className="text-xs text-ivory-400">
            Hosted by <strong className="text-ivory-200">{opportunity.organization}</strong> • {opportunity.location || "Online"}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-8 space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-forest-500/20 text-forest-300 flex items-center justify-center mx-auto border border-forest-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif-heading font-medium text-2xl text-ivory-100">
              You are Registered! 🎟️
            </h3>
            <p className="text-xs text-ivory-400 max-w-sm mx-auto leading-relaxed">
              Your registration is confirmed. You can access the event details, meeting schedule, and materials from your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  Phone (Optional)
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
                  College / Org (Optional)
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="University / Organization"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                />
              </div>
            </div>

            {/* Custom Questions if any */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-charcoal-cardBorder">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Registration Details
                </div>
                {parsedQuestions.map((q) => (
                  <div key={q.id} className="space-y-1">
                    <label className="font-semibold text-ivory-300 block font-mono">
                      {q.label} {q.required && <span className="text-rose-400">*</span>}
                    </label>
                    <input
                      type="text"
                      required={q.required}
                      value={customAnswers[q.id] || ""}
                      onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                      placeholder={q.placeholder || "Your answer..."}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-ivory-100 focus:outline-none focus:border-bronze-500/50"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-charcoal-cardBorder flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ivory-500 hover:text-ivory-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button disabled:opacity-50 transition-all"
              >
                <span>{loading ? "Confirming..." : "Confirm Registration"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
