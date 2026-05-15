import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

export async function GET() {
  const now = new Date();

  const xml = buildUrlSet([
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/book`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/us/requests`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ]);

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}