import type { Market } from "../types";

export type MarketSeoTier = "primary" | "secondary" | "longtail";

type MarketWithPopulation = Market & {
  population?: number;
};

export function getMarketSeoTier(market: Market): MarketSeoTier {
  const population = (market as MarketWithPopulation).population ?? 0;

  if (population >= 500000) return "primary";
  if (population >= 100000) return "secondary";

  return "longtail";
}