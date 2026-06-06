import type { MetadataRoute } from "next";
import { getParks } from "@/lib/api/parks";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://themeparky.com";

const parkSubPaths = [
  "",
  "/waits",
  "/calendar",
  "/trends",
  "/events",
  "/lightning-lane",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const parks = await getParks();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    {
      url: `${siteUrl}/parks`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/download`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const parkRoutes: MetadataRoute.Sitemap = parks.flatMap((park) =>
    parkSubPaths.map((sub) => ({
      url: `${siteUrl}/parks/${park.park_id}${sub}`,
      lastModified: now,
      changeFrequency: sub === "/waits" ? ("hourly" as const) : ("daily" as const),
      priority: sub === "" ? 0.8 : 0.6,
    })),
  );

  return [...staticRoutes, ...parkRoutes];
}
