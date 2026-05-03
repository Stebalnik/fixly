import type { SubcategoryMap } from "../types";

export const cleaningSubcategories: SubcategoryMap = {
  // CLEANING
  "residential-cleaning": {
    slug: "residential-cleaning",
    title: "Residential Cleaning",
    shortTitle: "House Cleaning",
    parentSlug: "cleaning",
    description: "Regular home cleaning — weekly, bi-weekly, or one-time.",
    commonProblems: [
      "Weekly cleaning",
      "Bi-weekly service",
      "One-time clean",
      "Post-party cleanup",
    ],
    priceMin: 100,
    priceMax: 350,
    priceUnit: "flat",
    relatedSlugs: ["deep-cleaning", "move-out-cleaning"],
    formFields: ["home_size", "bedrooms", "bathrooms", "frequency", "description"],
  },
  "deep-cleaning": {
    slug: "deep-cleaning",
    title: "Deep Cleaning",
    shortTitle: "Deep Clean",
    parentSlug: "cleaning",
    description: "Thorough deep cleaning — inside appliances, baseboards, windows, and more.",
    commonProblems: [
      "First-time deep clean",
      "Spring cleaning",
      "Post-renovation cleanup",
      "Before guests arrive",
    ],
    priceMin: 180,
    priceMax: 500,
    priceUnit: "flat",
    relatedSlugs: ["residential-cleaning", "move-out-cleaning"],
    formFields: ["home_size", "bedrooms", "bathrooms", "extras", "description"],
  },
  "move-out-cleaning": {
    slug: "move-out-cleaning",
    title: "Move-Out Cleaning",
    shortTitle: "Move-Out Clean",
    parentSlug: "cleaning",
    description: "Get your full security deposit back with professional move-out cleaning.",
    commonProblems: [
      "End of lease clean",
      "Moving out of apartment",
      "Selling the house",
      "Tenant turnover",
    ],
    priceMin: 200,
    priceMax: 600,
    priceUnit: "flat",
    relatedSlugs: ["deep-cleaning", "residential-cleaning"],
    formFields: ["home_size", "bedrooms", "bathrooms", "move_date", "description"],
  },
};