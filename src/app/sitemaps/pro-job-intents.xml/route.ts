import {
  getProJobIntentUrl,
  proJobIntents,
} from "@/lib/pro/jobIntents";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

export async function GET() {
  const now = new Date();
  const xml = buildUrlSet(
    proJobIntents.map((intent) => ({
      url: getProJobIntentUrl(intent.slug),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }))
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
