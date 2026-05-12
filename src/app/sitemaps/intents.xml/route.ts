import { NextResponse } from "next/server";
import { getAllMarkets } from "@/lib/geo";
import {
  getCategoryBySlug,
  getSubcategoryBySlug,
  legacyServiceRoutes,
} from "@/lib/services";
import { tierOneIntentSlugs } from "@/lib/seo/intents";
import { isStrongIntentForService } from "@/lib/seo/intentMappings";

const CHUNK_SIZE = 5000;

function buildIntentUrlCount(country: string) {
  const markets = getAllMarkets().filter(
    (market) => market.countryCode.toLowerCase() === country.toLowerCase()
  );

  const routes = Object.entries(legacyServiceRoutes)
    .map(([path, route]) => ({
      ...route,
      path,
    }))
    .filter((route) => route.type === "subcategory");

  let total = 0;

  for (let i = 0; i < markets.length; i++) {
    for (const route of routes) {
      if (!route.subcategorySlug) continue;

      const subcategory = getSubcategoryBySlug(route.subcategorySlug);

      const category = subcategory
        ? getCategoryBySlug(subcategory.parentSlug)
        : null;

      if (!category || !subcategory) continue;

      for (const intentSlug of tierOneIntentSlugs) {
        const isStrong = isStrongIntentForService({
          category,
          subcategory,
          intentSlug,
        });

        if (!isStrong) continue;

        total += 1;
      }
    }
  }

  return total;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixly.work";

  const countries = ["us"];

  const urls: string[] = [];

  for (const country of countries) {
    const totalUrls = buildIntentUrlCount(country);
    const chunks = Math.ceil(totalUrls / CHUNK_SIZE);

    for (let i = 0; i < chunks; i++) {
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