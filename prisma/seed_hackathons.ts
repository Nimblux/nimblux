import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!user) {
    user = await prisma.user.findFirst();
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Dev Yadav",
        email: "demo@nimblux.xyz",
        passwordHash: "$2b$10$epRfZG9Y7iK0K9C4.5iQ/OC0B8Jc6kZ8fVwKjR01X23456789abcd",
        role: "ADMIN",
        college: "Stanford University",
        degree: "B.S. Computer Science",
        graduationYear: "2026",
        skills: "Next.js, TypeScript, Python, AI/ML, PyTorch",
        githubUrl: "https://github.com",
        linkedinUrl: "https://linkedin.com",
        location: "San Francisco, CA",
        bio: "Builder and engineer passionate about fullstack platforms and AI tools.",
      },
    });
  }

  const existingHackathon = await prisma.hackathon.findUnique({
    where: { slug: "global-ai-builder-hackathon-2026" },
  });

  if (!existingHackathon) {
    console.log("Seeding Global AI Builder Hackathon 2026...");
    const hackathon = await prisma.hackathon.create({
      data: {
        title: "Global AI Builder Hackathon 2026",
        slug: "global-ai-builder-hackathon-2026",
        tagline: "Build cutting-edge autonomous agents and intelligent systems for modern developers",
        shortDescription: "A 48-hour global sprint for students and engineers to create breakthrough autonomous AI applications and compete for ₹2,50,000 in cash prizes and cloud credits.",
        description: `Welcome to the Global AI Builder Hackathon 2026 hosted on NIMBLUX!

This hackathon brings together over 1,000+ ambitious developers, students, and researchers across the globe to architect autonomous systems, developer copilots, generative UI workflows, and real-time AI tools.

### What to Expect:
- **Direct In-Platform Judging**: Projects are scored directly on the NIMBLUX judging portal by leading engineers.
- **Mentorship & Office Hours**: Live technical guidance and AMAs.
- **Comprehensive Tracks**: Pick from Open AI Innovation, Autonomous Agents, Developer Productivity, and Generative UI.
- **Verifiable Credentials**: All participants and winners receive official cryptographically verified NIMBLUX certificates.`,
        coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
        logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80",
        banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80",
        organizerName: "NIMBLUX Engineering Labs",
        organizerLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80",
        organizerDescription: "The official engineering and innovation division of NIMBLUX, empowering student builders worldwide.",
        contactEmail: "hackathons@nimblux.xyz",
        discordUrl: "https://discord.gg/nimblux",
        websiteUrl: "https://nimblux.xyz",
        mode: "ONLINE",
        location: "Virtual / Worldwide",
        regStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        regEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
        submissionDeadline: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
        judgingStartDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        judgingEndDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        winnersAnnouncedDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        eligibility: "Open to all enrolled university students, recent graduates, and self-taught developers worldwide.",
        experienceLevel: "ALL",
        allowIndividual: true,
        allowTeam: true,
        minTeamSize: 1,
        maxTeamSize: 4,
        hasPrizePool: true,
        totalPrizePool: "250000",
        prizeCurrency: "INR",
        rules: "1. All project code and prototypes must be developed during the official hackathon window.\n2. Projects utilizing foundation model APIs (OpenAI, Gemini, Anthropic) are fully allowed.\n3. Plagiarism or submission of pre-existing commercial products will lead to instant disqualification.",
        submissionRequirements: "Submit a public GitHub repository link, a deployed demo URL, and a 2-minute video demonstration.",
        status: "PUBLISHED",
        featured: true,
        verified: true,
        isRegistrationOpen: true,
        createdById: user.id,
        tracks: {
          create: [
            {
              name: "Autonomous Agents & Tool Calling",
              description: "Build autonomous multi-agent workflows that plan, execute actions, and solve multi-step problems.",
              problemStatement: "Architect an autonomous software development or research agent capable of navigating complex workflows.",
              prize: "₹1,00,000 + Cloud Credits",
            },
            {
              name: "Developer Productivity & Copilots",
              description: "Create AI-powered tools that supercharge developer speed, code quality, and debugging.",
              problemStatement: "Build an IDE integration or CLI tool that solves real-time engineering bottlenecks.",
              prize: "₹75,000",
            },
            {
              name: "Generative UI & Human-AI Interfaces",
              description: "Pioneer new paradigms for multimodal and real-time generative user experiences.",
              problemStatement: "Design dynamic interfaces that adapt and render widgets on-the-fly based on user intent.",
              prize: "₹75,000",
            },
          ],
        },
        prizes: {
          create: [
            {
              name: "🥇 1st Place Overall Champion",
              type: "1ST",
              amount: "125000",
              currency: "INR",
              description: "Top team with the highest overall score across technical depth, innovation, and product polish.",
              winnerCount: 1,
              certificateIncluded: true,
              additionalBenefits: "Fast-track VC office hours + $10,000 Cloud credits",
              displayOrder: 1,
            },
            {
              name: "🥈 2nd Place Runner-Up",
              type: "2ND",
              amount: "75000",
              currency: "INR",
              description: "Second highest scoring team.",
              winnerCount: 1,
              certificateIncluded: true,
              additionalBenefits: "Mentorship sessions + Swag pack",
              displayOrder: 2,
            },
            {
              name: "🥉 3rd Place Winner",
              type: "3RD",
              amount: "50000",
              currency: "INR",
              description: "Third place winner team.",
              winnerCount: 1,
              certificateIncluded: true,
              displayOrder: 3,
            },
          ],
        },
        criteria: {
          create: [
            { name: "Technical Execution & Architecture", description: "Code quality, complexity, stability, and proper API utilization", maxScore: 10, weight: 1.0 },
            { name: "Innovation & Problem Solving", description: "Novelty, creative approach, and uniqueness", maxScore: 10, weight: 1.0 },
            { name: "UI/UX & Product Design", description: "Design elegance, user experience, and aesthetic polish", maxScore: 10, weight: 1.0 },
            { name: "Real-World Impact & Utility", description: "Viability, practical usefulness, and market demand", maxScore: 10, weight: 1.0 },
          ],
        },
        sponsors: {
          create: [
            { name: "NIMBLUX Cloud", tier: "TITLE" },
            { name: "DevGuild Global", tier: "PLATINUM" },
            { name: "AI Builder Collective", tier: "GOLD" },
          ],
        },
        announcements: {
          create: [
            {
              title: "Welcome Builders! Registration is officially open 🚀",
              content: "We are thrilled to welcome developers from over 40+ countries. Form your teams, review the tracks, and join our Discord for office hours.",
              pinned: true,
            },
          ],
        },
      },
    });

    const sampleCert = await prisma.hackathonCertificate.create({
      data: {
        certificateCode: "NMB-WIN-8X9Y2Z",
        hackathonId: hackathon.id,
        userId: user.id,
        recipientName: user.name,
        role: "WINNER",
        prizeTitle: "🥇 1st Place Overall Champion",
        issueDate: new Date(),
      },
    });

    console.log("Seeded hackathon successfully:", hackathon.title);
    console.log("Sample certificate code:", sampleCert.certificateCode);
  } else {
    console.log("Sample hackathon already exists.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
