import type { GeoRelationOptions, Market } from "./types";
import { curatedMarketRelations } from "./relations/curated-market-relations";
import {
  getAllCountryCodesFromIndex,
  getAllMarketsFromFiles,
  getAllMarketSlugsFromFiles,
  getMarketByGlobalPathFromFiles,
  getMarketBySlugFromFiles,
  getMarketByZipFromFiles,
  getMarketsByCountryFromFiles,
} from "./server-data";

export const DEFAULT_MARKET_SLUG = "atlanta-ga";

export function getMarketBySlug(slug: string): Market | undefined {
  return getMarketBySlugFromFiles(slug);
}

export function getDefaultMarket(): Market | undefined {
  return getMarketBySlug(DEFAULT_MARKET_SLUG);
}

export function getMarketByCity(city: string): Market | undefined {
  return getAllMarketsFromFiles().find(
    (market) => market.city.toLowerCase() === city.toLowerCase()
  );
}

export function getMarketByZip(zip: string): Market | undefined {
  return getMarketByZipFromFiles(zip);
}

export function getAllMarkets(): Market[] {
  return getAllMarketsFromFiles();
}

export function getAllMarketsByCountry(countryCode: string): Market[] {
  return getMarketsByCountryFromFiles(countryCode);
}

export function getAllCountryCodes(): string[] {
  return getAllCountryCodesFromIndex();
}

export function getAllMarketSlugs(): string[] {
  return getAllMarketSlugsFromFiles();
}

type Neighborhood = NonNullable<
  NonNullable<Market["relations"]>["neighborhoods"]
>[number];

function uniqueMarkets(items: Market[]): Market[] {
  return Array.from(new Map(items.map((item) => [item.slug, item])).values());
}

function uniqueSlugs(items: string[]): string[] {
  return Array.from(new Set(items));
}

function uniqueNeighborhoods(items: Neighborhood[] = []): Neighborhood[] {
  return Array.from(new Map(items.map((item) => [item.slug, item])).values());
}

function isSameCountryAndState(a: Market, b: Market): boolean {
  return (
    a.countryCode.toLowerCase() === b.countryCode.toLowerCase() &&
    a.state.toLowerCase() === b.state.toLowerCase()
  );
}

function resolveMarketSlugs(
  currentMarket: Market,
  slugs: string[],
  options: GeoRelationOptions = {}
): Market[] {
  const sameStateFirst = options.sameStateFirst ?? true;
  const allowCrossBorder = options.allowCrossBorder ?? false;
  const limit = options.limit ?? slugs.length;

  const resolved = uniqueSlugs(slugs)
    .map((slug) => getMarketBySlug(slug))
    .filter((market): market is Market => Boolean(market))
    .filter((market) => {
      if (market.slug === currentMarket.slug) return false;
      if (allowCrossBorder) return true;
      return isSameCountryAndState(currentMarket, market);
    });

  const sorted = sameStateFirst
    ? [...resolved].sort((a, b) => {
        const aSameState = isSameCountryAndState(currentMarket, a) ? 0 : 1;
        const bSameState = isSameCountryAndState(currentMarket, b) ? 0 : 1;

        return aSameState - bSameState;
      })
    : resolved;

  return uniqueMarkets(sorted).slice(0, limit);
}

export function getNeighborhoods(marketSlug: string): Neighborhood[] {
  const market = getMarketBySlug(marketSlug);

  if (!market) return [];

  const curated = curatedMarketRelations[market.slug];

  return uniqueNeighborhoods([
    ...(curated?.neighborhoods ?? []),
    ...(market.relations?.neighborhoods ?? []),
  ]);
}

export function getMetroMarkets(
  marketSlug: string,
  options: GeoRelationOptions = {}
): Market[] {
  const market = getMarketBySlug(marketSlug);

  if (!market) return [];

  const curated = curatedMarketRelations[market.slug];

  return resolveMarketSlugs(
    market,
    [
      ...(curated?.metroMarkets ?? []),
      ...(market.relations?.metroMarkets ?? []),
    ],
    {
      sameStateFirst: true,
      allowCrossBorder: false,
      ...options,
    }
  );
}

export function getNearbyMarkets(
  marketSlug: string,
  options: GeoRelationOptions = {}
): Market[] {
  const market = getMarketBySlug(marketSlug);

  if (!market) return [];

  return resolveMarketSlugs(market, market.relations?.nearbyMarkets ?? [], {
    sameStateFirst: true,
    allowCrossBorder: false,
    limit: 6,
    ...options,
  });
}

export function getRegionalMarkets(
  marketSlug: string,
  options: GeoRelationOptions = {}
): Market[] {
  const market = getMarketBySlug(marketSlug);

  if (!market) return [];

  return resolveMarketSlugs(market, market.relations?.regionalMarkets ?? [], {
    sameStateFirst: true,
    allowCrossBorder: false,
    ...options,
  });
}

export function getCrossBorderMarkets(
  marketSlug: string,
  options: GeoRelationOptions = {}
): Market[] {
  const market = getMarketBySlug(marketSlug);

  if (!market) return [];

  const curated = curatedMarketRelations[market.slug];

  return resolveMarketSlugs(
    market,
    [
      ...(curated?.crossBorderMarkets ?? []),
      ...(market.relations?.crossBorderMarkets ?? []),
    ],
    {
      sameStateFirst: false,
      allowCrossBorder: true,
      ...options,
    }
  );
}

export function getSeoRelationMarkets(marketSlug: string) {
  const market = getMarketBySlug(marketSlug);

  if (!market) {
    return {
      neighborhoods: [] as Neighborhood[],
      metroMarkets: [] as Market[],
      nearbyMarkets: [] as Market[],
      regionalMarkets: [] as Market[],
      crossBorderMarkets: [] as Market[],
    };
  }

  const metroMarkets = getMetroMarkets(market.slug, { limit: 8 });
  const metroSlugs = new Set(metroMarkets.map((item) => item.slug));

  const nearbyMarkets = getNearbyMarkets(market.slug, { limit: 12 }).filter(
    (item) => !metroSlugs.has(item.slug)
  );

  const regionalMarkets = getRegionalMarkets(market.slug, { limit: 8 }).filter(
    (item) => !metroSlugs.has(item.slug)
  );

  return {
    neighborhoods: getNeighborhoods(market.slug),
    metroMarkets,
    nearbyMarkets: nearbyMarkets.slice(0, 8),
    regionalMarkets,
    crossBorderMarkets: getCrossBorderMarkets(market.slug, { limit: 6 }),
  };
}

export function getMarketByGlobalPath(params: {
  countryCode: string;
  region: string;
  market: string;
}): Market | undefined {
  return getMarketByGlobalPathFromFiles(params);
}