"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import NimbluxLogo from "@/components/common/NimbluxLogo";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-[#090B0B] border-t border-white/[0.08] text-[#A9AAA5] text-sm">
      {/* Newsletter Section */}
      <div className="border-b border-white/[0.06] bg-[#0E1110]/80 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left max-w-xl">
            <h3 className="text-xl sm:text-2xl text-[#F5F1E8] font-semibold tracking-tight">
              Get the latest opportunities in your inbox.
            </h3>
            <p className="text-[#A9AAA5] text-xs sm:text-sm mt-1.5 leading-relaxed">
              Internships, hackathons, jobs, events and more — straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            {subscribed ? (
              <div className="flex items-center space-x-2 px-4 py-2.5 rounded-[9px] bg-[#8FA58E]/15 border border-[#8FA58E]/30 text-[#F5F1E8] text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#8FA58E]" />
                <span>You're subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full md:w-72 px-4 py-2.5 rounded-[9px] bg-[#111615] border border-white/[0.08] text-xs text-[#F5F1E8] placeholder-[#7E807B] focus:outline-none focus:border-[#D8B77A]/50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-[9px] text-xs font-semibold text-[#090B0B] bg-[#D8B77A] hover:bg-[#E7D5B2] transition-colors whitespace-nowrap shadow-sm"
                >
                  Subscribe →
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <NimbluxLogo size="md" showTagline={false} href="/" />
            <div className="text-[12px] font-mono uppercase tracking-wider text-[#A9AAA5]">
              Technology • Innovation • Community
            </div>
            <p className="text-[#7E807B] text-xs sm:text-[13px] leading-relaxed max-w-sm">
              NIMBLUX is a modern career and builder platform connecting ambitious students and developers with verified opportunities, hackathons, and credentials.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <a
                href="https://www.linkedin.com/company/nimblux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-[8px] bg-[#111615] border border-white/[0.08] flex items-center justify-center text-[#A9AAA5] hover:text-[#F5F1E8] hover:border-white/[0.15] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/joinimblux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-[8px] bg-[#111615] border border-white/[0.08] flex items-center justify-center text-[#A9AAA5] hover:text-[#F5F1E8] hover:border-white/[0.15] transition-colors"
                aria-label="X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/joinnimblux/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-[8px] bg-[#111615] border border-white/[0.08] flex items-center justify-center text-[#A9AAA5] hover:text-[#F5F1E8] hover:border-white/[0.15] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-[8px] bg-[#111615] border border-white/[0.08] flex items-center justify-center text-[#A9AAA5] hover:text-[#F5F1E8] hover:border-white/[0.15] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Nimblux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-[8px] bg-[#111615] border border-white/[0.08] flex items-center justify-center text-[#A9AAA5] hover:text-[#F5F1E8] hover:border-white/[0.15] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A9AAA5]">
              <li>
                <Link href="/internships" className="hover:text-[#F5F1E8] transition-colors">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-[#F5F1E8] transition-colors">
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/hackathons" className="hover:text-[#F5F1E8] transition-colors">
                  Hackathons
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="hover:text-[#F5F1E8] transition-colors">
                  Workshops
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#F5F1E8] transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-[#F5F1E8] transition-colors">
                  Scholarships
                </Link>
              </li>
            </ul>
          </div>

          {/* For Organizers Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8] mb-4">
              For Organizers
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A9AAA5]">
              <li>
                <Link href="/submit-opportunity" className="text-[#D8B77A] hover:text-[#E7D5B2] font-medium transition-colors">
                  Post Opportunity
                </Link>
              </li>
              <li>
                <Link href="/organize-hackathon" className="hover:text-[#F5F1E8] transition-colors">
                  Organize Hackathon
                </Link>
              </li>
              <li>
                <Link href="/organizer" className="hover:text-[#F5F1E8] transition-colors">
                  Manage Events
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-[#F5F1E8] transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F5F1E8] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A9AAA5]">
              <li>
                <Link href="/opportunities" className="hover:text-[#F5F1E8] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#F5F1E8] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#F5F1E8] transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#F5F1E8] transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7E807B]">
          <div className="flex items-center space-x-2">
            <span>© {new Date().getFullYear()} NIMBLUX. All rights reserved.</span>
            <span>•</span>
            <span className="text-[#D8B77A] italic">"Made for a brighter tomorrow."</span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="inline-flex items-center text-[#8FA58E] text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8FA58E] mr-1.5" />
              All systems operational
            </span>
            <Link href="/opportunities" className="hover:text-[#F5F1E8] transition-colors">
              Directory
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
