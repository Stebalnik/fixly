import { NextResponse } from "next/server";
import {
  getAllCountryCodes,
  getAllMarketsByCountry,
  type Market,
} from "@/lib/geo";

type MarketOption = {
  slug: string;
  city: string;
  state: string;
  region: string;
  zip: string[];
  countryCode: string;
};

function toOption(market: Market): MarketOption {
  return {
    slug: market.slug,
    city: market.city,
    state: market.state,
    region: market.region,
    zip: market.zip ?? [],
    countryCode: market.countryCode,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const initial = searchParams.get("initial");

  const allMarkets = getAllCountryCodes().flatMap((country) =>
    getAllMarketsByCountry(country)
  );

  if (initial) {
    const found = allMarkets.find((market) => market.slug === initial);
    return NextResponse.json(found ? [toOption(found)] : []);
  }

  const results = allMarkets
    .filter((market) => {
      if (!query) return true;

      return (
        market.city.toLowerCase().includes(query) ||
        market.state.toLowerCase().includes(query) ||
        market.region.toLowerCase().includes(query) ||
        (market.zip ?? []).some((zip) => zip.includes(query))
      );
    })
    .slice(0, 8)
    .map(toOption);

  return NextResponse.json(results);
}