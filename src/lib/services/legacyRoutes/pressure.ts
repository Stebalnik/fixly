import type { LegacyServiceRouteMap } from "./types";

const subcategorySlugs = [
  "house-pressure-washing",
  "soft-wash-house-cleaning",
  "driveway-pressure-washing",
  "concrete-pressure-washing",
  "sidewalk-pressure-washing",
  "patio-pressure-washing",
  "deck-pressure-washing",
  "fence-pressure-washing",
  "roof-soft-washing",
  "gutter-brightening-cleaning",
  "pool-deck-pressure-washing",
  "commercial-pressure-washing",
  "oil-stain-pressure-washing",
];

export const pressureLegacyRoutes: LegacyServiceRouteMap = {
  pressure: {
    type: "category",
    categorySlug: "pressure-washing",
  },

  "pressure-washing": {
    type: "category",
    categorySlug: "pressure-washing",
  },

  ...Object.fromEntries(
    subcategorySlugs.flatMap((subcategorySlug) => [
      [
        `pressure/${subcategorySlug}`,
        {
          type: "subcategory",
          categorySlug: "pressure-washing",
          subcategorySlug,
        },
      ],
      [
        `pressure-washing/${subcategorySlug}`,
        {
          type: "subcategory",
          categorySlug: "pressure-washing",
          subcategorySlug,
        },
      ],
      [
        subcategorySlug,
        {
          type: "subcategory",
          categorySlug: "pressure-washing",
          subcategorySlug,
        },
      ],
    ])
  ),
};