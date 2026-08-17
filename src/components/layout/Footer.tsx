"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  Code,
  Github,
  Twitter,
  Linkedin,
  Send,
  Heart,
  ShieldCheck,
  Zap,
  Globe2,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import NimbluxLogo from "@/components/common/NimbluxLogo";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      {/* Top Banner / Newsletter */}
      <div className="border-b border-slate-900 bg-slate-900/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>Weekly Opportunities Digest</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Never miss a high-impact tech opportunity.
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg">
              Get handpicked internships, hackathons, and scholarships delivered to your inbox every Monday morning.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Subscribed to NIMBLUX Weekly Digest!");
            }}
            className="flex w-full md:w-auto max-w-md items-center space-x-2"
          >
            <input
              type="email"
              placeholder="Enter your student email..."
              required
              className="w-full sm:w-72 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30 whitespace-nowrap text-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <NimbluxLogo size="md" showTagline={true} href="/" />
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              NIMBLUX is the premier student-focused technology platform empowering students, developers, and creators to discover verified internships, global hackathons, high-growth jobs, and scholarships.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/Nimblux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all shadow-sm"
                aria-label="GitHub @Nimblux"
                title="GitHub @Nimblux"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/joinimblux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all shadow-sm"
                aria-label="X (Twitter) @joinimblux"
                title="X @joinimblux"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/nimblux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-slate-800/80 transition-all shadow-sm"
                aria-label="LinkedIn @nimblux"
                title="LinkedIn @nimblux"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
              Opportunities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/internships" className="hover:text-indigo-400 transition-colors">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/hackathons" className="hover:text-indigo-400 transition-colors">
                  Hackathons
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-indigo-400 transition-colors">
                  Graduate & Tech Jobs
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-indigo-400 transition-colors">
                  Scholarships & Grants
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-indigo-400 transition-colors">
                  Competitions
                </Link>
              </li>
              <li>
                <Link href="/fellowships" className="hover:text-indigo-400 transition-colors">
                  Fellowships
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning & Community */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
              Community & Events
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/events" className="hover:text-indigo-400 transition-colors">
                  Tech Events & Summits
                </Link>
              </li>
              <li>
                <Link href="/workshops" className="hover:text-indigo-400 transition-colors">
                  Hands-on Workshops
                </Link>
              </li>
              <li>
                <Link href="/webinars" className="hover:text-indigo-400 transition-colors">
                  Live Webinars & AMAs
                </Link>
              </li>
              <li>
                <Link href="/campus-opportunities" className="hover:text-indigo-400 transition-colors">
                  Campus Ambassadors
                </Link>
              </li>
              <li>
                <Link href="/volunteering" className="hover:text-indigo-400 transition-colors">
                  Volunteering & Open Source
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Account */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/submit-opportunity" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center space-x-1">
                  <span>Post an Opportunity</span>
                  <span>✨</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/saved" className="hover:text-indigo-400 transition-colors">
                  Saved Opportunities
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>© {new Date().getFullYear()} NIMBLUX. All rights reserved.</span>
            <span>•</span>
            <span className="text-slate-400">Technology • Innovation • Community</span>
          </div>

          <div className="flex items-center space-x-6">
            <span className="inline-flex items-center text-emerald-400 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              All Systems Operational
            </span>
            <Link href="/opportunities" className="hover:text-slate-300">
              Browse Directory
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
