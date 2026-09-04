"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  Plus,
  ChevronDown,
  Menu,
  X,
  Compass,
  Briefcase,
  Code,
  Building2,
  Calendar,
  GraduationCap,
  Sparkles,
  Trophy,
  BookOpen,
  Bookmark,
  LogOut,
  Shield,
  Layers,
  Award,
  Send,
  Ticket,
} from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "ORGANIZER";
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
      if (window.scrollY > 15) {
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
    } catch {}
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch {}
  };

  const mainNavItems = [
    { label: "Explore", href: "/opportunities" },
    { label: "Internships", href: "/internships" },
    { label: "Hackathons", href: "/hackathons" },
    { label: "Jobs", href: "/jobs" },
    { label: "Events", href: "/events" },
    { label: "Scholarships", href: "/scholarships" },
  ];

  const moreNavItems = [
    { label: "Workshops", href: "/workshops", icon: Sparkles, desc: "Hands-on tech masterclasses" },
    { label: "Courses", href: "/courses", icon: BookOpen, desc: "Curated learning paths" },
    { label: "Competitions", href: "/competitions", icon: Trophy, desc: "Coding & case challenges" },
    { label: "Fellowships", href: "/fellowships", icon: Award, desc: "Elite builder cohorts" },
    { label: "Volunteering", href: "/volunteering", icon: Layers, desc: "Open-source & community" },
    { label: "Campus Opportunities", href: "/campus-opportunities", icon: Building2, desc: "Student ambassador roles" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? "bg-[#090B0B]/90 backdrop-blur-md border-b border-white/[0.08] shadow-soft"
          : "bg-[#090B0B]/80 backdrop-blur-sm border-b border-white/[0.06]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        {/* Left: Official Logo */}
        <div className="flex items-center space-x-8 flex-shrink-0">
          <NimbluxLogo size="md" href="/" showTagline={false} />
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                  isActive
                    ? "text-[#F5F1E8] bg-white/[0.06]"
                    : "text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04]"
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
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-[8px] text-[14px] font-medium transition-colors ${
                moreDropdownOpen
                  ? "text-[#F5F1E8] bg-white/[0.06]"
                  : "text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04]"
              }`}
            >
              <span>More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  moreDropdownOpen ? "rotate-180 text-[#D8B77A]" : ""
                }`}
              />
            </button>

            {moreDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-[14px] bg-[#111615] border border-white/[0.08] shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                {moreNavItems.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setMoreDropdownOpen(false)}
                    className="flex items-start space-x-2.5 p-2 rounded-[9px] hover:bg-white/[0.04] transition-colors group"
                  >
                    <sub.icon className="w-4 h-4 text-[#D8B77A] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[13px] font-medium text-[#F5F1E8] group-hover:text-[#D8B77A] transition-colors">
                        {sub.label}
                      </div>
                      <div className="text-[11px] text-[#A9AAA5] leading-tight">
                        {sub.desc}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Search Trigger Button */}
          <Link
            href="/opportunities"
            className="p-2 rounded-[9px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
            title="Search opportunities"
            aria-label="Search opportunities"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Post Opportunity Button */}
          <Link
            href="/submit-opportunity"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Post Opportunity</span>
          </Link>

          {/* Notifications Trigger */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-[9px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D8B77A] ring-2 ring-[#090B0B]" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-[14px] bg-[#111615] border border-white/[0.08] shadow-2xl p-3 z-50 animate-fade-in space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-[12px] font-semibold text-[#F5F1E8]">Notifications</span>
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] text-[#D8B77A] hover:underline"
                    >
                      View all
                    </Link>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#A9AAA5]">
                      No new notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <Link
                        key={n.id}
                        href={n.link || "/dashboard/notifications"}
                        onClick={() => setNotificationsOpen(false)}
                        className="block p-2 rounded-[8px] hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="text-[12px] font-medium text-[#F5F1E8] line-clamp-1">
                          {n.title}
                        </div>
                        <div className="text-[11px] text-[#A9AAA5] line-clamp-2 mt-0.5">
                          {n.message}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Session / Profile Dropdown */}
          {!loading && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 pl-2 rounded-[9px] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-colors"
              >
                <div className="w-7 h-7 rounded-[7px] bg-[#151A18] border border-white/[0.08] flex items-center justify-center font-bold text-[#D8B77A] text-[11px] overflow-hidden">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#A9AAA5]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-[14px] bg-[#111615] border border-white/[0.08] shadow-2xl p-2 z-50 animate-fade-in space-y-1 text-xs">
                  <div className="px-2.5 py-2 border-b border-white/[0.06]">
                    <div className="font-semibold text-[#F5F1E8] truncate">{user.name}</div>
                    <div className="text-[11px] text-[#A9AAA5] truncate font-mono mt-0.5">{user.email}</div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#D8B77A]" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/dashboard/applications"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D8B77A]" />
                    <span>My Applications</span>
                  </Link>

                  <Link
                    href="/dashboard/registrations"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5 text-[#8FA58E]" />
                    <span>My Registrations</span>
                  </Link>

                  <Link
                    href="/dashboard/certificates"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-[#D8B77A]" />
                    <span>My Certificates</span>
                  </Link>

                  <Link
                    href="/organizer"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#D8B77A]" />
                    <span>Organizer Console</span>
                  </Link>

                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#D8B77A] hover:bg-white/[0.04] transition-colors font-semibold"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin Suite</span>
                    </Link>
                  )}

                  <div className="pt-1 border-t border-white/[0.06]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !loading ? (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium text-[#A9AAA5] hover:text-[#F5F1E8] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium text-[#F5F1E8] bg-[#151A18] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          ) : null}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[9px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] lg:hidden transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/[0.08] bg-[#090B0B] px-4 py-5 space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-[8px] text-[14px] font-medium text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.06] space-y-1">
            <div className="text-[11px] font-mono text-[#7E807B] uppercase tracking-wider px-3 pb-1">
              Tracks
            </div>
            {moreNavItems.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-[8px] text-[13px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
              >
                <sub.icon className="w-3.5 h-3.5 text-[#D8B77A]" />
                <span>{sub.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
            <Link
              href="/submit-opportunity"
              className="w-full text-center py-2.5 rounded-[9px] text-[13px] font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors"
            >
              Post an Opportunity
            </Link>
            {!user && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="text-center py-2 rounded-[8px] text-[13px] font-medium text-[#F5F1E8] bg-[#111615] border border-white/[0.08]"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="text-center py-2 rounded-[8px] text-[13px] font-medium text-[#090B0B] bg-[#F5F1E8]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
