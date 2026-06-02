import type { MetadataRoute } from "next";
import { getEvents } from "@/lib/db";
import { absoluteUrl, OG_IMAGE_URL } from "@/lib/metadata";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents();
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      images: [OG_IMAGE_URL]
    },
    ...events.map((event) => ({
      url: absoluteUrl(`/events/${event.slug}`),
      lastModified: new Date(event.updated_at || event.created_at || now),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [OG_IMAGE_URL]
    }))
  ];
}
