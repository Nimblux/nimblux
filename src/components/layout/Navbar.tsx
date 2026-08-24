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
  ArrowRight,
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const moreRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Scroll detection for navbar background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

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
    { label: "Explore", href: "/opportunities" },
    { label: "Internships", href: "/internships" },
    { label: "Hackathons", href: "/hackathons" },
    { label: "Jobs", href: "/jobs" },
    { label: "Events", href: "/events" },
    { label: "Scholarships", href: "/scholarships" },
  ];

  const moreNavCategories = CATEGORIES.filter(
    (c) =>
      !["internships", "hackathons", "jobs", "events", "scholarships"].includes(
        c.slug
      )
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-charcoal-950/90 backdrop-blur-md border-b border-charcoal-cardBorder shadow-editorial"
          : "bg-charcoal-950/60 backdrop-blur-sm border-b border-white/[0.05]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <NimbluxLogo size="md" showTagline={false} href="/" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                      isActive
                        ? "text-ivory-100 bg-white/[0.07] shadow-sm font-semibold"
                        : "text-ivory-400 hover:text-ivory-100 hover:bg-white/[0.04]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-colors ${
                    moreDropdownOpen
                      ? "text-ivory-100 bg-white/[0.07]"
                      : "text-ivory-400 hover:text-ivory-100 hover:bg-white/[0.04]"
                  }`}
                  aria-expanded={moreDropdownOpen}
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      moreDropdownOpen ? "rotate-180 text-bronze-400" : "text-ivory-500"
                    }`}
                  />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl editorial-dropdown p-2.5 animate-fade-in shadow-2xl z-50">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-ivory-500 px-3 py-1.5 font-semibold">
                      Specialized Categories
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {moreNavCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/${cat.slug}`}
                          onClick={() => setMoreDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-ivory-300 hover:text-ivory-100 hover:bg-white/[0.06] transition-colors"
                        >
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-[10px] font-mono text-ivory-500">
                            /{cat.slug}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Post Opportunity Button (Prominent Editorial CTA) */}
            <Link
              href="/submit-opportunity"
              className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all duration-200"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Post Opportunity</span>
            </Link>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-charcoal-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-xl text-ivory-400 hover:text-ivory-100 hover:bg-white/[0.05] transition-colors"
                    aria-label="View notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-bronze-400" />
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl editorial-dropdown p-3 shadow-2xl animate-fade-in z-50">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-charcoal-cardBorder px-2">
                        <span className="font-semibold text-xs text-ivory-100">Notifications</span>
                        <span className="text-[10px] text-ivory-500 font-mono">
                          {unreadCount} unread
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-ivory-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleMarkAsRead(notif.id, notif.link)}
                              className={`p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                                notif.isRead
                                  ? "bg-transparent text-ivory-400 hover:bg-white/[0.04]"
                                  : "bg-bronze-500/10 text-ivory-200 border border-bronze-500/20 hover:bg-bronze-500/15"
                              }`}
                            >
                              <div className="font-semibold text-ivory-100">{notif.title}</div>
                              <div className="text-[11px] text-ivory-400 mt-0.5 line-clamp-2">
                                {notif.message}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-2 mt-2 border-t border-charcoal-cardBorder text-center">
                        <Link
                          href="/dashboard/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-[11px] font-medium text-bronze-400 hover:text-bronze-300"
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl border border-charcoal-cardBorder bg-charcoal-card hover:border-bronze-500/40 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-bronze-500/20 text-bronze-300 font-bold text-xs flex items-center justify-center font-mono">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="text-xs font-semibold text-ivory-200 hidden md:inline-block max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-ivory-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl editorial-dropdown p-2 shadow-2xl animate-fade-in z-50">
                      <div className="px-3 py-2 border-b border-charcoal-cardBorder mb-1">
                        <div className="font-semibold text-xs text-ivory-100 truncate">
                          {user.name}
                        </div>
                        <div className="text-[10px] text-ivory-500 truncate font-mono">
                          {user.email}
                        </div>
                        {user.role === "ADMIN" && (
                          <div className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                            ADMIN ACCESS
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-ivory-300 hover:text-ivory-100 hover:bg-white/[0.06] transition-colors"
                        >
                          <Compass className="w-3.5 h-3.5 text-ivory-400" />
                          <span>Student Dashboard</span>
                        </Link>
                        <Link
                          href="/dashboard/submissions"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-ivory-300 hover:text-ivory-100 hover:bg-white/[0.06] transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-ivory-400" />
                          <span>My Submissions</span>
                        </Link>
                        <Link
                          href="/dashboard/saved"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-ivory-300 hover:text-ivory-100 hover:bg-white/[0.06] transition-colors"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-ivory-400" />
                          <span>Saved Bookmarks</span>
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-ivory-300 hover:text-ivory-100 hover:bg-white/[0.06] transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-ivory-400" />
                          <span>Edit Profile</span>
                        </Link>

                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-amber-300 hover:bg-amber-500/10 transition-colors font-medium"
                          >
                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                            <span>Moderation Suite</span>
                          </Link>
                        )}

                        <div className="pt-1 mt-1 border-t border-charcoal-cardBorder">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-ivory-300 hover:text-ivory-100 hover:bg-white/[0.04] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-ivory-100 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.1] transition-all"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-ivory-400 hover:text-ivory-100 hover:bg-white/[0.05]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-charcoal-cardBorder bg-charcoal-950/95 backdrop-blur-xl px-5 py-6 space-y-4 animate-fade-in shadow-2xl">
          <div className="grid grid-cols-2 gap-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-medium text-ivory-300 bg-charcoal-card border border-charcoal-cardBorder hover:text-ivory-100 hover:border-bronze-500/30 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-charcoal-cardBorder">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ivory-500 mb-2 font-semibold">
              More Categories
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {moreNavCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] text-ivory-400 hover:text-ivory-100 hover:bg-white/[0.04]"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/submit-opportunity"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post an Opportunity</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
