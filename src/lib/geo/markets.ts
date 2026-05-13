import type { GeoRelationOptions, Market } from "./types";
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
  return markets[slug];
}

export function getDefaultMarket(): Market | undefined {
  return getMarketBySlug(DEFAULT_MARKET_SLUG);
}

/**
 * Legacy helper.
 * Do not use for geo relations.
 */
export function getMarketByCity(city: string): Market | undefined {
  return Object.values(markets).find(
    (market) => market.city.toLowerCase() === city.toLowerCase()
  );
}

export function getMarketByZip(zip: string): Market | undefined {
  return Object.values(markets).find((market) => market.zip.includes(zip));
}

export function getAllMarkets(): Market[] {
  return Object.values(markets);
}

export function getAllMarketSlugs(): string[] {
  return Object.keys(markets);
}

function uniqueMarkets(items: Market[]): Market[] {
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

  const resolved = slugs
    .map((slug) => markets[slug])
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

export function getNeighborhoods(marketSlug: string) {
  return getMarketBySlug(marketSlug)?.relations?.neighborhoods ?? [];
}

export function getMetroMarkets(
  marketSlug: string,
  options: GeoRelationOptions = {}
): Market[] {
  const market = getMarketBySlug(marketSlug);

  if (!market) return [];

  return resolveMarketSlugs(market, market.relations?.metroMarkets ?? [], {
    sameStateFirst: true,
    allowCrossBorder: false,
    ...options,
  });
}

export function getNearbyMarkets(
  marketSlug: string,
  options: GeoRelationOptions = {}
): Market[] {
  const market = getMarketBySlug(marketSlug);

  if (!market) return [];

  const relationSlugs =
    market.relations?.nearbyMarkets?.length
      ? market.relations.nearbyMarkets
      : market.nearby;

  return resolveMarketSlugs(market, relationSlugs, {
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

  return resolveMarketSlugs(market, market.relations?.crossBorderMarkets ?? [], {
    sameStateFirst: false,
    allowCrossBorder: true,
    ...options,
  });
}

export function getSeoRelationMarkets(marketSlug: string) {
  const market = getMarketBySlug(marketSlug);

  if (!market) {
    return {
      neighborhoods: [],
      metroMarkets: [],
      nearbyMarkets: [],
      regionalMarkets: [],
      crossBorderMarkets: [],
    };
  }

  const metroMarkets = getMetroMarkets(market.slug, { limit: 8 });
  const metroSlugs = new Set(metroMarkets.map((item) => item.slug));

  const nearbyMarkets = getNearbyMarkets(market.slug, { limit: 12 }).filter(
    (item) => !metroSlugs.has(item.slug)
  );

  return {
    neighborhoods: getNeighborhoods(market.slug),
    metroMarkets,
    nearbyMarkets: nearbyMarkets.slice(0, 8),
    regionalMarkets: getRegionalMarkets(market.slug, { limit: 8 }),
    crossBorderMarkets: getCrossBorderMarkets(market.slug, { limit: 6 }),
  };
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