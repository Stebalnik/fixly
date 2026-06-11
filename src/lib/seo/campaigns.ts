import type { Market } from "@/lib/geo/types";

export const focusServiceCategorySlugs = [
  "appliance-repair-installation",
  "hvac",
  "handyman",
] as const;

export const focusServiceSubcategorySlugs: Record<string, string[]> = {
  "appliance-repair-installation": [
    "refrigerator-freezer-repair",
    "washer-dryer-repair-installation",
    "dishwasher-repair-installation",
    "oven-range-stove-repair-installation",
    "microwave-installation-repair",
    "garbage-disposal-repair-installation",
    "dryer-vent-cleaning-repair",
    "appliance-installation",
    "appliance-troubleshooting",
  ],
  hvac: [
    "ac-repair",
    "hvac-repair",
    "emergency-hvac-repair",
    "ac-installation-replacement",
    "furnace-repair",
    "furnace-installation-replacement",
    "heat-pump-repair-installation",
    "mini-split-installation",
    "hvac-maintenance-tune-up",
    "thermostat-installation-repair",
  ],
  handyman: [
    "tv-mounting",
    "furniture-assembly",
    "drywall-repair-patching",
    "door-repair-installation",
    "window-repair",
    "shelving-wall-mounting",
    "curtain-blinds-installation",
    "picture-mirror-hanging",
    "small-carpentry-repairs",
    "general-home-repairs",
    "grab-bar-installation",
  ],
};

export const georgiaSeoCampaign = {
  countryCode: "us",
  regionSlugs: ["georgia", "ga"],
  marketSlugs: [
    "atlanta-ga",
    "savannah-ga",
    "columbus-ga",
    "athens-ga",
    "sandy-springs-ga",
    "augusta-ga",
    "macon-ga",
    "marietta-ga",
    "roswell-ga",
    "alpharetta-ga",
  ],
  priorityBoost: 16,
} as const;

export function isFocusServiceCategory(categorySlug?: string | null) {
  return focusServiceCategorySlugs.includes(
    categorySlug as (typeof focusServiceCategorySlugs)[number]
  );
}

export function getFocusSubcategorySlugs(categorySlug: string) {
  return focusServiceSubcategorySlugs[categorySlug] ?? [];
}

export function getCampaignCategoryBoost(categorySlug?: string | null) {
  return isFocusServiceCategory(categorySlug) ? 8 : 0;
}

export function isGeorgiaCampaignMarket(market?: Market | null) {
  if (!market) return false;

  const countryCode = market.countryCode.toLowerCase();
  const region = market.region.toLowerCase();
  const state = market.state.toLowerCase();

  return (
    countryCode === georgiaSeoCampaign.countryCode &&
    ((georgiaSeoCampaign.marketSlugs as readonly string[]).includes(
      market.slug
    ) ||
      (georgiaSeoCampaign.regionSlugs as readonly string[]).includes(region) ||
      (georgiaSeoCampaign.regionSlugs as readonly string[]).includes(state))
  );
}

export function getCampaignGeoBoost(market?: Market | null) {
  return isGeorgiaCampaignMarket(market) ? georgiaSeoCampaign.priorityBoost : 0;
}
