import { NextResponse } from "next/server";
import marketOptionsJson from "@/lib/geo/data/market-options.json";

type MarketOption = {
  slug: string;
  city: string;
  state: string;
  region: string;
  zip?: string[];
  zips?: string[];
  countryCode: string;
};

const allMarkets = marketOptionsJson as MarketOption[];

function getZips(market: MarketOption) {
  return market.zip ?? market.zips ?? [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const initial = searchParams.get("initial");

  if (initial) {
    const found = allMarkets.find((market) => market.slug === initial);
    return NextResponse.json(found ? [found] : []);
  }

  const results = allMarkets
    .filter((market) => {
      if (!query) return true;

      return (
        market.city.toLowerCase().includes(query) ||
        market.state.toLowerCase().includes(query) ||
        market.region.toLowerCase().includes(query) ||
        getZips(market).some((zip) => zip.includes(query))
      );
    })
    .slice(0, 8)
    .map((market) => ({
      slug: market.slug,
      city: market.city,
      state: market.state,
      region: market.region,
      zip: getZips(market),
      countryCode: market.countryCode,
    }));

  return NextResponse.json(results);
}
