import type { Market } from "../types";
import type { UsCitySeed } from "./types";
import rawSeeds from "../data/us-cities.seed.json";
import { usMarketRelations } from "../relations/us";

const seeds = rawSeeds as UsCitySeed[];

function getMarketSlug(seed: UsCitySeed): string {
  return `${seed.key}-${seed.state.toLowerCase()}`;
}

function createUsMarket(seed: UsCitySeed): Market {
  const slug = getMarketSlug(seed);
  const relations = usMarketRelations[slug];

  return {
    slug,
    city: seed.city,
    state: seed.state,
    stateFull: seed.stateFull,
    country: "United States",
    countryCode: "us",
    region: seed.county,
    zip: seed.zip,
    nearby: seed.nearby,
    relations,
    lat: seed.lat,
    lng: seed.lng,
    language: "en",
    currency: "USD",
  };
}

export function getUsMarkets(): Record<string, Market> {
  return Object.fromEntries(
    seeds.map((seed) => {
      const slug = getMarketSlug(seed);

      return [slug, createUsMarket(seed)];
    })
  );
}

export function getUsCitySeeds(): UsCitySeed[] {
  return seeds;
}