"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Trophy,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Share2,
  Download,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function MyCertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/users/certificates")
      .then((res) => res.json())
      .then((data) => {
        setCertificates(data.certificates || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-charcoal-cardBorder">
        <div>
          <h2 className="font-serif-heading font-medium text-2xl text-ivory-100">
            My Verifiable Certificates
          </h2>
          <p className="text-xs text-ivory-400 mt-0.5">
            Official cryptographic credentials earned from hackathons, workshops, competitions, and programs.
          </p>
        </div>
        <div className="text-xs font-mono text-amber-300">
          {certificates.length} {certificates.length === 1 ? "credential" : "credentials"} earned
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-charcoal-card border border-charcoal-cardBorder space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif-heading font-medium text-xl text-ivory-100">
            No Certificates Yet
          </h3>
          <p className="text-xs text-ivory-400 max-w-sm mx-auto">
            Participate in hackathons, complete masterclasses, or finish programs on NIMBLUX to earn verifiable on-chain ready credentials.
          </p>
          <Link
            href="/hackathons"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 transition-all"
          >
            <span>Explore Hackathons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-3xl bg-gradient-to-br from-charcoal-card via-charcoal-card to-charcoal-900 border border-charcoal-cardBorder hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-5 shadow-card"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10.5px] font-mono font-bold">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Verified Credential</span>
                  </div>

                  <span className="text-[10px] font-mono text-ivory-500 uppercase">
                    {cert.opportunityType || "CERTIFICATE"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-ivory-400">
                    {cert.organizationName}
                  </div>
                  <h3 className="font-serif-heading font-medium text-xl text-ivory-100 leading-snug">
                    {cert.opportunityTitle}
                  </h3>
                  <div className="text-xs text-amber-300 font-mono font-semibold">
                    Role: {cert.role} {cert.prizeTitle && `• ${cert.prizeTitle}`}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-charcoal-900/80 border border-charcoal-cardBorder text-xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-ivory-500 uppercase">Credential ID</div>
                    <div className="font-mono text-ivory-200 text-xs font-bold mt-0.5">
                      {cert.certificateCode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-ivory-500 uppercase">Issued Date</div>
                    <div className="font-mono text-ivory-300 text-xs mt-0.5">
                      {formatDate(cert.issueDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-charcoal-cardBorder flex items-center justify-between">
                <Link
                  href={cert.verificationUrl}
                  target="_blank"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-bronze-500 hover:bg-bronze-400 shadow-button transition-all"
                >
                  <span>View Certificate</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => {
                    const fullUrl = `https://nimblux.xyz${cert.verificationUrl}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(fullUrl);
                      alert("Certificate link copied to clipboard!");
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-mono text-ivory-400 hover:text-ivory-100 hover:bg-charcoal-900 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
