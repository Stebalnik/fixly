export type ServiceIntent = {
  slug: string;
  title: string;
  seoTitleSuffix: string;
  description: string;
};

export const serviceIntents = {
  "same-day": {
    slug: "same-day",
    title: "Same Day",
    seoTitleSuffix: "Same Day",
    description:
      "Request fast local help for services that may be available today.",
  },
  emergency: {
    slug: "emergency",
    title: "Emergency",
    seoTitleSuffix: "Emergency",
    description:
      "Get help for urgent service needs, active damage, safety issues, or problems that should not wait.",
  },
  "24-hour": {
    slug: "24-hour",
    title: "24 Hour",
    seoTitleSuffix: "24 Hour",
    description:
      "Find local pros who may be available for urgent, after-hours, or time-sensitive service requests.",
  },
  "near-me": {
    slug: "near-me",
    title: "Near Me",
    seoTitleSuffix: "Near Me",
    description:
      "Find nearby pros and submit a local service request in your area.",
  },
  price: {
    slug: "price",
    title: "Price",
    seoTitleSuffix: "Cost",
    description:
      "Compare pricing, cost factors, project scope, and quotes from local pros.",
  },
  cheap: {
    slug: "cheap",
    title: "Cheap",
    seoTitleSuffix: "Affordable",
    description:
      "Find budget-friendly local service options and compare quotes from available pros.",
  },
  licensed: {
    slug: "licensed",
    title: "Licensed",
    seoTitleSuffix: "Licensed",
    description:
      "Find licensed professionals for services where credentials, safety, permits, or technical experience may matter.",
  },
  insured: {
    slug: "insured",
    title: "Insured",
    seoTitleSuffix: "Insured",
    description:
      "Find insured pros for safer home, property, repair, maintenance, and improvement projects.",
  },
  commercial: {
    slug: "commercial",
    title: "Commercial",
    seoTitleSuffix: "Commercial",
    description:
      "Find pros for offices, retail spaces, facilities, rental properties, and business service needs.",
  },
  residential: {
    slug: "residential",
    title: "Residential",
    seoTitleSuffix: "Residential",
    description:
      "Find pros for home repairs, maintenance, installation, cleanup, and improvement projects.",
  },
  "move-out": {
    slug: "move-out",
    title: "Move Out",
    seoTitleSuffix: "Move Out",
    description:
      "Find pros for move-out cleaning, turnover, moving-related service needs, and final property preparation.",
  },
  "deep-cleaning": {
    slug: "deep-cleaning",
    title: "Deep Cleaning",
    seoTitleSuffix: "Deep Cleaning",
    description:
      "Find pros for detailed deep cleaning, heavy buildup, seasonal cleaning, and full-home refreshes.",
  },
  weekend: {
    slug: "weekend",
    title: "Weekend",
    seoTitleSuffix: "Weekend",
    description:
      "Find local pros who may be available for weekend service appointments.",
  },
} satisfies Record<string, ServiceIntent>;

export type ServiceIntentSlug = keyof typeof serviceIntents;

export function getServiceIntentBySlug(slug?: string) {
  if (!slug) return null;

  return serviceIntents[slug as ServiceIntentSlug] ?? null;
}

export const highValueIntentSlugs: ServiceIntentSlug[] = [
  "same-day",
  "emergency",
  "24-hour",
  "price",
  "near-me",
];

export const secondaryIntentSlugs: ServiceIntentSlug[] = [
  "cheap",
  "licensed",
  "insured",
  "commercial",
  "residential",
  "weekend",
];

export const specializedIntentSlugs: ServiceIntentSlug[] = [
  "move-out",
  "deep-cleaning",
];

export const tierOneIntentSlugs = highValueIntentSlugs;

export const allServiceIntentSlugs: ServiceIntentSlug[] = [
  ...highValueIntentSlugs,
  ...secondaryIntentSlugs,
  ...specializedIntentSlugs,
];

export function getAllServiceIntents() {
  return allServiceIntentSlugs.map((slug) => serviceIntents[slug]);
}