import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

export async function GET() {
  const now = new Date();

  const xml = buildUrlSet([
    {
      url: `${BASE_URL}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]);

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}