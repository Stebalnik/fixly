import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

export const dynamic = "force-static";
export const revalidate = 21600;

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
