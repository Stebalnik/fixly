import {
  getRequestMarketSearchOptions,
  getRequestMarketZips,
  type RequestMarketOption,
} from "@/lib/geo/request-market-options";

function normalizeCountry(value: string) {
  return value.trim().toLowerCase();
}

function toResponseOption(market: RequestMarketOption) {
  return {
    slug: market.slug,
    city: market.city,
    state: market.state,
    region: market.region,
    zip: getRequestMarketZips(market),
    countryCode: market.countryCode,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const initial = searchParams.get("initial");
  const country = normalizeCountry(searchParams.get("country") ?? "");

  const countryMarkets = getRequestMarketSearchOptions(country);

  if (initial) {
    const found = countryMarkets.find((market) => market.slug === initial);
    return Response.json(found ? [toResponseOption(found)] : []);
  }

  const results = countryMarkets
    .filter((market) => {
      if (!query) return true;

      return (
        market.city.toLowerCase().includes(query) ||
        market.state.toLowerCase().includes(query) ||
        market.region.toLowerCase().includes(query) ||
        getRequestMarketZips(market).some((zip) =>
          zip.toLowerCase().includes(query)
        )
      );
    })
    .slice(0, 8)
    .map(toResponseOption);

  return Response.json(results);
}
