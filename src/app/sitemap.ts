import type { MetadataRoute } from "next";
import { getAllMarkets, getMarketUrlPath } from "@/lib/geo";
import { getUsCitySeeds } from "@/lib/geo/us";
import { legacyServiceRoutes } from "@/lib/services";

const BASE_URL = "https://fixly.work";

const PRIMARY_SERVICE_LIMIT = 40;
const SECONDARY_SERVICE_LIMIT = 12;
const LONG_TAIL_SERVICE_LIMIT = 3;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/book`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/requests`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const markets = getAllMarkets();
  const seedsBySlug = new Map(
    getUsCitySeeds().map((seed) => [
      `${seed.key}-${seed.state.toLowerCase()}`,
      seed,
    ])
  );

  const servicePaths = Object.keys(legacyServiceRoutes);

  const geoServicePages = markets.flatMap((market) => {
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

  return [...staticPages, ...geoServicePages];
}