import { categories } from "@/lib/services/categories";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

const MAX_URLS_PER_SITEMAP = 10000;

function getCategoryEntries(country: string) {
  const now = new Date();

  return Object.values(categories).map((category) => ({
    url: `${BASE_URL}/${country.toLowerCase()}/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ country: string; id: string }> }
) {
  const { country, id } = await params;

  const sitemapId = Number(id.replace(".xml", ""));

  if (Number.isNaN(sitemapId)) {
    return new Response("Invalid sitemap id", {
      status: 400,
    });
  }

  const entries = getCategoryEntries(country);

  const start = sitemapId * MAX_URLS_PER_SITEMAP;
  const end = start + MAX_URLS_PER_SITEMAP;

  const xml = buildUrlSet(entries.slice(start, end));

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}