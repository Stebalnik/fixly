import { getAllMarketsByCountry, getLevel1Slug } from "@/lib/geo";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

const MAX_URLS_PER_SITEMAP = 10000;

type StateEntry = {
  country: string;
  level1: string;
};

function getUniqueStates(country: string): StateEntry[] {
  const unique = new Map<string, StateEntry>();

  for (const market of getAllMarketsByCountry(country)) {
    if (market.countryCode.toLowerCase() !== country.toLowerCase()) {
      continue;
    }

    const countrySlug = market.countryCode.toLowerCase();
    const level1Slug = getLevel1Slug(market);
    const key = `${countrySlug}-${level1Slug}`;

    if (!unique.has(key)) {
      unique.set(key, {
        country: countrySlug,
        level1: level1Slug,
      });
    }
  }

  return Array.from(unique.values());
}

function getStateEntries(country: string) {
  const now = new Date();

  return getUniqueStates(country).map((state) => ({
    url: `${BASE_URL}/${state.country}/${state.level1}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
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

  const entries = getStateEntries(country);

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