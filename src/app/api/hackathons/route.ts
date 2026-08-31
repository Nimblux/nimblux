import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { calculateTotalPrizePool } from "@/lib/hackathon";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const mode = searchParams.get("mode");
    const status = searchParams.get("status") || "PUBLISHED";
    const sort = searchParams.get("sort") || "latest";
    const featured = searchParams.get("featured");
    const prizePool = searchParams.get("prizePool"); // e.g. "hasPrize"
    const regStatus = searchParams.get("regStatus"); // "open", "closed"
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const currentUser = await getCurrentUser();

    // Query builder
    const where: any = {};

    if (status === "PUBLISHED") {
      where.status = { in: ["PUBLISHED", "APPROVED", "COMPLETED"] };
    } else if (status && status !== "ALL") {
      where.status = status.toUpperCase();
    }

    if (mode && mode !== "all") {
      where.mode = mode.toUpperCase();
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (prizePool === "true" || prizePool === "hasPrize") {
      where.hasPrizePool = true;
    }

    const now = new Date();
    if (regStatus === "open") {
      where.isRegistrationOpen = true;
      where.regEndDate = { gte: now };
    } else if (regStatus === "endingSoon") {
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      where.isRegistrationOpen = true;
      where.regEndDate = { gte: now, lte: threeDaysFromNow };
    } else if (regStatus === "closed") {
      where.OR = [
        { isRegistrationOpen: false },
        { regEndDate: { lt: now } },
      ];
    }

    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { shortDescription: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { organizerName: { contains: term, mode: "insensitive" } },
        { location: { contains: term, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "deadline" || sort === "regEndDate") {
      orderBy = { regEndDate: "asc" };
    } else if (sort === "startDate") {
      orderBy = { startDate: "asc" };
    } else if (sort === "featured") {
      orderBy = [{ featured: "desc" }, { createdAt: "desc" }];
    } else if (sort === "popular") {
      orderBy = { viewsCount: "desc" };
    }

    const hackathons = await prisma.hackathon.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        tracks: {
          select: { id: true, name: true, icon: true, prize: true },
        },
        prizes: {
          select: { id: true, name: true, type: true, amount: true, currency: true, winnerCount: true },
          orderBy: { displayOrder: "asc" },
        },
        sponsors: {
          select: { id: true, name: true, logo: true, tier: true },
        },
        _count: {
          select: {
            registrations: true,
            teams: true,
            submissions: true,
          },
        },
      },
    });

    // Check if current user is registered for any of these
    let userRegisteredIds = new Set<string>();
    if (currentUser) {
      const userRegs = await prisma.hackathonRegistration.findMany({
        where: { userId: currentUser.id },
        select: { hackathonId: true },
      });
      userRegisteredIds = new Set(userRegs.map((r) => r.hackathonId));
    }

    const enriched = hackathons.map((h) => ({
      ...h,
      isUserRegistered: userRegisteredIds.has(h.id),
      registrationCount: h._count.registrations,
      teamCount: h._count.teams,
      submissionCount: h._count.submissions,
    }));

    return NextResponse.json({ hackathons: enriched, count: enriched.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch hackathons." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to create or organize a hackathon." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title,
      tagline,
      shortDescription,
      description,
      coverImage,
      logo,
      banner,
      organizerName,
      organizerLogo,
      organizerDescription,
      contactEmail,
      contactPhone,
      websiteUrl,
      discordUrl,
      mode = "ONLINE",
      location = "Online / Global",
      eligibility,
      collegeRestrictions,
      countryRestrictions,
      experienceLevel = "ALL",
      allowIndividual = true,
      allowTeam = true,
      minTeamSize = 1,
      maxTeamSize = 4,
      isExternalRegistration = false,
      externalRegistrationUrl,
      registrationFee = "Free",
      isPaid = false,
      regStartDate,
      regEndDate,
      startDate,
      endDate,
      submissionDeadline,
      judgingStartDate,
      judgingEndDate,
      winnersAnnouncedDate,
      rules,
      submissionRequirements,
      codeOfConduct,
      techAllowed,
      techProhibited,
      hasPrizePool = true,
      totalPrizePool,
      prizeCurrency = "INR",
      tracks = [],
      prizes = [],
      judgingCriteria = [],
      sponsors = [],
      isDraft = false,
    } = body;

    if (!title || !shortDescription || !organizerName || !regEndDate || !startDate || !endDate || !submissionDeadline) {
      return NextResponse.json(
        { error: "Title, description, organizer name, schedule dates and submission deadline are required." },
        { status: 400 }
      );
    }

    // Auto-generate unique slug
    let baseSlug = slugify(title);
    let uniqueSlug = baseSlug;
    let count = 1;
    while (await prisma.hackathon.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`;
    }

    // Calculate dynamic total prize pool if not provided or to guarantee precision
    const computedTotal = calculateTotalPrizePool(prizes);
    const resolvedTotalPrizePool = totalPrizePool || (computedTotal > 0 ? String(computedTotal) : null);

    // Initial status: DRAFT or PENDING (for Admin moderation approval)
    const initialStatus = isDraft ? "DRAFT" : (user.role === "ADMIN" ? "PUBLISHED" : "PENDING");

    const newHackathon = await prisma.hackathon.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        tagline: tagline?.trim() || null,
        shortDescription: shortDescription.trim(),
        description: description || shortDescription,
        coverImage: coverImage?.trim() || null,
        logo: logo?.trim() || organizerLogo?.trim() || null,
        banner: banner?.trim() || null,
        organizerName: organizerName.trim(),
        organizerLogo: organizerLogo?.trim() || null,
        organizerDescription: organizerDescription?.trim() || null,
        contactEmail: contactEmail?.trim() || user.email,
        contactPhone: contactPhone?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        discordUrl: discordUrl?.trim() || null,
        mode: mode.toUpperCase(),
        location: location?.trim() || "Online / Remote",
        eligibility: eligibility?.trim() || null,
        collegeRestrictions: collegeRestrictions?.trim() || null,
        countryRestrictions: countryRestrictions?.trim() || null,
        experienceLevel: experienceLevel.toUpperCase(),
        allowIndividual: Boolean(allowIndividual),
        allowTeam: Boolean(allowTeam),
        minTeamSize: parseInt(String(minTeamSize)) || 1,
        maxTeamSize: parseInt(String(maxTeamSize)) || 4,
        isExternalRegistration: Boolean(isExternalRegistration),
        externalRegistrationUrl: externalRegistrationUrl?.trim() || null,
        registrationFee: registrationFee?.trim() || "Free",
        isPaid: Boolean(isPaid),
        regStartDate: regStartDate ? new Date(regStartDate) : new Date(),
        regEndDate: new Date(regEndDate),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        submissionDeadline: new Date(submissionDeadline),
        judgingStartDate: judgingStartDate ? new Date(judgingStartDate) : null,
        judgingEndDate: judgingEndDate ? new Date(judgingEndDate) : null,
        winnersAnnouncedDate: winnersAnnouncedDate ? new Date(winnersAnnouncedDate) : null,
        rules: rules?.trim() || null,
        submissionRequirements: submissionRequirements?.trim() || null,
        codeOfConduct: codeOfConduct?.trim() || null,
        techAllowed: techAllowed?.trim() || null,
        techProhibited: techProhibited?.trim() || null,
        hasPrizePool: Boolean(hasPrizePool),
        totalPrizePool: resolvedTotalPrizePool,
        prizeCurrency: prizeCurrency.toUpperCase(),
        status: initialStatus,
        createdById: user.id,
        approvedById: user.role === "ADMIN" ? user.id : null,
        
        // Nested Tracks
        tracks: {
          create: tracks.map((t: any) => ({
            name: t.name.trim(),
            description: t.description?.trim() || null,
            problemStatement: t.problemStatement?.trim() || null,
            prize: t.prize?.trim() || null,
            icon: t.icon?.trim() || null,
          })),
        },

        // Nested Prizes
        prizes: {
          create: prizes.map((p: any, idx: number) => ({
            name: p.name.trim(),
            type: p.type || "1ST",
            amount: p.amount ? String(p.amount) : null,
            currency: p.currency || prizeCurrency || "INR",
            description: p.description?.trim() || null,
            winnerCount: parseInt(p.winnerCount) || 1,
            sponsor: p.sponsor?.trim() || null,
            physicalReward: p.physicalReward?.trim() || null,
            certificateIncluded: p.certificateIncluded !== false,
            additionalBenefits: p.additionalBenefits?.trim() || null,
            displayOrder: idx,
          })),
        },

        // Nested Judging Criteria
        criteria: {
          create: (judgingCriteria.length > 0
            ? judgingCriteria
            : [
                { name: "Innovation", description: "Novelty, uniqueness, and creativity of the solution", maxScore: 10, weight: 1.0 },
                { name: "Technical Implementation", description: "Architecture, code quality, stability, and completion", maxScore: 10, weight: 1.0 },
                { name: "UI & Design", description: "User experience, visual polish, and usability", maxScore: 10, weight: 1.0 },
                { name: "Impact & Scalability", description: "Market potential, real-world utility, and viability", maxScore: 10, weight: 1.0 },
              ]
          ).map((c: any) => ({
            name: c.name.trim(),
            description: c.description?.trim() || null,
            maxScore: parseInt(c.maxScore) || 10,
            weight: parseFloat(c.weight) || 1.0,
          })),
        },

        // Nested Sponsors
        sponsors: {
          create: sponsors.map((s: any) => ({
            name: s.name.trim(),
            logo: s.logo?.trim() || null,
            websiteUrl: s.websiteUrl?.trim() || null,
            tier: s.tier || "GOLD",
            description: s.description?.trim() || null,
          })),
        },
      },
      include: {
        tracks: true,
        prizes: true,
        criteria: true,
        sponsors: true,
      },
    });

    // Notify User
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: isDraft ? "Hackathon Draft Saved 📝" : "Hackathon Submitted for Review ⏳",
        message: isDraft
          ? `Your hackathon draft "${title}" has been saved.`
          : `Your hackathon "${title}" is now pending admin approval before publishing.`,
        type: "HACKATHON",
        link: `/organizer/hackathons/${newHackathon.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      hackathon: newHackathon,
      message: isDraft
        ? "Draft saved successfully."
        : "Hackathon submitted for review! It will be live once approved by NIMBLUX moderators.",
    });
  } catch (error: any) {
    console.error("Error creating hackathon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create hackathon." },
      { status: 500 }
    );
  }
}
