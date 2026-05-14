import { getAllMarketsByCountry, getMarketUrlPath } from "@/lib/geo";
import {
  getMarketSeoTier,
  type MarketSeoTier,
} from "@/lib/geo/seo/getMarketSeoTier";
import { legacyServiceRoutes } from "@/lib/services";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

const MAX_URLS_PER_SITEMAP = 10000;

const PRIMARY_SERVICE_LIMIT = 40;
const SECONDARY_SERVICE_LIMIT = 12;
const LONG_TAIL_SERVICE_LIMIT = 3;

function getServiceLimitByTier(tier: MarketSeoTier) {
  if (tier === "primary") return PRIMARY_SERVICE_LIMIT;
  if (tier === "secondary") return SECONDARY_SERVICE_LIMIT;
  return LONG_TAIL_SERVICE_LIMIT;
}

function getPriorityByTier(tier: MarketSeoTier) {
  if (tier === "primary") return 0.8;
  if (tier === "secondary") return 0.6;
  return 0.4;
}

function getGeoEntries(country: string) {
  const now = new Date();

  const markets = getAllMarketsByCountry(country);
  const servicePaths = Object.keys(legacyServiceRoutes);

  return markets.flatMap((market) => {
    const tier = getMarketSeoTier(market);
    const limit = getServiceLimitByTier(tier);
    const marketPath = getMarketUrlPath(market);

    return servicePaths.slice(0, limit).map((servicePath) => ({
      url: `${BASE_URL}${marketPath}/${servicePath}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: getPriorityByTier(tier),
    }));
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ country: string; id: string }> }
) {
  const { country, id } = await params;

  const sitemapId = Number(id.replace(".xml", ""));

  if (Number.isNaN(sitemapId)) {
    return new Response("Invalid sitemap id", { status: 400 });
  }

  const entries = getGeoEntries(country);

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