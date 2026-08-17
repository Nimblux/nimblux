import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        opportunity: true,
      },
    });

    const opportunities = bookmarks.map((b) => ({
      ...b.opportunity,
      isBookmarked: true,
    }));

    return NextResponse.json({ opportunities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { opportunityId } = await req.json();
    if (!opportunityId) {
      return NextResponse.json({ error: "opportunityId required" }, { status: 400 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_opportunityId: {
          userId: user.id,
          opportunityId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false, message: "Bookmark removed" });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          opportunityId,
        },
      });
      return NextResponse.json({ saved: true, message: "Opportunity saved" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
