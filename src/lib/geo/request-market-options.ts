import fs from "fs";
import path from "path";

export type RequestMarketOption = {
  slug: string;
  city: string;
  state: string;
  region: string;
  zip?: string[];
  zips?: string[];
  countryCode: string;
};

const MARKET_OPTIONS_FILE = path.join(
  process.cwd(),
  "src/lib/geo/data/market-options.json"
);

let marketOptionsCache: RequestMarketOption[] | null = null;

function getMarketOptions() {
  if (!marketOptionsCache) {
    marketOptionsCache = JSON.parse(
      fs.readFileSync(MARKET_OPTIONS_FILE, "utf8")
    ) as RequestMarketOption[];
  }

  return marketOptionsCache;
}

export function getRequestMarketOptions(limit = 300): RequestMarketOption[] {
  return getMarketOptions()
    .filter((market) => market.slug && market.city && market.state)
    .slice(0, limit);
}

export function findRequestMarketByCityState(
  citySearch: string
): RequestMarketOption | null {
  const normalized = citySearch.trim().toLowerCase();

  if (!normalized) return null;

  return (
    getMarketOptions().find(
      (market) =>
        `${market.city}, ${market.state}`.toLowerCase() === normalized
    ) ?? null
  );
}

export function getRequestMarketSearchOptions(country: string) {
  const normalizedCountry = country.trim().toLowerCase();
  const options = getMarketOptions();

  if (!normalizedCountry) return options;

  return options.filter(
    (market) => market.countryCode.trim().toLowerCase() === normalizedCountry
  );
}

export function getRequestMarketZips(market: RequestMarketOption) {
  return market.zip ?? market.zips ?? [];
}
