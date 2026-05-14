import { getAllMarketsByCountry, getMarketUrlPath } from "@/lib/geo";
import {
  getMarketSeoTier,
  type MarketSeoTier,
} from "@/lib/geo/seo/getMarketSeoTier";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

const MAX_URLS_PER_SITEMAP = 10000;

function getPriorityByTier(tier: MarketSeoTier) {
  if (tier === "primary") return 0.9;
  if (tier === "secondary") return 0.7;
  return 0.5;
}

function getHubEntries(country: string) {
  const now = new Date();

  const markets = getAllMarketsByCountry(country);

  return markets.map((market) => {
    const tier = getMarketSeoTier(market);

    return {
      url: `${BASE_URL}${getMarketUrlPath(market)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: getPriorityByTier(tier),
    };
  });
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

  const entries = getHubEntries(country);

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