"use client";

import React, { useState } from "react";
import { Share2, X, Copy, Check, Twitter, Linkedin, MessageCircle } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  title: string;
  url: string;
  onClose: () => void;
}

export default function ShareModal({
  isOpen,
  title,
  url,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out ${title} on NIMBLUX!`
  )}&url=${encodeURIComponent(url)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url
  )}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out this opportunity: ${title} - ${url}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl glass-dropdown border border-slate-800 p-6 shadow-2xl bg-slate-950">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Share Opportunity</h3>
            <p className="text-xs text-slate-400">
              Share with your peer network and community
            </p>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 hover:text-white transition-all space-y-1.5"
          >
            <Twitter className="w-5 h-5 text-sky-400" />
            <span className="text-[11px] font-medium">X (Twitter)</span>
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 hover:text-white transition-all space-y-1.5"
          >
            <Linkedin className="w-5 h-5 text-blue-400" />
            <span className="text-[11px] font-medium">LinkedIn</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 hover:text-white transition-all space-y-1.5"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-medium">WhatsApp</span>
          </a>
        </div>

        {/* Copy Link Input */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Direct Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={url}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 truncate focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
