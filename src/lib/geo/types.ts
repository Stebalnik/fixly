export type GeoRelationLayer =
  | "neighborhoods"
  | "metroMarkets"
  | "nearbyMarkets"
  | "regionalMarkets"
  | "crossBorderMarkets";

export type Neighborhood = {
  slug: string;
  name: string;
};

export type MarketRelations = {
  neighborhoods?: Neighborhood[];
  metroMarkets?: string[];
  nearbyMarkets?: string[];
  regionalMarkets?: string[];
  crossBorderMarkets?: string[];
};

export type Market = {
  slug: string;
  city: string;
  state: string;
  stateFull: string;
  country: string;
  countryCode: string;
  region: string;
  zip: string[];

  /**
   * Legacy field.
   * Must contain market slugs, not city names.
   */
  nearby: string[];

  relations?: MarketRelations;

  lat: number;
  lng: number;
  language: "en";
  currency:
    | "USD"
    | "EUR"
    | "GBP"
    | "AED"
    | "NZD"
    | "AUD"
    | "CAD"
    | "SGD"
    | "PHP"
    | "INR"
    | "PKR"
    | "NGN"
    | "KES"
    | "GHS"
    | "JMD"
    | "TTD"
    | "BSD"
    | "BBD"
    | "MUR";
};

export type GeoRelationOptions = {
  limit?: number;
  sameStateFirst?: boolean;
  allowCrossBorder?: boolean;
};