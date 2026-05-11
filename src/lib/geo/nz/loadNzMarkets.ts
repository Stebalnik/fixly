import nzMarkets from "@/lib/geo/data/nz-cities.seed.json";
import type { Market } from "@/lib/geo/types";

type NzSeedMarket = {
  geonameId: string;
  city: string;
  market: string;
  marketSlug: string;
  slug: string;
  region: string;
  regionSlug: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  population: number;
  timezone: string;
  language: string;
  currency: string;
  featureCode: string;
  admin1Code: string;
  admin2Code: string;
  nearby: string[];
  zips: string[];
};

export function loadNzMarkets(): Market[] {
  return (nzMarkets as NzSeedMarket[]).map((market): Market => ({
    ...market,

    state: market.regionSlug,
    stateFull: market.region,

    zip: market.zips,
    nearby: market.nearby ?? [],

    language: "en",
    countryCode: "nz",
    currency: "NZD",
  }));
}