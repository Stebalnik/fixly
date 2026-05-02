import type { Market } from "./types";

export function createCitySlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}

export function getMarketUrlPath(market: Market): string {
  const citySlug = createCitySlug(market.city);
  const regionSlug = market.state.toLowerCase();

  return `/${market.countryCode}/${regionSlug}/${citySlug}`;
}

export function formatLocation(market: Market): string {
  return `${market.city}, ${market.state}`;
}

export function formatLocationFull(market: Market): string {
  return `${market.city}, ${market.stateFull}, ${market.country}`;
}