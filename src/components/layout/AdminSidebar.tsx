"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  CheckSquare,
  Users,
  Calendar,
  Grid,
  Flag,
  Globe,
  LogOut,
  Sparkles,
} from "lucide-react";
import NimbluxLogo, { NimbluxIcon } from "@/components/common/NimbluxLogo";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Fetch pending count for badge
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setPendingCount(data.stats.pendingOpportunities || 0);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Moderation Queue",
      href: "/admin/opportunities",
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: "bg-amber-500 text-slate-950 font-bold",
    },
    {
      label: "Users & Roles",
      href: "/admin/users",
      icon: Users,
      badge: null,
    },
    {
      label: "Events Manager",
      href: "/admin/events",
      icon: Calendar,
      badge: null,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: Grid,
      badge: null,
    },
    {
      label: "User Reports",
      href: "/admin/reports",
      icon: Flag,
      badge: null,
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between min-h-screen p-4">
      <div>
        {/* Admin Header */}
        <div className="px-3 py-4 mb-6 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <NimbluxLogo size="sm" href="/admin" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ADMIN
            </span>
          </div>
          <p className="text-[11px] text-slate-400 pl-1">Production Moderation Console</p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon
                    className={`w-4 h-4 ${
                      isActive ? "text-amber-400" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.badgeColor || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>Public Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
