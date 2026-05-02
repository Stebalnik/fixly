export type LegacyRouteType = "category" | "subcategory" | "static";

export type LegacyServiceRoute = {
  type: LegacyRouteType;
  categorySlug?: string;
  subcategorySlug?: string;
  title?: string;
};

export const legacyServiceRoutes: Record<string, LegacyServiceRoute> = {
  handyman: {
    type: "category",
    categorySlug: "handyman",
  },

  "lawn-care": {
  type: "category",
  categorySlug: "lawn-care",
},

  plumbing: {
    type: "category",
    categorySlug: "plumbing",
  },

  cleaning: {
    type: "category",
    categorySlug: "cleaning",
  },

  electrical: {
    type: "category",
    categorySlug: "electrical",
  },

  painting: {
    type: "category",
    categorySlug: "painting",
  },

  "pressure-washing": {
    type: "category",
    categorySlug: "pressure-washing",
  },

  "junk-removal": {
    type: "category",
    categorySlug: "junk-removal",
  },

  awnings: {
    type: "category",
    categorySlug: "awnings",
  },

  "fence-installation-repair-services": {
    type: "category",
    categorySlug: "fence-installation-repair-services",
  },

  roofing: {
    type: "category",
    categorySlug: "roofing",
  },

  remodeling: {
    type: "category",
    categorySlug: "remodeling",
  },

  flooring: {
    type: "category",
    categorySlug: "flooring",
  },

  "property-maintenance": {
    type: "category",
    categorySlug: "property-maintenance",
  },

  "kitchen-remodeling": {
    type: "subcategory",
    categorySlug: "remodeling",
    subcategorySlug: "kitchen-remodeling",
  },

  "bathroom-remodeling": {
    type: "subcategory",
    categorySlug: "remodeling",
    subcategorySlug: "bathroom-remodeling",
  },

  "basement-remodeling": {
    type: "subcategory",
    categorySlug: "remodeling",
    subcategorySlug: "basement-remodeling",
  },

  "interior-painting": {
    type: "subcategory",
    categorySlug: "painting",
    subcategorySlug: "interior-painting",
  },

  "exterior-painting": {
    type: "subcategory",
    categorySlug: "painting",
    subcategorySlug: "exterior-painting",
  },

  "popcorn-ceiling": {
    type: "subcategory",
    categorySlug: "painting",
    subcategorySlug: "popcorn-ceiling",
  },

  "fence-deck-painting": {
    type: "subcategory",
    categorySlug: "painting",
    subcategorySlug: "fence-deck-painting",
  },

  "whole-house-renovation": {
    type: "subcategory",
    categorySlug: "remodeling",
    subcategorySlug: "whole-house-renovation",
  },

  "drywall-painting-texturing": {
    type: "subcategory",
    categorySlug: "painting",
    subcategorySlug: "drywall-painting-texturing",
  },

  "cabinets-countertops": {
    type: "subcategory",
    categorySlug: "remodeling",
    subcategorySlug: "cabinets-countertops",
  },

  "lighting-upgrades": {
    type: "subcategory",
    categorySlug: "electrical",
    subcategorySlug: "lighting-upgrades",
  },

  "property-inspections": {
    type: "subcategory",
    categorySlug: "property-maintenance",
    subcategorySlug: "property-inspections",
  },

  "plumbing-electrical-repairs": {
    type: "subcategory",
    categorySlug: "property-maintenance",
    subcategorySlug: "plumbing-electrical-repairs",
  },

  "painting-drywall-repair": {
    type: "subcategory",
    categorySlug: "property-maintenance",
    subcategorySlug: "painting-drywall-repair",
  },

  "lawn-care-landscaping": {
    type: "subcategory",
    categorySlug: "lawn-care",
    subcategorySlug: "lawn-care-landscaping",
  },

  "appliance-repair-installation": {
    type: "category",
    categorySlug: "appliance-repair-installation",
  },

  "pressure-washing-exterior": {
    type: "subcategory",
    categorySlug: "pressure-washing",
    subcategorySlug: "pressure-washing-exterior",
  },

  "emergency-handyman": {
    type: "subcategory",
    categorySlug: "handyman",
    subcategorySlug: "emergency-handyman",
  },

  "turnover-preparation": {
    type: "subcategory",
    categorySlug: "property-maintenance",
    subcategorySlug: "turnover-preparation",
  },

  "residential-cleaning": {
    type: "subcategory",
    categorySlug: "cleaning",
    subcategorySlug: "residential-cleaning",
  },

  "deep-cleaning": {
    type: "subcategory",
    categorySlug: "cleaning",
    subcategorySlug: "deep-cleaning",
  },

  "move-out-cleaning": {
    type: "subcategory",
    categorySlug: "cleaning",
    subcategorySlug: "move-out-cleaning",
  },

  "leak-detection-repair": {
    type: "subcategory",
    categorySlug: "plumbing",
    subcategorySlug: "leak-detection-repair",
  },

  "roofing/roof-installation": {
    type: "subcategory",
    categorySlug: "roofing",
    subcategorySlug: "roof-installation",
  },

  "roofing/roof-repair": {
    type: "subcategory",
    categorySlug: "roofing",
    subcategorySlug: "roof-repair",
  },

  "roofing/roof-replacement": {
    type: "subcategory",
    categorySlug: "roofing",
    subcategorySlug: "roof-replacement",
  },

  "roofing/storm-damage-restoration": {
    type: "subcategory",
    categorySlug: "roofing",
    subcategorySlug: "storm-damage-restoration",
  },

  "roofing/gutter-installation-repair": {
    type: "subcategory",
    categorySlug: "roofing",
    subcategorySlug: "gutter-installation-repair",
  },

  "roofing/roof-inspections-maintenance": {
    type: "subcategory",
    categorySlug: "roofing",
    subcategorySlug: "roof-inspections-maintenance",
  },

  "handyman/furniture-assembly": {
    type: "subcategory",
    categorySlug: "handyman",
    subcategorySlug: "furniture-assembly",
  },

  "handyman/drywall-repair": {
    type: "subcategory",
    categorySlug: "handyman",
    subcategorySlug: "drywall-repair",
  },

  "handyman/door-window-repair": {
    type: "subcategory",
    categorySlug: "handyman",
    subcategorySlug: "door-window-repair",
  },

  "handyman/painting-touchups": {
    type: "subcategory",
    categorySlug: "handyman",
    subcategorySlug: "painting-touchups",
  },

  "handyman/tv-mounting-shelves": {
    type: "subcategory",
    categorySlug: "handyman",
    subcategorySlug: "tv-mounting-shelves",
  },

  "handyman/plumbing-electrical": {
    type: "subcategory",
    categorySlug: "handyman",
    subcategorySlug: "plumbing-electrical",
  },

  "handyman/general-maintenance": {
    type: "subcategory",
    categorySlug: "handyman",
    subcategorySlug: "general-maintenance",
  },
};

export function getLegacyServiceRoute(path: string) {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");
  return legacyServiceRoutes[normalizedPath] ?? null;
}