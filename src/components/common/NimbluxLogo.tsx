"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface NimbluxLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  href?: string;
  theme?: "dark" | "light" | "auto";
}

export function NimbluxIcon({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeMap = {
    sm: "h-7 w-auto",
    md: "h-9 w-auto",
    lg: "h-11 w-auto",
    xl: "h-14 w-auto",
  };

  return (
    <img
      src="/nimblux-icon.png"
      alt="NIMBLUX"
      className={`${sizeMap[size] || sizeMap.md} object-contain transition-transform group-hover:scale-105 ${className}`}
    />
  );
}

export default function NimbluxLogo({
  className = "",
  iconOnly = false,
  size = "md",
  showTagline = false,
  href = "/",
  theme = "dark",
}: NimbluxLogoProps) {
  const heightMap = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
    xl: "h-14",
  };

  const currentHeight = heightMap[size] || heightMap.md;
  const logoSrc = theme === "light" ? "/nimblux-logo-dark.png" : "/nimblux-logo-white.png";

  const content = (
    <div className={`inline-flex items-center group select-none ${className}`}>
      {iconOnly ? (
        <NimbluxIcon size={size} />
      ) : (
        <div className="flex flex-col">
          <img
            src={logoSrc}
            alt="NIMBLUX"
            className={`${currentHeight} w-auto object-contain transition-transform group-hover:scale-[1.02] filter drop-shadow-[0_2px_12px_rgba(56,189,248,0.15)]`}
          />
          {showTagline && (
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-slate-400 uppercase mt-0.5 pl-1 font-mono">
              Technology • Innovation • Community
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
