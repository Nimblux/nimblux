"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, Sparkles, ArrowRight, ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (!data.user) {
          router.push(`/login?redirect=${pathname}`);
        } else {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push(`/login?redirect=${pathname}`);
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#D8B77A] border-t-transparent animate-spin" />
        <p className="text-xs text-[#A9AAA5] font-mono">Loading Organizer Workspace...</p>
      </div>
    );
  }

  // If user is authenticated but has not activated Organizer Workspace
  if (user && !user.isOrganizer && user.role !== "ADMIN") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-6 rounded-[20px] bg-[#111615] p-8 sm:p-10 border border-white/[0.08] shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-[#D8B77A]/15 border border-[#D8B77A]/30 text-[#D8B77A] flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[10.5px] font-mono font-medium text-[#D8B77A] bg-[#D8B77A]/10 border border-[#D8B77A]/25">
              NIMBLUX ORGANIZER
            </span>
            <h2 className="text-2xl font-bold text-[#F5F1E8] tracking-tight">
              Activate Organizer Workspace
            </h2>
            <p className="text-xs text-[#A9AAA5] leading-relaxed max-w-sm mx-auto">
              Your account is currently configured for the Talent experience. Complete your organization profile to post opportunities, review applicants, and host hackathons.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/become-organizer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-[9px] font-semibold text-xs text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Activate Organizer Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-[9px] font-medium text-xs text-[#A9AAA5] hover:text-[#F5F1E8] bg-[#151A18] border border-white/[0.08] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Talent</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
