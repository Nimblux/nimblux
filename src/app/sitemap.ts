import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nimblux.com";

  // Base routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/opportunities`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/submit-opportunity`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // Dynamic opportunity routes
  let opportunityRoutes: MetadataRoute.Sitemap = [];
  try {
    const opps = await prisma.opportunity.findMany({
      where: { status: "APPROVED" },
      select: { slug: true, updatedAt: true },
    });

    opportunityRoutes = opps.map((opp) => ({
      url: `${baseUrl}/opportunity/${opp.slug}`,
      lastModified: opp.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {}

  return [...staticRoutes, ...categoryRoutes, ...opportunityRoutes];
}
