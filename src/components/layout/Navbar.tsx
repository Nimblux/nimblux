"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Briefcase,
  Code,
  Building2,
  Calendar,
  GraduationCap,
  PlusCircle,
  Bell,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Trophy,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import NimbluxLogo from "@/components/common/NimbluxLogo";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  profileImage?: string | null;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch current session
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user) {
          fetchNotifications();
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setUserMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id: string, link?: string | null) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) {
        setNotificationsOpen(false);
        router.push(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const mainNavItems = [
    { label: "Explore", href: "/opportunities", icon: Compass },
    { label: "Internships", href: "/internships", icon: Briefcase },
    { label: "Hackathons", href: "/hackathons", icon: Code },
    { label: "Jobs", href: "/jobs", icon: Building2 },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Scholarships", href: "/scholarships", icon: GraduationCap },
  ];

  const moreNavCategories = CATEGORIES.filter(
    (c) =>
      !["internships", "hackathons", "jobs", "events", "scholarships"].includes(
        c.slug
      )
  );

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <NimbluxLogo size="md" showTagline={true} href="/" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-1.5 ${
                      isActive
                        ? "text-white bg-slate-800/80 shadow-sm border border-slate-700/50"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-1 ${
                    moreDropdownOpen
                      ? "text-white bg-slate-800"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      moreDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl glass-dropdown p-2 z-50 animate-fade-in">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                      Specialized Categories
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {moreNavCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/${cat.slug}`}
                          onClick={() => setMoreDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors group"
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
                            <span>{cat.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 group-hover:text-indigo-400">
                            Explore →
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Post Opportunity Button */}
            <Link
              href="/submit-opportunity"
              className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-brand-500 hover:from-indigo-500 hover:to-brand-400 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 border border-indigo-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Opportunity</span>
            </Link>

            {/* Auth / Profile Area */}
            {loading ? (
              <div className="w-9 h-9 rounded-xl bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Admin Quick Link */}
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Suite</span>
                  </Link>
                )}

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown p-3 z-50 animate-fade-in">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-white">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <Link
                          href="/dashboard/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          View all
                        </Link>
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() =>
                                handleMarkAsRead(notif.id, notif.link)
                              }
                              className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                                notif.isRead
                                  ? "bg-slate-900/50 text-slate-400 hover:bg-slate-800/50"
                                  : "bg-indigo-950/40 text-slate-200 border border-indigo-500/20 hover:bg-indigo-900/40"
                              }`}
                            >
                              <div className="font-semibold text-slate-100 flex items-center justify-between">
                                <span>{notif.title}</span>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                                )}
                              </div>
                              <p className="mt-1 line-clamp-2 text-slate-300">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-slate-800 hover:border-slate-700"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown p-2 z-50 animate-fade-in">
                      <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                        <div className="font-semibold text-sm text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {user.email}
                        </div>
                        <div className="mt-1.5 flex items-center space-x-1.5">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              user.role === "ADMIN"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-amber-300 hover:bg-amber-500/10 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-indigo-400" />
                          <span>Student Dashboard</span>
                        </Link>
                        <Link
                          href="/dashboard/submissions"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-cyan-400" />
                          <span>My Submissions</span>
                        </Link>
                        <Link
                          href="/dashboard/saved"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-amber-400" />
                          <span>Saved Opportunities</span>
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                        >
                          <User className="w-4 h-4 text-emerald-400" />
                          <span>Edit Profile</span>
                        </Link>
                      </div>

                      <div className="border-t border-slate-800 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 shadow-sm transition-all"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 p-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 bg-slate-900/50"
              >
                <item.icon className="w-4 h-4 text-indigo-400" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/submit-opportunity"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post an Opportunity</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              All Categories
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-slate-400 hover:text-indigo-300 py-1.5 px-2 rounded-lg hover:bg-slate-900 truncate"
                >
                  • {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
