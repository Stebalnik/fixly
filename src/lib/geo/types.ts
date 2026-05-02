export type Market = {
  slug: string;
  city: string;
  state: string;
  stateFull: string;
  country: string;
  countryCode: string;
  region: string;
  zip: string[];
  nearby: string[];
  lat: number;
  lng: number;
  language: "en";
  currency: "USD" | "EUR" | "GBP" | "AED";
};