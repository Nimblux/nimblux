import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const mode = searchParams.get("mode");
    const paid = searchParams.get("paid");
    const sort = searchParams.get("sort") || "latest";
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const currentUser = await getCurrentUser();

    // Query builder - only public APPROVED opportunities
    const where: any = {
      status: "APPROVED",
    };

    if (category && category !== "all") {
      where.category = category.toLowerCase();
    }

    if (mode && mode !== "all") {
      where.mode = mode.toUpperCase();
    }

    if (paid === "paid") {
      where.isPaid = true;
    } else if (paid === "free") {
      where.isPaid = false;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      where.OR = [
        { title: { contains: term } },
        { organization: { contains: term } },
        { description: { contains: term } },
        { skills: { contains: term } },
        { location: { contains: term } },
        { eligibility: { contains: term } },
      ];
    }

    // Sorting logic
    let orderBy: any = { createdAt: "desc" };
    if (sort === "deadline") {
      orderBy = { deadline: "asc" };
    } else if (sort === "popular") {
      orderBy = { clicksCount: "desc" };
    } else if (sort === "featured") {
      orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        createdBy: {
          select: { id: true, name: true, profileImage: true },
        },
      },
    });

    // Check user bookmarks
    let bookmarkedIds = new Set<string>();
    if (currentUser) {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId: currentUser.id },
        select: { opportunityId: true },
      });
      bookmarkedIds = new Set(bookmarks.map((b) => b.opportunityId));
    }

    const enriched = opportunities.map((opp) => ({
      ...opp,
      isBookmarked: bookmarkedIds.has(opp.id),
    }));

    return NextResponse.json({ opportunities: enriched, count: enriched.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to submit opportunities." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      category,
      organization,
      logo,
      banner,
      location,
      mode,
      eligibility,
      skills,
      stipend,
      salary,
      registrationFee,
      isPaid,
      applicationUrl,
      deadline,
      startDate,
      endDate,
      contactInfo,
      additionalInfo,
    } = body;

    if (!title || !category || !organization || !applicationUrl || !deadline) {
      return NextResponse.json(
        { error: "Title, category, organization, application URL, and deadline are required." },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = slugify(`${organization}-${title}`);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.opportunity.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    const newOpportunity = await prisma.opportunity.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        description: body.description || "",
        category: category.toLowerCase().trim(),
        organization: organization.trim(),
        logo: logo?.trim() || null,
        banner: banner?.trim() || null,
        location: location?.trim() || "Remote",
        mode: (mode || "REMOTE").toUpperCase(),
        eligibility: eligibility?.trim() || null,
        skills: skills?.trim() || null,
        stipend: stipend?.trim() || null,
        salary: salary?.trim() || null,
        registrationFee: registrationFee?.trim() || "Free",
        isPaid: Boolean(isPaid || stipend || salary),
        applicationUrl: applicationUrl.trim(),
        deadline: new Date(deadline),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        contactInfo: contactInfo?.trim() || null,
        additionalInfo: additionalInfo?.trim() || null,
        status: "PENDING", // PENDING APPROVAL - NEVER DIRECTLY PUBLISHED
        featured: false,
        verified: false,
        createdById: user.id,
      },
    });

    // Notify user of submission
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Opportunity Submitted ⏳",
        message: `Your submission "${title}" is now pending moderator approval. You will receive an update once reviewed.`,
        type: "SYSTEM",
        link: "/dashboard/submissions",
      },
    });

    return NextResponse.json({
      success: true,
      opportunity: newOpportunity,
      message: "Opportunity submitted successfully and queued for moderation.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create opportunity." },
      { status: 500 }
    );
  }
}
