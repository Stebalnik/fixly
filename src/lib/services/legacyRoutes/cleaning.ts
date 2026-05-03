import type { LegacyServiceRouteMap } from "./types";

export const cleaningLegacyRoutes: LegacyServiceRouteMap = {
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
};