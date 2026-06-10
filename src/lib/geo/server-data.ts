import fs from "fs";
import path from "path";
import type { Market } from "./types";

type MarketIndexItem = {
  countryCode: string;
  regionSlug: string;
  marketSlug: string;
  slug: string;
  city?: string;
  state?: string;
  stateFull?: string;
  population?: number;
};

type MarketIndex = Record<string, MarketIndexItem>;

const DATA_DIR = path.join(process.cwd(), "src/lib/geo/data");
const COUNTRIES_DIR = path.join(DATA_DIR, "countries");
const INDEX_FILE = path.join(DATA_DIR, "market-index.json");

let marketIndexCache: MarketIndex | null = null;
let slugToCountryCache: Map<string, string> | null = null;

const countryMarketsCache = new Map<string, Market[]>();
const countryMarketBySlugCache = new Map<string, Map<string, Market>>();

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function getMarketIndex(): MarketIndex {
  if (!marketIndexCache) {
    marketIndexCache = readJson<MarketIndex>(INDEX_FILE);
  }

  return marketIndexCache;
}

function getSlugToCountryIndex() {
  if (slugToCountryCache) return slugToCountryCache;

  const map = new Map<string, string>();

  for (const item of Object.values(getMarketIndex())) {
    map.set(item.slug.toLowerCase(), item.countryCode.toLowerCase());
  }

  slugToCountryCache = map;
  return map;
}

export function getCountryMarkets(countryCode: string): Market[] {
  const normalizedCountry = countryCode.toLowerCase();

  const cached = countryMarketsCache.get(normalizedCountry);
  if (cached) return cached;

  const filePath = path.join(COUNTRIES_DIR, `${normalizedCountry}.markets.json`);

  if (!fs.existsSync(filePath)) {
    countryMarketsCache.set(normalizedCountry, []);
    countryMarketBySlugCache.set(normalizedCountry, new Map());
    return [];
  }

  const markets = readJson<Market[]>(filePath);
  countryMarketsCache.set(normalizedCountry, markets);

  countryMarketBySlugCache.set(
    normalizedCountry,
    new Map(markets.map((market) => [market.slug.toLowerCase(), market]))
  );

  return markets;
}

function getCountryMarketBySlug(countryCode: string, slug: string) {
  const normalizedCountry = countryCode.toLowerCase();
  const normalizedSlug = slug.toLowerCase();

  getCountryMarkets(normalizedCountry);

  return countryMarketBySlugCache
    .get(normalizedCountry)
    ?.get(normalizedSlug);
}

export function getAllCountryCodesFromIndex(): string[] {
  const index = getMarketIndex();

  return Array.from(
    new Set(Object.values(index).map((item) => item.countryCode.toLowerCase()))
  ).sort();
}

export function getMarketByCountryAndSlug(
  countryCode: string,
  marketSlug: string
): Market | undefined {
  return getCountryMarketBySlug(countryCode, marketSlug);
}

export function getMarketByGlobalPathFromFiles({
  countryCode,
  region,
  market,
}: {
  countryCode: string;
  region: string;
  market: string;
}): Market | undefined {
  const routeKey = [
    countryCode.toLowerCase(),
    region.toLowerCase(),
    market.toLowerCase(),
  ].join("/");

  const indexItem = getMarketIndex()[routeKey];

  if (!indexItem) return undefined;

  return getCountryMarketBySlug(indexItem.countryCode, indexItem.slug);
}

export function getMarketsByCountryFromFiles(countryCode: string): Market[] {
  return getCountryMarkets(countryCode);
}

export function getMarketBySlugFromFiles(slug: string): Market | undefined {
  const normalizedSlug = slug.toLowerCase();
  const country = getSlugToCountryIndex().get(normalizedSlug);

  if (!country) return undefined;

  return getCountryMarketBySlug(country, normalizedSlug);
}

export function getMarketByZipFromFiles(zip: string): Market | undefined {
  for (const country of getAllCountryCodesFromIndex()) {
    const found = getCountryMarkets(country).find((market) =>
      (market.zip ?? []).includes(zip)
    );

    if (found) return found;
  }

  return undefined;
}

export function getAllMarketsFromFiles(): Market[] {
  return getAllCountryCodesFromIndex().flatMap((country) =>
    getCountryMarkets(country)
  );
}

export function getAllMarketSlugsFromFiles(): string[] {
  return Object.values(getMarketIndex()).map((item) => item.slug);
}
