import { getAllMarkets } from "@/lib/geo";
import { getUsCitySeeds } from "@/lib/geo/us";

const BASE_URL = "https://fixly.work";

const MAX_URLS_PER_SITEMAP = 40000;

const PRIMARY_SERVICE_LIMIT = 40;
const SECONDARY_SERVICE_LIMIT = 12;
const LONG_TAIL_SERVICE_LIMIT = 3;

function getCountryGeoSitemaps() {
  const seedsBySlug = new Map(
    getUsCitySeeds().map((seed) => [
      `${seed.key}-${seed.state.toLowerCase()}`,
      seed,
    ])
  );

  const urlsByCountry = new Map<string, number>();

  for (const market of getAllMarkets()) {
    const country = market.countryCode.toLowerCase();
    const seed = seedsBySlug.get(market.slug);

    const limit =
      seed?.seoTier === "primary"
        ? PRIMARY_SERVICE_LIMIT
        : seed?.seoTier === "secondary"
          ? SECONDARY_SERVICE_LIMIT
          : LONG_TAIL_SERVICE_LIMIT;

    urlsByCountry.set(country, (urlsByCountry.get(country) ?? 0) + limit);
  }

  return Array.from(urlsByCountry.entries()).flatMap(([country, count]) => {
    const sitemapCount = Math.ceil(count / MAX_URLS_PER_SITEMAP);

    return Array.from({ length: sitemapCount }).map(
      (_, index) => `/sitemaps/${country}/geo/${index}.xml`
    );
  });
}

export async function GET() {
  const now = new Date().toISOString();

  const sitemaps = [
    "/sitemaps/static.xml",
    "/sitemaps/services.xml",
    "/sitemaps/categories.xml",
    "/sitemaps/subcategories.xml",
    "/sitemaps/requests.xml",

    ...getCountryGeoSitemaps(),
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
    },
  });
}