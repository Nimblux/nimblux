"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Shield, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push(`/login?redirect=${pathname}`);
        } else if (data.user.role !== "ADMIN") {
          setAuthorized(false);
          setLoading(false);
        } else {
          setAdminUser(data.user);
          setAuthorized(true);
          setLoading(false);
        }
      })
      .catch(() => {
        router.push(`/login?redirect=${pathname}`);
      });
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ivory-500 font-mono">Verifying administrator permissions...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 rounded-3xl bg-charcoal-card p-8 border border-rose-500/30 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-ivory-100">Administrator Access Required</h2>
          <p className="text-xs text-ivory-500 leading-relaxed">
            You do not have administrative privileges to view the NIMBLUX Moderation Suite. Please log in with an administrator account (e.g. <span className="text-bronze-300 font-mono">admin@nimblux.com</span>).
          </p>
          <div className="pt-3 flex items-center justify-center space-x-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-850 text-xs font-semibold text-ivory-300 border border-charcoal-cardBorder transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/login?redirect=/admin"
              className="px-4 py-2 rounded-xl bg-bronze-500 hover:bg-bronze-400 text-xs font-bold text-charcoal-950 transition-colors shadow-button"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-950 text-ivory-100 flex flex-col md:flex-row">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar />

      {/* Main Admin Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Mini Header */}
        <header className="h-16 border-b border-charcoal-cardBorder bg-charcoal-950/90 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-forest-400" />
            <span className="text-[11px] font-mono font-semibold text-ivory-400 uppercase tracking-wider">
              Live Moderation Console
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-ivory-100">{adminUser?.name}</div>
              <div className="text-[10px] text-ivory-500 font-mono">{adminUser?.email}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-bronze-500 text-charcoal-950 flex items-center justify-center font-extrabold text-xs font-mono">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Admin Pages */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
