"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Compass,
  Briefcase,
  Code,
  Building2,
  Calendar,
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
  ArrowRight,
  Check,
} from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";
import UserAvatar from "@/components/common/UserAvatar";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  profileImage?: string | null;
  isOrganizer?: boolean;
  isVerifiedOrganizer?: boolean;
  organizationName?: string | null;
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

export default function TalentNavbar() {
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const talentNavItems = [
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
        {/* Left: NIMBLUX Logo */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <NimbluxLogo size="md" href="/" showTagline={false} />
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10.5px] font-mono font-medium text-[#A9AAA5] bg-white/[0.04] border border-white/[0.06]">
            Talent
          </span>
        </div>

        {/* Center: Talent Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {talentNavItems.map((item) => {
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

        {/* Right Side: Search, Post/Onboard, Notifications, Profile */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Search Trigger */}
          <Link
            href="/opportunities"
            className="p-2 rounded-[9px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
            title="Search opportunities"
            aria-label="Search opportunities"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Post Opportunity / Become Organizer */}
          {user?.isOrganizer ? (
            <Link
              href="/submit-opportunity"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
            >
              <span>Post Opportunity</span>
            </Link>
          ) : (
            <Link
              href="/become-organizer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-[9px] text-[13px] font-medium text-[#D8B77A] bg-[#D8B77A]/10 border border-[#D8B77A]/25 hover:bg-[#D8B77A]/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D8B77A]" />
              <span>Become an Organizer</span>
            </Link>
          )}

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

          {/* User Session Dropdown */}
          {!loading && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 pl-2 rounded-[9px] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-colors"
              >
                <UserAvatar name={user.name} image={user.profileImage} size="sm" />
                <ChevronDown className="w-3.5 h-3.5 text-[#A9AAA5]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-[14px] bg-[#111615] border border-white/[0.08] shadow-2xl p-2 z-50 animate-fade-in space-y-1 text-xs">
                  {/* User Info Header */}
                  <div className="px-2.5 py-2 border-b border-white/[0.06]">
                    <div className="font-semibold text-[#F5F1E8] truncate">{user.name}</div>
                    <div className="text-[11px] text-[#A9AAA5] truncate font-mono mt-0.5">{user.email}</div>
                  </div>

                  {/* Workspace Status & Switcher */}
                  <div className="p-1.5 bg-[#0E1110] rounded-[10px] border border-white/[0.04] my-1">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px]">
                      <span className="text-[#A9AAA5]">Current Workspace:</span>
                      <span className="inline-flex items-center space-x-1 text-[#8FA58E] font-medium font-mono">
                        <Check className="w-3 h-3" />
                        <span>Talent</span>
                      </span>
                    </div>

                    {user.isOrganizer ? (
                      <Link
                        href="/organizer"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full mt-1 flex items-center justify-between px-2.5 py-1.5 rounded-[8px] bg-[#D8B77A]/10 hover:bg-[#D8B77A]/20 text-[#D8B77A] font-semibold transition-colors"
                      >
                        <span>Switch to Organizer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href="/become-organizer"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full mt-1 flex items-center justify-between px-2.5 py-1.5 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-[#D8B77A] transition-colors"
                      >
                        <span className="flex items-center space-x-1.5">
                          <Sparkles className="w-3 h-3 text-[#D8B77A]" />
                          <span>Become an Organizer</span>
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#A9AAA5]" />
                      </Link>
                    )}
                  </div>

                  {/* Talent Capabilities Navigation */}
                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#D8B77A]" />
                      <span>Talent Dashboard</span>
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
                      href="/dashboard/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#A9AAA5]" />
                      <span>Saved Opportunities</span>
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                    >
                      <span>Profile & Resume</span>
                    </Link>
                  </div>

                  {user.role === "ADMIN" && (
                    <div className="pt-1 border-t border-white/[0.06]">
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#D8B77A] hover:bg-white/[0.04] transition-colors font-semibold"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin Suite</span>
                      </Link>
                    </div>
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
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/[0.08] bg-[#0E1110] px-4 pt-3 pb-6 space-y-4 animate-fade-in max-h-[85vh] overflow-y-auto">
          {user?.isOrganizer ? (
            <Link
              href="/organizer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-[10px] bg-[#D8B77A]/10 border border-[#D8B77A]/25 text-[#D8B77A] font-semibold text-xs"
            >
              <span>Switch to Organizer Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/become-organizer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-[10px] bg-white/[0.04] border border-white/[0.08] text-[#D8B77A] text-xs font-medium"
            >
              <span className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D8B77A]" />
                <span>Become an Organizer</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="space-y-1">
            <div className="text-[11px] font-mono text-[#7E807B] uppercase tracking-wider px-2 py-1">
              Explore Opportunities
            </div>
            {talentNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                  pathname === item.href
                    ? "text-[#F5F1E8] bg-white/[0.06]"
                    : "text-[#A9AAA5] hover:text-[#F5F1E8]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-white/[0.06]">
            <div className="text-[11px] font-mono text-[#7E807B] uppercase tracking-wider px-2 py-1">
              Specialized Programs
            </div>
            {moreNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-[8px] text-[13px] font-medium text-[#A9AAA5] hover:text-[#F5F1E8]"
              >
                <item.icon className="w-4 h-4 text-[#D8B77A]" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {user && (
            <div className="space-y-1 pt-2 border-t border-white/[0.06]">
              <div className="text-[11px] font-mono text-[#7E807B] uppercase tracking-wider px-2 py-1">
                Candidate Center
              </div>
              <Link
                href="/dashboard/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-[8px] text-[13px] text-[#A9AAA5] hover:text-[#F5F1E8]"
              >
                My Applications
              </Link>
              <Link
                href="/dashboard/registrations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-[8px] text-[13px] text-[#A9AAA5] hover:text-[#F5F1E8]"
              >
                My Registrations
              </Link>
              <Link
                href="/dashboard/certificates"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-[8px] text-[13px] text-[#A9AAA5] hover:text-[#F5F1E8]"
              >
                My Certificates
              </Link>
              <Link
                href="/dashboard/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-[8px] text-[13px] text-[#A9AAA5] hover:text-[#F5F1E8]"
              >
                Saved Opportunities
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
