"use client";

import React from "react";
import { usePathname } from "next/navigation";
import TalentNavbar from "./TalentNavbar";
import OrganizerNavbar from "./OrganizerNavbar";

export default function Navbar() {
  const pathname = usePathname();

  // Admin layout renders its own full sidebar and header
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Dedicated Organizer Workspace Navbar
  if (pathname.startsWith("/organizer")) {
    return <OrganizerNavbar />;
  }

  // Dedicated Talent Experience Navbar
  return <TalentNavbar />;
}
