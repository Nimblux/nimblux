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
    { label: "My Submissions", href: "/dashboard/submissions", icon: Briefcase },
    { label: "Saved Opportunities", href: "/dashboard/saved", icon: Bookmark },
    { label: "Edit Profile", href: "/dashboard/profile", icon: User },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* User Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-brand-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-white text-lg overflow-hidden">
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
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white">
                {user?.name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                STUDENT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.college || user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/submit-opportunity"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-md shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Opportunity</span>
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Suite</span>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 border-b border-slate-800/80 scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/80"
              }`}
            >
              <item.icon className="w-4 h-4" />
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
