import type { Subcategory } from "../types";
import { handymanSubcategories } from "./handyman";
import { appliancesSubcategories } from "./appliances";
import { cleaningSubcategories } from "./cleaning";
import { paintingSubcategories } from "./painting";
import { roofingSubcategories } from "./roofing";
import { remodelingSubcategories } from "./remodeling";
import { plumbingSubcategories } from "./plumbing";
import { electricalSubcategories } from "./electrical";
import { flooringSubcategories } from "./flooring";
import { lawnSubcategories } from "./lawn";
import { pressureSubcategories } from "./pressure";
import { hvacSubcategories } from "./hvac";
import { garageSubcategories } from "./garage";
import { pestSubcategories } from "./pest";
import { movingSubcategories } from "./moving";
import { maintenanceSubcategories } from "./maintenance";
import { fenceSubcategories } from "./fence";

export const subcategories: Record<string, Subcategory> = {
  ...handymanSubcategories,
  ...appliancesSubcategories,
  ...cleaningSubcategories,
  ...paintingSubcategories,
  ...roofingSubcategories,
  ...remodelingSubcategories,
  ...plumbingSubcategories,
  ...electricalSubcategories,
  ...flooringSubcategories,
  ...lawnSubcategories,
  ...pressureSubcategories,
  ...hvacSubcategories,
  ...garageSubcategories,
  ...pestSubcategories,
  ...movingSubcategories,
  ...maintenanceSubcategories,
  ...fenceSubcategories,
};

export function getSubcategoryBySlug(slug: string): Subcategory | undefined {
  return subcategories[slug];
}

export function getSubcategoriesByParent(parentSlug: string): Subcategory[] {
  return Object.values(subcategories).filter(
    (subcategory) => subcategory.parentSlug === parentSlug
  );
}

export function getSubcategoriesBySlugs(slugs: string[]): Subcategory[] {
  return slugs
    .map((slug) => getSubcategoryBySlug(slug))
    .filter((subcategory): subcategory is Subcategory => Boolean(subcategory));
}

export function formatPriceRange(subcategory: Subcategory): string {
  return `$${subcategory.priceMin}–$${subcategory.priceMax}`;
}