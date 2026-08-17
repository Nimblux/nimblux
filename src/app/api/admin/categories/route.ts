import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
    });

    // Also calculate real-time opportunities count per category
    const counts = await prisma.opportunity.groupBy({
      by: ["category"],
      where: { status: "APPROVED" },
      _count: { id: true },
    });

    const countMap: Record<string, number> = {};
    counts.forEach((c) => {
      countMap[c.category.toLowerCase()] = c._count.id;
    });

    const enriched = categories.map((cat) => ({
      ...cat,
      activeCount: countMap[cat.slug.toLowerCase()] || 0,
    }));

    return NextResponse.json({ categories: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { name, icon, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = slugify(name);
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        icon: icon || "Compass",
        description: description?.trim() || "",
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
