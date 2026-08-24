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
import NimbluxLogo from "@/components/common/NimbluxLogo";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
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
      badgeColor: "bg-bronze-500 text-charcoal-950 font-bold",
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
    <aside className="w-64 bg-charcoal-950 border-r border-charcoal-cardBorder flex flex-col justify-between min-h-screen p-4">
      <div>
        {/* Admin Header */}
        <div className="px-3 py-4 mb-6 border-b border-charcoal-cardBorder space-y-2">
          <div className="flex items-center justify-between">
            <NimbluxLogo size="sm" href="/admin" />
            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-bronze-500/15 text-bronze-300 border border-bronze-500/25">
              CONSOLE
            </span>
          </div>
          <p className="text-[10.5px] text-ivory-500 pl-0.5 font-mono">Platform Moderation Suite</p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-bronze-500/15 text-bronze-300 border border-bronze-500/30 font-semibold"
                    : "text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-900"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <item.icon
                    className={`w-4 h-4 ${
                      isActive ? "text-bronze-400" : "text-ivory-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      item.badgeColor || "bg-charcoal-800 text-ivory-300"
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
      <div className="pt-4 border-t border-charcoal-cardBorder space-y-1.5">
        <Link
          href="/"
          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-900 transition-colors"
        >
          <Globe className="w-4 h-4 text-forest-400" />
          <span>Public Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
