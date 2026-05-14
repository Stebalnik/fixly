import { getAllMarkets } from "@/lib/geo";
import { getMarketSeoTier } from "@/lib/geo/seo/getMarketSeoTier";
import { categories } from "@/lib/services/categories";

const BASE_URL = "https://fixly.work";

const MAX_URLS_PER_SITEMAP = 10000;

const PRIMARY_SERVICE_LIMIT = 40;
const SECONDARY_SERVICE_LIMIT = 12;
const LONG_TAIL_SERVICE_LIMIT = 3;

type MarketSeoTier = "primary" | "secondary" | "longtail";

function getServiceLimitByTier(tier: MarketSeoTier) {
  if (tier === "primary") return PRIMARY_SERVICE_LIMIT;
  if (tier === "secondary") return SECONDARY_SERVICE_LIMIT;
  return LONG_TAIL_SERVICE_LIMIT;
}

function chunkCount(totalUrls: number) {
  return Math.max(1, Math.ceil(totalUrls / MAX_URLS_PER_SITEMAP));
}

function buildChunkedSitemaps(pathPrefix: string, totalUrls: number) {
  return Array.from({ length: chunkCount(totalUrls) }).map(
    (_, index) => `${pathPrefix}/${index}.xml`
  );
}

function getMarketsByCountry() {
  const marketsByCountry = new Map<string, ReturnType<typeof getAllMarkets>>();

  for (const market of getAllMarkets()) {
    const country = market.countryCode.toLowerCase();
    const current = marketsByCountry.get(country) ?? [];

    marketsByCountry.set(country, [...current, market]);
  }

  return marketsByCountry;
}

function getCountryGeoUrlCount(markets: ReturnType<typeof getAllMarkets>) {
  return markets.reduce((total, market) => {
    const tier = getMarketSeoTier(market);
    return total + getServiceLimitByTier(tier);
  }, 0);
}

function getCountryHubUrlCount(markets: ReturnType<typeof getAllMarkets>) {
  return markets.length;
}

function getCountryStateUrlCount(markets: ReturnType<typeof getAllMarkets>) {
  const stateKeys = new Set(
    markets.map(
      (market) =>
        `${market.countryCode.toLowerCase()}:${market.region.toLowerCase()}`
    )
  );

  return stateKeys.size;
}

function getCountryCategoryUrlCount() {
  return Object.keys(categories).length;
}

function getCountryIntentUrlCount(markets: ReturnType<typeof getAllMarkets>) {
  return markets.length * Object.keys(categories).length;
}

function getCountrySitemaps() {
  const marketsByCountry = getMarketsByCountry();

  return Array.from(marketsByCountry.entries()).flatMap(
    ([country, markets]) => {
      const geoCount = getCountryGeoUrlCount(markets);
      const hubCount = getCountryHubUrlCount(markets);
      const stateCount = getCountryStateUrlCount(markets);
      const categoryCount = getCountryCategoryUrlCount();
      const intentCount = getCountryIntentUrlCount(markets);

      return [
        ...buildChunkedSitemaps(`/sitemaps/${country}/geo`, geoCount),
        ...buildChunkedSitemaps(`/sitemaps/${country}/hubs`, hubCount),
        ...buildChunkedSitemaps(`/sitemaps/${country}/states`, stateCount),
        ...buildChunkedSitemaps(
          `/sitemaps/${country}/categories`,
          categoryCount
        ),
        ...buildChunkedSitemaps(`/sitemaps/${country}/intents`, intentCount),
      ];
    }
  );
}

export async function GET() {
  const now = new Date().toISOString();

  const sitemaps = [
    "/sitemaps/static.xml",
    "/sitemaps/categories.xml",
    "/sitemaps/subcategories.xml",
    "/sitemaps/requests.xml",
    "/sitemaps/profiles.xml",
    "/sitemaps/intents.xml",
    ...getCountrySitemaps(),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (path) => `  <sitemap>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}