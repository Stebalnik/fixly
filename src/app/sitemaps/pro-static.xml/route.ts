import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://pro.fixly.work";

export async function GET() {
  const now = new Date();
  const xml = buildUrlSet([
    {
      url: `${BASE_URL}/jobs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
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
