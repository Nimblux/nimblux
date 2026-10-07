"use client";

import React, { useState } from "react";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const SIZE_MAP = {
  xs: "w-5 h-5 text-[9px] rounded-[5px]",
  sm: "w-7 h-7 text-[11px] rounded-[7px]",
  md: "w-9 h-9 text-xs rounded-[9px]",
  lg: "w-12 h-12 text-sm rounded-[12px]",
  xl: "w-16 h-16 text-base rounded-[16px]",
  "2xl": "w-24 h-24 text-xl rounded-[20px]",
};

export default function UserAvatar({
  name = "User",
  image,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const displayName = name?.trim() || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || displayName.slice(0, 1).toUpperCase();

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  if (image && !imgError) {
    return (
      <div
        className={`relative inline-block overflow-hidden bg-[#151A18] border border-white/[0.08] flex-shrink-0 ${sizeClass} ${className}`}
      >
        <img
          src={image}
          alt={displayName}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center font-bold text-[#D8B77A] bg-[#151A18] border border-[#D8B77A]/25 select-none font-mono flex-shrink-0 ${sizeClass} ${className}`}
      aria-label={displayName}
    >
      {initials}
    </div>
  );
}
