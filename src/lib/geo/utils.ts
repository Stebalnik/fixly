import type { Market } from "./types";

export function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createCitySlug(city: string): string {
  return createSlug(city);
}

export function getCountrySlug(market: Market): string {
  return createSlug(market.countryCode);
}

export function getLevel1Slug(market: Market): string {
  return createSlug(market.state);
}

export function getLevel1Name(market: Market): string {
  return market.stateFull || market.state;
}

export function getLevel2Slug(market: Market): string {
  return createSlug(market.region);
}

export function getLevel2Name(market: Market): string {
  return market.region;
}

export function getMarketUrlPath(market: Market): string {
  return `/${getCountrySlug(market)}/${getLevel1Slug(market)}/${createCitySlug(
    market.city
  )}`;
}

export function getLevel1UrlPath(market: Market): string {
  return `/${getCountrySlug(market)}/${getLevel1Slug(market)}`;
}

export function getLevel2UrlPath(market: Market): string {
  return `/${getCountrySlug(market)}/${getLevel1Slug(market)}/${getLevel2Slug(
    market
  )}`;
}

export function formatLocation(market: Market): string {
  return `${market.city}, ${market.state}`;
}

export function formatLocationFull(market: Market): string {
  return `${market.city}, ${getLevel1Name(market)}, ${market.country}`;
}