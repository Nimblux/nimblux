"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  Bell,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  Users,
  Ticket,
  Trophy,
  Calendar,
  BarChart3,
  Building2,
  ShieldCheck,
  LogOut,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
  Code,
  GraduationCap,
} from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";
import UserAvatar from "@/components/common/UserAvatar";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  profileImage?: string | null;
  isOrganizer: boolean;
  isVerifiedOrganizer: boolean;
  organizationName?: string | null;
  organizationLogo?: string | null;
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

export default function OrganizerNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const createRef = useRef<HTMLDivElement>(null);
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
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
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
    setCreateMenuOpen(false);
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

  const organizerNavItems = [
    { label: "Dashboard", href: "/organizer", icon: LayoutDashboard },
    { label: "Opportunities", href: "/organizer/opportunities", icon: Briefcase },
    { label: "Applications", href: "/organizer/applications", icon: Users },
    { label: "Registrations", href: "/organizer/registrations", icon: Ticket },
    { label: "Participants", href: "/organizer/participants", icon: Users },
    { label: "Hackathons", href: "/organizer/hackathons", icon: Trophy },
    { label: "Events", href: "/organizer/events", icon: Calendar },
    { label: "Analytics", href: "/organizer/analytics", icon: BarChart3 },
  ];

  const createOptions = [
    {
      title: "Job or Internship",
      desc: "Hire software engineers, interns, designers, researchers",
      href: "/submit-opportunity?type=internship",
      icon: Briefcase,
    },
    {
      title: "Hackathon",
      desc: "Host a global hackathon with judging, tracks & teams",
      href: "/organize-hackathon",
      icon: Trophy,
    },
    {
      title: "Workshop / Masterclass",
      desc: "Host hands-on technical sessions & live workshops",
      href: "/submit-opportunity?type=workshop",
      icon: Sparkles,
    },
    {
      title: "Event / Conference",
      desc: "Conferences, meetups, webinars & summits",
      href: "/submit-opportunity?type=event",
      icon: Calendar,
    },
    {
      title: "Competition / Challenge",
      desc: "Case competitions, algorithmic & coding challenges",
      href: "/submit-opportunity?type=competition",
      icon: Code,
    },
    {
      title: "Scholarship / Fellowship",
      desc: "Grants, fellowships and research funding",
      href: "/submit-opportunity?type=scholarship",
      icon: GraduationCap,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled
          ? "bg-[#090B0B]/95 backdrop-blur-md border-b border-white/[0.08] shadow-card"
          : "bg-[#090B0B]/90 backdrop-blur-sm border-b border-white/[0.06]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        {/* Left: NIMBLUX Organizer Brand */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <NimbluxLogo size="md" href="/organizer" showTagline={false} />
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[6px] text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#D8B77A] bg-[#D8B77A]/15 border border-[#D8B77A]/30">
            <span>Organizer</span>
          </span>
        </div>

        {/* Center: Organizer Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1">
          {organizerNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/organizer" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-[#F5F1E8] bg-white/[0.08] shadow-sm font-semibold"
                    : "text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Create Opportunity, Notifications, Org Profile, Account Menu */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Create Opportunity Trigger */}
          <div className="relative" ref={createRef}>
            <button
              onClick={() => setCreateMenuOpen(!createMenuOpen)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Create Opportunity</span>
              <span className="sm:hidden">Create</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${createMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {createMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-[14px] bg-[#111615] border border-white/[0.08] shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                <div className="px-2.5 py-1.5 text-[10.5px] font-mono text-[#A9AAA5] uppercase tracking-wider border-b border-white/[0.06]">
                  Select Opportunity Type
                </div>
                {createOptions.map((opt) => (
                  <Link
                    key={opt.title}
                    href={opt.href}
                    onClick={() => setCreateMenuOpen(false)}
                    className="flex items-start space-x-2.5 p-2 rounded-[9px] hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="p-1.5 rounded-[7px] bg-[#151A18] text-[#D8B77A] group-hover:bg-[#D8B77A]/15 transition-colors mt-0.5">
                      <opt.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[12.5px] font-semibold text-[#F5F1E8] group-hover:text-[#D8B77A] transition-colors">
                        {opt.title}
                      </div>
                      <div className="text-[11px] text-[#A9AAA5] leading-snug">
                        {opt.desc}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

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
                    <span className="text-[12px] font-semibold text-[#F5F1E8]">Organizer Alerts</span>
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
                        href={n.link || "/organizer"}
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

          {/* Organization Profile Quick Link */}
          <Link
            href="/organizer/organization"
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-[8px] bg-[#111615] hover:bg-[#151A18] border border-white/[0.08] text-xs text-[#F5F1E8] transition-colors"
            title="Organization Profile"
          >
            <Building2 className="w-3.5 h-3.5 text-[#D8B77A]" />
            <span className="max-w-[110px] truncate font-medium">
              {user?.organizationName || "Organization"}
            </span>
            {user?.isVerifiedOrganizer && (
              <span title="Verified Organizer">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8FA58E]" />
              </span>
            )}
          </Link>

          {/* Account Profile Menu */}
          {!loading && user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 pl-2 rounded-[9px] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-colors"
              >
                <UserAvatar
                  name={user.organizationName || user.name}
                  image={user.organizationLogo || user.profileImage}
                  size="sm"
                />
                <ChevronDown className="w-3.5 h-3.5 text-[#A9AAA5]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-[14px] bg-[#111615] border border-white/[0.08] shadow-2xl p-2 z-50 animate-fade-in space-y-1 text-xs">
                  {/* Org / User Info */}
                  <div className="px-2.5 py-2 border-b border-white/[0.06]">
                    <div className="flex items-center space-x-1.5 font-semibold text-[#F5F1E8] truncate">
                      <span>{user.organizationName || user.name}</span>
                      {user.isVerifiedOrganizer && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#8FA58E] flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-[#A9AAA5] truncate font-mono mt-0.5">{user.email}</div>
                  </div>

                  {/* Active Workspace & Switcher */}
                  <div className="p-1.5 bg-[#0E1110] rounded-[10px] border border-white/[0.04] my-1">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px]">
                      <span className="text-[#A9AAA5]">Active Workspace:</span>
                      <span className="inline-flex items-center space-x-1 text-[#D8B77A] font-semibold font-mono">
                        <Check className="w-3 h-3" />
                        <span>Organizer</span>
                      </span>
                    </div>

                    <Link
                      href="/"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full mt-1 flex items-center justify-between px-2.5 py-1.5 rounded-[8px] bg-white/[0.05] hover:bg-white/[0.08] text-[#F5F1E8] font-medium transition-colors"
                    >
                      <span>Switch to Talent</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A9AAA5]" />
                    </Link>
                  </div>

                  {/* Organizer Links */}
                  <div className="py-1 space-y-0.5">
                    <Link
                      href="/organizer"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#D8B77A]" />
                      <span>Organizer Dashboard</span>
                    </Link>

                    <Link
                      href="/organizer/organization"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#D8B77A]" />
                      <span>Organization Profile</span>
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-[8px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] transition-colors"
                    >
                      <span>Account Settings</span>
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
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[9px] text-[#A9AAA5] hover:text-[#F5F1E8] hover:bg-white/[0.04] xl:hidden transition-colors"
            aria-label="Toggle organizer navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-white/[0.08] bg-[#0E1110] px-4 pt-3 pb-6 space-y-4 animate-fade-in max-h-[85vh] overflow-y-auto">
          {/* Switch to Talent Option */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-[10px] bg-white/[0.04] border border-white/[0.08] text-[#F5F1E8] font-medium text-xs"
          >
            <span>Switch to Talent Experience</span>
            <ArrowRight className="w-4 h-4 text-[#A9AAA5]" />
          </Link>

          <div className="space-y-1">
            <div className="text-[11px] font-mono text-[#7E807B] uppercase tracking-wider px-2 py-1">
              Organizer Operations
            </div>
            {organizerNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/organizer" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                    isActive
                      ? "text-[#F5F1E8] bg-white/[0.08] font-semibold"
                      : "text-[#A9AAA5] hover:text-[#F5F1E8]"
                  }`}
                >
                  <item.icon className="w-4 h-4 text-[#D8B77A]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-1 pt-2 border-t border-white/[0.06]">
            <div className="text-[11px] font-mono text-[#7E807B] uppercase tracking-wider px-2 py-1">
              Create New
            </div>
            <Link
              href="/submit-opportunity"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-[8px] text-[13px] text-[#A9AAA5] hover:text-[#F5F1E8]"
            >
              + Post Opportunity (Job, Internship, Event)
            </Link>
            <Link
              href="/organize-hackathon"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-[8px] text-[13px] text-[#A9AAA5] hover:text-[#F5F1E8]"
            >
              + Host Hackathon
            </Link>
            <Link
              href="/organizer/organization"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-[8px] text-[13px] text-[#A9AAA5] hover:text-[#F5F1E8]"
            >
              Manage Organization Profile
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
