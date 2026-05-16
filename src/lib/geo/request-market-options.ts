import marketOptionsJson from "@/lib/geo/data/market-options.json";

export type RequestMarketOption = {
  slug: string;
  city: string;
  state: string;
  countryCode: string;
};

const marketOptions = marketOptionsJson as RequestMarketOption[];

export function getRequestMarketOptions(limit = 300): RequestMarketOption[] {
  return marketOptions
    .filter((market) => market.slug && market.city && market.state)
    .slice(0, limit);
}

export function findRequestMarketByCityState(
  citySearch: string
): RequestMarketOption | null {
  const normalized = citySearch.trim().toLowerCase();

  if (!normalized) return null;

  return (
    marketOptions.find(
      (market) =>
        `${market.city}, ${market.state}`.toLowerCase() === normalized
    ) ?? null
  );
}
