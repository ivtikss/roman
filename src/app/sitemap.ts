import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable || !siteUrl) return [];

  return [
    {
      url: `${siteUrl}/`,
      images: [
        `${siteUrl}/assets/og-caramel.jpg`,
        `${siteUrl}/assets/hero-line.webp`,
      ],
    },
  ];
}
