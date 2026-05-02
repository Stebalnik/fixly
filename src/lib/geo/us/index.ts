import type { Market } from "../types";
import type { UsCitySeed } from "./types";
import rawSeeds from "../data/us-cities.seed.json";

const seeds = rawSeeds as UsCitySeed[];

function createUsMarket(seed: UsCitySeed): Market {
  return {
    slug: `${seed.key}-${seed.state.toLowerCase()}`,
    city: seed.city,
    state: seed.state,
    stateFull: seed.stateFull,
    country: "United States",
    countryCode: "us",
    region: seed.county,
    zip: seed.zip,
    nearby: seed.nearby,
    lat: seed.lat,
    lng: seed.lng,
    language: "en",
    currency: "USD",
  };
}

export function getUsMarkets(): Record<string, Market> {
  return Object.fromEntries(
    seeds.map((seed) => [
      `${seed.key}-${seed.state.toLowerCase()}`,
      createUsMarket(seed),
    ])
  );
}

export function getUsCitySeeds(): UsCitySeed[] {
  return seeds;
}