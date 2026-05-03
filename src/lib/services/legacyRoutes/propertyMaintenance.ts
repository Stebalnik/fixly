import type { LegacyServiceRouteMap } from "./types";

export const propertyMaintenanceLegacyRoutes: LegacyServiceRouteMap = {
  "property-inspections": {
    type: "subcategory",
    categorySlug: "property-maintenance",
    subcategorySlug: "property-inspections",
  },

  "painting-drywall-repair": {
    type: "subcategory",
    categorySlug: "property-maintenance",
    subcategorySlug: "painting-drywall-repair",
  },

  "turnover-preparation": {
    type: "subcategory",
    categorySlug: "property-maintenance",
    subcategorySlug: "turnover-preparation",
  },
};