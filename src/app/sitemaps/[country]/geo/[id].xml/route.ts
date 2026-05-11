import { getAllMarkets, getMarketUrlPath } from "@/lib/geo";
import { getUsCitySeeds } from "@/lib/geo/us";
import { legacyServiceRoutes } from "@/lib/services";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

const MAX_URLS_PER_SITEMAP = 40000;

const PRIMARY_SERVICE_LIMIT = 40;
const SECONDARY_SERVICE_LIMIT = 12;
const LONG_TAIL_SERVICE_LIMIT = 3;

function getGeoEntries(country: string) {
  const now = new Date();

  const markets = getAllMarkets().filter(
    (market) => market.countryCode.toLowerCase() === country.toLowerCase()
  );

  const seedsBySlug = new Map(
    getUsCitySeeds().map((seed) => [
      `${seed.key}-${seed.state.toLowerCase()}`,
      seed,
    ])
  );

  const servicePaths = Object.keys(legacyServiceRoutes);

  return markets.flatMap((market) => {
    const seed = seedsBySlug.get(market.slug);

    const limit =
      seed?.seoTier === "primary"
        ? PRIMARY_SERVICE_LIMIT
        : seed?.seoTier === "secondary"
          ? SECONDARY_SERVICE_LIMIT
          : LONG_TAIL_SERVICE_LIMIT;

    const marketPath = getMarketUrlPath(market);

    return servicePaths.slice(0, limit).map((servicePath) => ({
      url: `${BASE_URL}${marketPath}/${servicePath}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority:
        seed?.seoTier === "primary"
          ? 0.8
          : seed?.seoTier === "secondary"
            ? 0.6
            : 0.4,
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
    },
  });
}