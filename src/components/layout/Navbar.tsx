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

  // Check if public organizer profile
  const isPublicOrganizerProfile =
    pathname.startsWith("/organizer/") &&
    !pathname.startsWith("/organizer/opportunities") &&
    !pathname.startsWith("/organizer/applications") &&
    !pathname.startsWith("/organizer/registrations") &&
    !pathname.startsWith("/organizer/participants") &&
    !pathname.startsWith("/organizer/hackathons") &&
    !pathname.startsWith("/organizer/events") &&
    !pathname.startsWith("/organizer/analytics") &&
    !pathname.startsWith("/organizer/organization") &&
    pathname !== "/organizer";

  // Dedicated Organizer Workspace Navbar
  if (pathname.startsWith("/organizer") && !isPublicOrganizerProfile) {
    return <OrganizerNavbar />;
  }

  // Dedicated Talent Experience Navbar
  return <TalentNavbar />;
}
