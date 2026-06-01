import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://materials.fixly.work";

export async function GET() {
  const now = new Date();
  const xml = buildUrlSet([
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/marketplace`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
  ]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
