import { NextResponse } from "next/server";
import { getAllMarkets, getMarketUrlPath } from "@/lib/geo";
import { categories } from "@/lib/services/categories";
import { getSubcategoryBySlug } from "@/lib/services";
import {
  getIndexableServiceIntents,
  isIntentAllowedForService,
} from "@/lib/seo/intents";

const CHUNK_SIZE = 5000;

function parsePageId(value: string) {
  const normalized = value.replace(/\.xml$/, "");
  const page = Number(normalized);

  if (!Number.isInteger(page) || page < 0) return null;

  return page;
}

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
  const page = parsePageId(id);

  if (page === null) {
    return new NextResponse("Not found", { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixly.work";
  const start = page * CHUNK_SIZE;
  const end = start + CHUNK_SIZE;

  let seen = 0;
  const chunk: string[] = [];

  const markets = getAllMarkets()
    .filter(
      (market) =>
        market.countryCode.toLowerCase() === country.toLowerCase()
    )
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const intents = getIndexableServiceIntents();

  for (const market of markets) {
    const marketPath = getMarketUrlPath(market);

    for (const category of Object.values(categories)) {
      for (const intent of intents) {
        if (
          isIntentAllowedForService({
            category,
            intentSlug: intent.slug,
          })
        ) {
          const url = `${baseUrl}${marketPath}/${category.slug}/${intent.slug}`;

          if (seen >= start && seen < end) {
            chunk.push(url);
          }

          seen += 1;

          if (seen >= end) {
            return new NextResponse(xml(chunk), {
              headers: {
                "Content-Type": "application/xml",
              },
            });
          }
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
            const url = `${baseUrl}${marketPath}/${category.slug}/${subcategory.slug}/${intent.slug}`;

            if (seen >= start && seen < end) {
              chunk.push(url);
            }

            seen += 1;

            if (seen >= end) {
              return new NextResponse(xml(chunk), {
                headers: {
                  "Content-Type": "application/xml",
                },
              });
            }
          }
        }
      }
    }
  }

  if (!chunk.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(xml(chunk), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}