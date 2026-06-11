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

function normalizeCountry(value: string) {
  return value.trim().toLowerCase();
}

function normalizeMarketCountry(market: MarketOption) {
  return market.countryCode.trim().toLowerCase();
}

function toResponseOption(market: MarketOption) {
  return {
    slug: market.slug,
    city: market.city,
    state: market.state,
    region: market.region,
    zip: getZips(market),
    countryCode: market.countryCode,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const initial = searchParams.get("initial");
  const country = normalizeCountry(searchParams.get("country") ?? "");

  const countryMarkets = country
    ? allMarkets.filter((market) => normalizeMarketCountry(market) === country)
    : allMarkets;

  if (initial) {
    const found = countryMarkets.find((market) => market.slug === initial);
    return NextResponse.json(found ? [toResponseOption(found)] : []);
  }

  const results = countryMarkets
    .filter((market) => {
      if (!query) return true;

      return (
        market.city.toLowerCase().includes(query) ||
        market.state.toLowerCase().includes(query) ||
        market.region.toLowerCase().includes(query) ||
        getZips(market).some((zip) => zip.toLowerCase().includes(query))
      );
    })
    .slice(0, 8)
    .map(toResponseOption);

  return NextResponse.json(results);
}