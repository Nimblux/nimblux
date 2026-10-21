"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCw, ShieldCheck, Mail, AlertCircle } from "lucide-react";

interface OtpVerificationCardProps {
  email: string;
  name?: string;
  initialCooldown?: number;
  onSuccess: (user: any) => void;
  onEditEmail: () => void;
  submitButtonText?: string;
  title?: string;
  subtitle?: string;
}

export default function OtpVerificationCard({
  email,
  name,
  initialCooldown = 60,
  onSuccess,
  onEditEmail,
  submitButtonText = "Verify & Complete",
  title = "Verify Your Email",
  subtitle = "We sent a 6-digit verification code to",
}: OtpVerificationCardProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState<number>(initialCooldown);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // 60-second countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Single digit input
    const char = cleaned.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError("");

    // Advance focus to next input
    if (index < 5 && char) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
      } else {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasteData[i] || "";
    }
    setDigits(next);
    setError("");

    // Focus last filled input or verify if 6 digits
    const lastFilledIndex = Math.min(pasteData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pasteData.length === 6) {
      submitVerification(pasteData);
    }
  };

  const submitVerification = async (otpCode?: string) => {
    const code = otpCode || digits.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts);
        }
        throw new Error(data.error || "Verification failed. Please try again.");
      }

      setSuccessMessage("Email successfully verified! Redirecting...");
      setTimeout(() => {
        onSuccess(data.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/verify-email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code. Please try again.");
      }

      setSuccessMessage("A fresh 6-digit code has been sent to your email.");
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      setRemainingAttempts(null);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  const isComplete = digits.every((d) => d.length === 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] bg-[#D8B77A]/10 text-[#D8B77A] text-[10.5px] font-mono mb-2">
          <Mail className="w-3 h-3" />
          <span>Email Verification</span>
        </div>
        <h3 className="font-bold text-xl text-[#F5F1E8] tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-[#A9AAA5] mt-1.5 leading-relaxed">
          {subtitle}{" "}
          <span className="text-[#F5F1E8] font-semibold font-mono underline decoration-[#D8B77A]/40">
            {email}
          </span>
          .
        </p>
      </div>

      {/* Status Alerts */}
      {error && (
        <div className="p-3.5 rounded-[10px] bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            {error}
            {remainingAttempts !== null && remainingAttempts > 0 && (
              <span className="block mt-1 font-mono text-[11px] text-rose-200">
                ⚠️ You have {remainingAttempts} incorrect attempt{remainingAttempts === 1 ? "" : "s"} left before this code expires.
              </span>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-[10px] bg-[#8FA58E]/10 border border-[#8FA58E]/30 text-[#8FA58E] text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#8FA58E]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 6 Digit Input Boxes */}
      <div className="py-2">
        <label className="text-[11px] font-mono uppercase tracking-wider text-[#A9AAA5] block mb-2.5">
          Enter 6-Digit Code
        </label>
        <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-full h-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-[10px] bg-[#090B0B] border border-white/[0.12] text-[#F5F1E8] focus:outline-none focus:border-[#D8B77A] focus:ring-1 focus:ring-[#D8B77A] transition-all shadow-inner"
              autoComplete="one-time-code"
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2.5 text-[11px] text-[#7E807B]">
          <span>Code expires in 10 minutes</span>
          <span>Max 5 attempts</span>
        </div>
      </div>

      {/* Verify Submit Button */}
      <button
        type="button"
        disabled={!isComplete || loading}
        onClick={() => submitVerification()}
        className="w-full flex items-center justify-center space-x-2 py-3 rounded-[10px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span>{loading ? "Verifying..." : submitButtonText}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Resend & Edit Options */}
      <div className="pt-4 border-t border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A9AAA5]">Didn't receive the code?</span>
          {cooldown > 0 ? (
            <span className="font-mono text-xs text-[#7E807B]">
              Resend in <span className="text-[#D8B77A]">{cooldown}s</span>
            </span>
          ) : (
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="inline-flex items-center space-x-1.5 text-xs text-[#D8B77A] hover:text-[#E7D5B2] font-semibold font-mono disabled:opacity-50 transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              <span>{resending ? "Sending..." : "Resend Code"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onEditEmail}
            className="inline-flex items-center space-x-1.5 text-[11px] text-[#7E807B] hover:text-[#F5F1E8] font-mono transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wrong email? Correct email address</span>
          </button>
        </div>
      </div>
    </div>
  );
}
