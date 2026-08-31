import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
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

    if (type && type !== "all") {
      where.opportunityType = type.toUpperCase();
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
        { title: { contains: term, mode: "insensitive" } },
        { organization: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { skills: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
        { eligibility: { contains: term, mode: "insensitive" } },
        { instructor: { contains: term, mode: "insensitive" } },
        { responsibilities: { contains: term, mode: "insensitive" } },
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
        _count: {
          select: {
            applications: true,
            registrations: true,
          },
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
      applicationsCount: opp._count.applications,
      registrationsCount: opp._count.registrations,
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
      opportunityType,
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
      isExternal,
      externalUrl,
      applicationUrl,
      deadline,
      startDate,
      endDate,
      contactInfo,
      additionalInfo,
      department,
      duration,
      experienceLevel,
      responsibilities,
      requirements,
      benefits,
      instructor,
      curriculum,
      capacity,
      price,
      currency,
      venue,
      meetingUrl,
      agenda,
      faq,
      rules,
      customQuestions,
      hasPrizePool,
      totalPrizePool,
      prizeCurrency,
      prize1st,
      prize2nd,
      prize3rd,
      prizeSpecial,
      prizeDetails,
    } = body;

    if (!title || !category || !organization || !deadline) {
      return NextResponse.json(
        { error: "Title, category, organization, and deadline are required." },
        { status: 400 }
      );
    }

    // Determine resolved application URL
    const resolvedIsExternal = Boolean(isExternal);
    const finalAppUrl = resolvedIsExternal
      ? (externalUrl?.trim() || applicationUrl?.trim() || "https://nimblux.xyz")
      : (applicationUrl?.trim() || "in-platform");

    // Generate unique slug
    let baseSlug = slugify(`${organization}-${title}`);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.opportunity.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    // Determine opportunity type if not specified
    const determinedType = (opportunityType || category || "OTHER").toUpperCase();

    const newOpportunity = await prisma.opportunity.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        description: body.description || "",
        category: category.toLowerCase().trim(),
        opportunityType: determinedType,
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
        isPaid: Boolean(isPaid || stipend || salary || (price && price.toLowerCase() !== "free")),
        isExternal: resolvedIsExternal,
        externalUrl: resolvedIsExternal ? (externalUrl?.trim() || finalAppUrl) : null,
        applicationUrl: finalAppUrl,
        deadline: new Date(deadline),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        contactInfo: contactInfo?.trim() || null,
        additionalInfo: additionalInfo?.trim() || null,
        department: department?.trim() || null,
        duration: duration?.trim() || null,
        experienceLevel: experienceLevel?.trim() || "ALL",
        responsibilities: responsibilities?.trim() || null,
        requirements: requirements?.trim() || null,
        benefits: benefits?.trim() || null,
        instructor: instructor?.trim() || null,
        curriculum: curriculum?.trim() || null,
        capacity: capacity ? parseInt(capacity) : null,
        price: price?.trim() || null,
        currency: currency?.trim() || prizeCurrency?.trim() || "INR",
        venue: venue?.trim() || null,
        meetingUrl: meetingUrl?.trim() || null,
        agenda: agenda?.trim() || null,
        faq: faq?.trim() || null,
        rules: rules?.trim() || null,
        customQuestions: customQuestions ? (typeof customQuestions === "string" ? customQuestions : JSON.stringify(customQuestions)) : null,
        hasPrizePool: Boolean(hasPrizePool),
        totalPrizePool: totalPrizePool?.trim() || null,
        prizeCurrency: prizeCurrency?.trim() || "INR",
        prize1st: prize1st?.trim() || null,
        prize2nd: prize2nd?.trim() || null,
        prize3rd: prize3rd?.trim() || null,
        prizeSpecial: prizeSpecial?.trim() || null,
        prizeDetails: prizeDetails?.trim() || null,
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
