import { NextResponse } from "next/server";
import { getAllCountryCodes, getAllMarketsByCountry } from "@/lib/geo";
import {
  getCategoryBySlug,
  getSubcategoryBySlug,
  legacyServiceRoutes,
} from "@/lib/services";
import {
  getServiceIntentBySlug,
  isIntentAllowedForService,
  tierOneIntentSlugs,
} from "@/lib/seo/intents";

const CHUNK_SIZE = 5000;

function getActiveCountries() {
  return getAllCountryCodes();
}

function getIntentUrlCount(country: string) {
  const marketCount = getAllMarketsByCountry(country).length;

  const routes = Object.entries(legacyServiceRoutes)
    .map(([path, route]) => ({ ...route, path }))
    .filter((route) => route.type === "subcategory");

  let validRouteIntentCount = 0;

  for (const route of routes) {
    if (!route.subcategorySlug) continue;

    const subcategory = getSubcategoryBySlug(route.subcategorySlug);
    const category = subcategory
      ? getCategoryBySlug(subcategory.parentSlug)
      : null;

    if (!category || !subcategory) continue;

    for (const intentSlug of tierOneIntentSlugs) {
      const intent = getServiceIntentBySlug(intentSlug);

      if (!intent?.indexable) continue;

      const isAllowed = isIntentAllowedForService({
        category,
        subcategory,
        intentSlug,
      });

      if (!isAllowed) continue;

      validRouteIntentCount += 1;
    }
  }

  return marketCount * validRouteIntentCount;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixly.work";
  const urls: string[] = [];

  for (const country of getActiveCountries()) {
    const totalUrls = getIntentUrlCount(country);
    const chunks = Math.ceil(totalUrls / CHUNK_SIZE);

    for (let i = 0; i < chunks; i += 1) {
      urls.push(`${baseUrl}/sitemaps/${country}/intents/${i}.xml`);
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <sitemap>
    <loc>${url}</loc>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}