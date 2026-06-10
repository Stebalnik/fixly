import { getAllCountryCodes } from "@/lib/geo";
import { getMarketIndex } from "@/lib/geo/server-data";
import { categories } from "@/lib/services/categories";
import { getSubcategoryBySlug } from "@/lib/services/subcategories";
import {
  getIndexableServiceIntents,
  isIntentAllowedForService,
} from "@/lib/seo/intents";

const BASE_URL = "https://fixly.work";
const PRO_BASE_URL = "https://pro.fixly.work";
const MATERIALS_BASE_URL = "https://materials.fixly.work";

export const dynamic = "force-static";
export const revalidate = 21600;

const MAX_URLS_PER_SITEMAP = 10000;
const INTENT_URLS_PER_SITEMAP = 5000;
const SITEMAP_INDEX_CACHE_MS = 6 * 60 * 60 * 1000;

const PRIMARY_SERVICE_LIMIT = 40;
const SECONDARY_SERVICE_LIMIT = 12;
const LONG_TAIL_SERVICE_LIMIT = 3;

type MarketSeoTier = "primary" | "secondary" | "longtail";

type MarketIndexSummary = {
  countryCode: string;
  regionSlug: string;
  population?: number;
};

type SitemapIndexCacheEntry = {
  body: string;
  cachedAt: number;
};

let countryMarketSummaryCache: Map<string, MarketIndexSummary[]> | null = null;
const sitemapIndexCache = new Map<string, SitemapIndexCacheEntry>();

function getServiceLimitByTier(tier: MarketSeoTier) {
  if (tier === "primary") return PRIMARY_SERVICE_LIMIT;
  if (tier === "secondary") return SECONDARY_SERVICE_LIMIT;
  return LONG_TAIL_SERVICE_LIMIT;
}

function getMarketSeoTierFromSummary(market: MarketIndexSummary): MarketSeoTier {
  const population = market.population ?? 0;

  if (population >= 500000) return "primary";
  if (population >= 100000) return "secondary";

  return "longtail";
}

function chunkCount(totalUrls: number) {
  return Math.max(1, Math.ceil(totalUrls / MAX_URLS_PER_SITEMAP));
}

function buildChunkedSitemaps(pathPrefix: string, totalUrls: number) {
  return Array.from({ length: chunkCount(totalUrls) }).map(
    (_, index) => `${pathPrefix}/${index}.xml`
  );
}

function buildSizedChunkedSitemaps(
  pathPrefix: string,
  totalUrls: number,
  chunkSize: number
) {
  const totalChunks = Math.max(1, Math.ceil(totalUrls / chunkSize));

  return Array.from({ length: totalChunks }).map(
    (_, index) => `${pathPrefix}/${index}.xml`
  );
}

function getCountryMarketSummaries(country: string) {
  if (!countryMarketSummaryCache) {
    const summaries = new Map<string, MarketIndexSummary[]>();

    for (const market of Object.values(getMarketIndex())) {
      const countryCode = market.countryCode.toLowerCase();
      const countrySummaries = summaries.get(countryCode) ?? [];

      countrySummaries.push({
        countryCode,
        regionSlug: market.regionSlug,
        population: market.population,
      });
      summaries.set(countryCode, countrySummaries);
    }

    countryMarketSummaryCache = summaries;
  }

  return countryMarketSummaryCache.get(country.toLowerCase()) ?? [];
}

function getCountryGeoUrlCount(markets: MarketIndexSummary[]) {
  return markets.reduce((total, market) => {
    const tier = getMarketSeoTierFromSummary(market);
    return total + getServiceLimitByTier(tier);
  }, 0);
}

function getCountryHubUrlCount(markets: MarketIndexSummary[]) {
  return markets.length;
}

function getCountryStateUrlCount(markets: MarketIndexSummary[]) {
  const stateKeys = new Set(
    markets.map(
      (market) =>
        `${market.countryCode.toLowerCase()}:${market.regionSlug.toLowerCase()}`
    )
  );

  return stateKeys.size;
}

function getCountryCategoryUrlCount() {
  return Object.keys(categories).length;
}

function getCountryIntentUrlCount(marketCount: number) {
  const intents = getIndexableServiceIntents();
  let serviceIntentCount = 0;

  for (const category of Object.values(categories)) {
    for (const intent of intents) {
      if (
        isIntentAllowedForService({
          category,
          intentSlug: intent.slug,
        })
      ) {
        serviceIntentCount += 1;
      }
    }

    for (const subcategorySlug of category.subcategories) {
      const subcategory = getSubcategoryBySlug(subcategorySlug);

      if (!subcategory) continue;

      for (const intent of intents) {
        if (
          isIntentAllowedForService({
            category,
            subcategory,
            intentSlug: intent.slug,
          })
        ) {
          serviceIntentCount += 1;
        }
      }
    }
  }

  return marketCount * serviceIntentCount;
}

function getCountrySitemaps() {
  return getAllCountryCodes().flatMap((country) => {
    const markets = getCountryMarketSummaries(country);

    const geoCount = getCountryGeoUrlCount(markets);
    const hubCount = getCountryHubUrlCount(markets);
    const stateCount = getCountryStateUrlCount(markets);
    const categoryCount = getCountryCategoryUrlCount();
    const intentCount = getCountryIntentUrlCount(markets.length);

    return [
      ...buildChunkedSitemaps(`/sitemaps/${country}/geo`, geoCount),
      ...buildChunkedSitemaps(`/sitemaps/${country}/hubs`, hubCount),
      ...buildChunkedSitemaps(`/sitemaps/${country}/states`, stateCount),
      ...buildChunkedSitemaps(`/sitemaps/${country}/categories`, categoryCount),
      ...buildSizedChunkedSitemaps(
        `/sitemaps/${country}/intents`,
        intentCount,
        INTENT_URLS_PER_SITEMAP
      ),
    ];
  });
}

function getHost(request: Request) {
  return (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
}

function buildSitemapIndex(baseUrl: string, sitemaps: string[]) {
  const now = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (path) => `  <sitemap>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;
}

function getCachedSitemapIndex(host: string, build: () => string) {
  const cached = sitemapIndexCache.get(host);
  const now = Date.now();

  if (cached && now - cached.cachedAt < SITEMAP_INDEX_CACHE_MS) {
    return cached.body;
  }

  const body = build();
  sitemapIndexCache.set(host, {
    body,
    cachedAt: now,
  });

  return body;
}

export async function GET(request: Request) {
  const host = getHost(request);

  if (host === "pro.fixly.work") {
    const xml = getCachedSitemapIndex(host, () =>
      buildSitemapIndex(PRO_BASE_URL, [
        "/sitemaps/pro-static.xml",
        "/sitemaps/pro-jobs.xml",
        "/sitemaps/pro-job-seo.xml",
        "/sitemaps/pro-job-intents.xml",
        "/sitemaps/profiles.xml",
      ])
    );

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  }

  if (host === "materials.fixly.work") {
    const xml = getCachedSitemapIndex(host, () =>
      buildSitemapIndex(MATERIALS_BASE_URL, [
        "/sitemaps/materials-static.xml",
        "/sitemaps/materials-listings.xml",
      ])
    );

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  }

  const xml = getCachedSitemapIndex(host || "default", () => {
    const sitemaps = [
      "/sitemaps/static.xml",
      "/sitemaps/categories.xml",
      "/sitemaps/subcategories.xml",
      "/sitemaps/requests.xml",
      "/sitemaps/intents.xml",
      "/sitemaps/generated-pages.xml",
      ...getCountrySitemaps(),
    ];

    return buildSitemapIndex(BASE_URL, sitemaps);
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
