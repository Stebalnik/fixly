export type LegacyRouteType = "category" | "subcategory" | "static";

export type LegacyServiceRoute = {
  type: LegacyRouteType;
  categorySlug?: string;
  subcategorySlug?: string;
  title?: string;
};

export type LegacyServiceRouteMap = Record<string, LegacyServiceRoute>;