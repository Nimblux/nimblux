"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Briefcase,
  Bookmark,
  User,
  Bell,
  PlusCircle,
  Shield,
  LogOut,
  Trophy,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login?redirect=" + pathname);
        } else {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push("/login?redirect=" + pathname);
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: Compass },
    { label: "My Applications", href: "/dashboard/applications", icon: Send },
    { label: "My Registrations", href: "/dashboard/registrations", icon: Ticket },
    { label: "My Hackathons", href: "/dashboard/hackathons", icon: Trophy },
    { label: "My Certificates", href: "/dashboard/certificates", icon: Award },
    { label: "My Postings", href: "/dashboard/submissions", icon: Briefcase },
    { label: "Saved Opportunities", href: "/dashboard/saved", icon: Bookmark },
    { label: "Edit Profile", href: "/dashboard/profile", icon: User },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* User Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-charcoal-cardBorder gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-charcoal-card border border-charcoal-cardBorder p-1 shadow-card flex-shrink-0">
            <div className="w-full h-full bg-charcoal-900 rounded-[14px] flex items-center justify-center font-bold text-bronze-300 text-lg font-mono overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif-heading font-medium text-xl sm:text-2xl text-ivory-100">
                {user?.name}
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-bronze-500/10 text-bronze-300 border border-bronze-500/20 uppercase">
                STUDENT
              </span>
            </div>
            <p className="text-xs text-ivory-500 mt-0.5 font-mono">
              {user?.college || user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/submit-opportunity"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Opportunity</span>
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors font-mono"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Suite</span>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 border-b border-charcoal-cardBorder scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-bronze-500 text-charcoal-950 font-bold shadow-button"
                  : "bg-charcoal-card text-ivory-300 hover:text-ivory-100 hover:bg-charcoal-850 border border-charcoal-cardBorder"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div>{children}</div>
    </div>
  );
}
