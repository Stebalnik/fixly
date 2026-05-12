import { buildUrlSet } from "@/lib/seo/sitemapXml";

export async function GET() {
  const xml = buildUrlSet([]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}