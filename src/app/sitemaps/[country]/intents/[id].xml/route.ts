import { NextResponse } from "next/server";
import { getAllMarkets, getMarketUrlPath } from "@/lib/geo";
import {
  getCategoryBySlug,
  getSubcategoryBySlug,
  legacyServiceRoutes,
} from "@/lib/services";
import { tierOneIntentSlugs } from "@/lib/seo/intents";
import { isStrongIntentForService } from "@/lib/seo/intentMappings";

const CHUNK_SIZE = 5000;

function xml(urls: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ country: string; id: string }> }
) {
  const { country, id } = await params;
  const page = Number(id);

  if (!Number.isInteger(page) || page < 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixly.work";

  const markets = getAllMarkets().filter(
    (market) => market.countryCode.toLowerCase() === country.toLowerCase()
  );

  const routes = Object.entries(legacyServiceRoutes)
    .map(([path, route]) => ({
      ...route,
      path,
    }))
    .filter((route) => route.type === "subcategory");

  const urls: string[] = [];

  for (const market of markets) {
    for (const route of routes) {
      if (!route.subcategorySlug) continue;

      const subcategory = getSubcategoryBySlug(route.subcategorySlug);
      const category = subcategory
        ? getCategoryBySlug(subcategory.parentSlug)
        : null;

      if (!category || !subcategory) continue;

      for (const intentSlug of tierOneIntentSlugs) {
        const isStrongIntent = isStrongIntentForService({
          category,
          subcategory,
          intentSlug,
        });

        if (!isStrongIntent) continue;

        urls.push(
          `${baseUrl}${getMarketUrlPath(market)}/${route.path}/${intentSlug}`
        );
      }
    }
  }

  const chunk = urls.slice(page * CHUNK_SIZE, (page + 1) * CHUNK_SIZE);

  if (!chunk.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(xml(chunk), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}