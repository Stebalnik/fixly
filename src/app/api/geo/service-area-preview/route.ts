import { NextResponse } from "next/server";
import { deriveServiceAreaSlugs } from "@/lib/marketplace";
import { getMarketBySlug, getMarketUrlPath } from "@/lib/geo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const homeMarketSlug = (searchParams.get("market") ?? "").trim();
  const radiusMiles = Number.parseInt(searchParams.get("radius") ?? "15", 10);

  if (!homeMarketSlug) {
    return NextResponse.json({
      items: [],
      total: 0,
      message: "Select your hometown to calculate service areas.",
    });
  }

  const slugs = deriveServiceAreaSlugs(homeMarketSlug, radiusMiles);
  const items = slugs
    .map((slug) => {
      const market = getMarketBySlug(slug);
      if (!market) return null;

      return {
        slug: market.slug,
        label: `${market.city}, ${market.state}`,
        countryCode: market.countryCode,
        href: getMarketUrlPath(market),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return NextResponse.json({
    items: items.slice(0, 20),
    total: items.length,
    message: null,
  });
}
