import type { Market } from "./types";
import { getUsMarkets } from "./us";
import { loadNzMarkets } from "./nz";
import { createCitySlug } from "./utils";

export const DEFAULT_MARKET_SLUG = "atlanta-ga";

function toMarketRecord(marketsList: Market[]): Record<string, Market> {
  return Object.fromEntries(marketsList.map((market) => [market.slug, market]));
}

export const markets: Record<string, Market> = {
  ...getUsMarkets(),
  ...toMarketRecord(loadNzMarkets()),
};

export function getMarketBySlug(slug: string): Market | undefined {
  return markets[slug] ?? Object.values(markets).find((m) => m.slug === slug);
}

export function getDefaultMarket(): Market | undefined {
  return getMarketBySlug(DEFAULT_MARKET_SLUG);
}

export function getMarketByCity(city: string): Market | undefined {
  return Object.values(markets).find(
    (m) => m.city.toLowerCase() === city.toLowerCase()
  );
}

export function getMarketByZip(zip: string): Market | undefined {
  return Object.values(markets).find((m) => m.zip.includes(zip));
}

export function getAllMarkets(): Market[] {
  return Object.values(markets);
}

export function getAllMarketSlugs(): string[] {
  return Object.values(markets).map((m) => m.slug);
}

export function getNearbyMarkets(marketKeyOrSlug: string): Market[] {
  const market =
    markets[marketKeyOrSlug] ??
    Object.values(markets).find((m) => m.slug === marketKeyOrSlug);

  if (!market) return [];

  return market.nearby
    .map((city) => getMarketByCity(city))
    .filter((m): m is Market => m !== undefined);
}

export function getMarketByGlobalPath(params: {
  countryCode: string;
  region: string;
  market: string;
}): Market | undefined {
  return Object.values(markets).find((item) => {
    return (
      item.countryCode.toLowerCase() === params.countryCode.toLowerCase() &&
      item.state.toLowerCase() === params.region.toLowerCase() &&
      createCitySlug(item.city) === params.market.toLowerCase()
    );
  });
}