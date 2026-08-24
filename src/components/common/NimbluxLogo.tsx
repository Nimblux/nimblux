"use client";

import React from "react";
import Link from "next/link";

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
    md: "h-8.5 w-auto",
    lg: "h-11 w-auto",
    xl: "h-14 w-auto",
  };

  return (
    <img
      src="/nimblux-icon.png"
      alt="NIMBLUX"
      className={`${sizeMap[size] || sizeMap.md} object-contain transition-transform duration-200 group-hover:scale-105 ${className}`}
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
    sm: "h-6.5",
    md: "h-8",
    lg: "h-10",
    xl: "h-13",
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
            className={`${currentHeight} w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01] filter drop-shadow-[0_2px_10px_rgba(197,168,128,0.12)]`}
          />
          {showTagline && (
            <span className="text-[9px] sm:text-[9.5px] font-medium tracking-[0.18em] text-ivory-500 uppercase mt-0.5 pl-0.5 font-mono">
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
