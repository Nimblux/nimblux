import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "nimblux_default_secret_key_2026";
export const AUTH_COOKIE_NAME = "nimblux_session";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  profileImage?: string | null;
  profileImageUrl?: string | null;
  college?: string | null;
  degree?: string | null;
  skills?: string | null;
  graduationYear?: string | null;
  location?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  phone?: string | null;
  status: string;

  // Organizer Fields
  isOrganizer: boolean;
  isVerifiedOrganizer: boolean;
  organizationName?: string | null;
  organizationLogo?: string | null;
  organizationBio?: string | null;
  organizationWebsite?: string | null;
  organizationEmail?: string | null;
  organizationPhone?: string | null;
  organizationLocation?: string | null;
  organizationType?: string | null;
  organizationLinkedin?: string | null;
  organizationTwitter?: string | null;
  organizationInstagram?: string | null;
  organizationGithub?: string | null;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string): { id: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = verifyJwt(token);
    if (!decoded) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
        profileImageUrl: true,
        college: true,
        degree: true,
        skills: true,
        graduationYear: true,
        location: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        phone: true,
        status: true,
        isOrganizer: true,
        isVerifiedOrganizer: true,
        organizationName: true,
        organizationLogo: true,
        organizationBio: true,
        organizationWebsite: true,
        organizationEmail: true,
        organizationPhone: true,
        organizationLocation: true,
        organizationType: true,
        organizationLinkedin: true,
        organizationTwitter: true,
        organizationInstagram: true,
        organizationGithub: true,
        _count: {
          select: {
            opportunities: true,
            createdHackathons: true,
          },
        },
      },
    });

    if (!user || user.status === "SUSPENDED") {
      return null;
    }

    const hasCreatedContent = (user._count?.opportunities || 0) > 0 || (user._count?.createdHackathons || 0) > 0;
    const effectiveIsOrganizer = Boolean(user.isOrganizer || hasCreatedContent || user.role === "ADMIN");

    const { _count, ...userData } = user;
    const resolvedImage = user.profileImageUrl || user.profileImage || null;

    return {
      ...userData,
      profileImage: resolvedImage,
      profileImageUrl: resolvedImage,
      isOrganizer: effectiveIsOrganizer,
    } as SessionUser;
  } catch (err) {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN_ADMIN_REQUIRED");
  }
  return user;
}
