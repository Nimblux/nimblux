"use client";

import React, { useState } from "react";
import { AlertTriangle, X, Send } from "lucide-react";

interface RejectReasonModalProps {
  isOpen: boolean;
  opportunityTitle: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

const TEMPLATES = [
  "Application link is broken or redirects to an invalid page.",
  "Listing does not meet NIMBLUX quality standards (missing description, eligibility or dates).",
  "Policy violation: Unverified paid training, MLM schemes, or paid application fees are prohibited.",
  "Duplicate opportunity listing already exists on NIMBLUX.",
  "Opportunity deadline has already passed.",
];

export default function RejectReasonModal({
  isOpen,
  opportunityTitle,
  onClose,
  onSubmit,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onSubmit(reason.trim());
      setReason("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-charcoal-card border border-rose-500/30 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ivory-500 hover:text-ivory-100 rounded-xl hover:bg-charcoal-900 transition-colors"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ivory-100">Reject Opportunity</h3>
            <p className="text-xs text-ivory-500">
              Provide actionable revision guidance for the submitter
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-300 mb-4 line-clamp-1">
          <span className="text-ivory-500 font-mono">Opportunity:</span> {opportunityTitle}
        </div>

        {/* Quick Templates */}
        <div className="mb-4">
          <label className="text-[10.5px] font-mono font-semibold uppercase tracking-wider text-ivory-500 block mb-2">
            Quick Feedback Templates:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReason(t)}
                className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-charcoal-900 hover:bg-charcoal-850 text-ivory-400 hover:text-ivory-200 border border-charcoal-cardBorder transition-colors"
              >
                {t.slice(0, 36)}...
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ivory-300 block mb-1.5">
              Rejection Reason & Revision Guidance *
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain clearly why this submission was rejected and what changes are needed..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-ivory-400 hover:text-ivory-100 bg-charcoal-900 border border-charcoal-cardBorder hover:bg-charcoal-850 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? "Rejecting..." : "Confirm Rejection"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
