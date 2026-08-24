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
  ShieldCheck,
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
    <footer className="bg-charcoal-950 border-t border-charcoal-cardBorder text-ivory-400 text-sm">
      {/* Newsletter Strip */}
      <div className="border-b border-charcoal-cardBorder bg-charcoal-900/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left max-w-xl">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-bronze-400 text-xs font-mono uppercase tracking-wider mb-2 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weekly Opportunity Digest</span>
            </div>
            <h3 className="font-serif-heading text-xl sm:text-2xl text-ivory-100 font-medium tracking-tight">
              Get handpicked opportunities delivered to your inbox.
            </h3>
            <p className="text-ivory-500 text-xs sm:text-sm mt-1">
              Top summer internships, verified hackathons, and exclusive fellowships every Monday.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-center gap-2 max-w-md">
            {subscribed ? (
              <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-forest-500/15 border border-forest-500/30 text-forest-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-forest-400" />
                <span>You're subscribed! Check your inbox soon.</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student email..."
                  className="w-full md:w-72 px-4 py-2.5 rounded-xl bg-charcoal-card border border-charcoal-cardBorder text-xs text-ivory-100 placeholder-ivory-500 focus:outline-none focus:border-bronze-500/50"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-colors whitespace-nowrap shadow-button"
                >
                  Subscribe
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
            <NimbluxLogo size="md" showTagline={true} href="/" />
            <p className="text-ivory-500 text-xs sm:text-sm leading-relaxed max-w-sm pt-2">
              NIMBLUX is a calm, student-focused technology platform uniting verified internships, global hackathons, high-growth jobs, and scholarships in one trusted directory.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <a
                href="https://github.com/Nimblux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8.5 h-8.5 rounded-xl bg-charcoal-card border border-charcoal-cardBorder flex items-center justify-center text-ivory-400 hover:text-ivory-100 hover:border-bronze-500/40 transition-colors"
                aria-label="GitHub @Nimblux"
                title="GitHub @Nimblux"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/joinimblux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8.5 h-8.5 rounded-xl bg-charcoal-card border border-charcoal-cardBorder flex items-center justify-center text-ivory-400 hover:text-ivory-100 hover:border-bronze-500/40 transition-colors"
                aria-label="X @joinimblux"
                title="X @joinimblux"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/nimblux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8.5 h-8.5 rounded-xl bg-charcoal-card border border-charcoal-cardBorder flex items-center justify-center text-ivory-400 hover:text-ivory-100 hover:border-bronze-500/40 transition-colors"
                aria-label="LinkedIn @nimblux"
                title="LinkedIn @nimblux"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/joinnimblux/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8.5 h-8.5 rounded-xl bg-charcoal-card border border-charcoal-cardBorder flex items-center justify-center text-ivory-400 hover:text-ivory-100 hover:border-bronze-500/40 transition-colors"
                aria-label="Instagram @joinnimblux"
                title="Instagram @joinnimblux"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-ivory-300 font-semibold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/internships" className="hover:text-ivory-100 transition-colors">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/hackathons" className="hover:text-ivory-100 transition-colors">
                  Hackathons
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-ivory-100 transition-colors">
                  Graduate & Tech Jobs
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-ivory-100 transition-colors">
                  Tech Events & Summits
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-ivory-100 transition-colors">
                  Scholarships & Grants
                </Link>
              </li>
              <li>
                <Link href="/fellowships" className="hover:text-ivory-100 transition-colors">
                  Fellowships
                </Link>
              </li>
            </ul>
          </div>

          {/* For Partners Column */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-ivory-300 font-semibold mb-4">
              For Partners
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/submit-opportunity" className="text-bronze-400 hover:text-bronze-300 font-semibold transition-colors flex items-center space-x-1">
                  <span>Post Opportunity</span>
                  <span>→</span>
                </Link>
              </li>
              <li>
                <Link href="/campus-opportunities" className="hover:text-ivory-100 transition-colors">
                  Ambassador Program
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-ivory-100 transition-colors">
                  Recruiter Directory
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-300 transition-colors">
                  Moderation Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Company Column */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-ivory-300 font-semibold mb-4">
              Platform & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-ivory-100 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/saved" className="hover:text-ivory-100 transition-colors">
                  Saved Opportunities
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-ivory-100 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-ivory-100 transition-colors">
                  All 14 Categories
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-charcoal-cardBorder mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory-500">
          <div className="flex items-center space-x-2">
            <span>© {new Date().getFullYear()} NIMBLUX. All rights reserved.</span>
            <span>•</span>
            <span className="font-mono">https://nimblux.xyz</span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="inline-flex items-center text-forest-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400 mr-1.5" />
              Operational
            </span>
            <Link href="/opportunities" className="hover:text-ivory-300">
              Browse Directory
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
