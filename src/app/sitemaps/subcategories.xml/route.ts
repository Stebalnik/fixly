import { legacyServiceRoutes } from "@/lib/services";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

export async function GET() {
  const now = new Date();

  const entries = Object.entries(legacyServiceRoutes)
    .filter(([, route]) => route.type === "subcategory")
    .map(([path]) => ({
      url: `${BASE_URL}/${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  const xml = buildUrlSet(entries);

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}