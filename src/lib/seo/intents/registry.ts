import type { ServiceIntent } from "./types";

export const serviceIntents = {
  "same-day": {
    slug: "same-day",
    title: "Same Day",
    seoTitleSuffix: "Same Day",
    description:
      "Request fast local help for services that may be available today.",
    group: "availability",
    priority: 1,
    indexable: true,
  },

  emergency: {
    slug: "emergency",
    title: "Emergency",
    seoTitleSuffix: "Emergency",
    description:
      "Get help for urgent service needs, active damage, safety issues, or problems that should not wait.",
    group: "urgency",
    priority: 1,
    indexable: true,
  },

  "24-hour": {
    slug: "24-hour",
    title: "24 Hour",
    seoTitleSuffix: "24 Hour",
    description:
      "Find local pros who may be available for urgent, after-hours, or time-sensitive service requests.",
    group: "availability",
    priority: 1,
    indexable: true,
  },

  "near-me": {
    slug: "near-me",
    title: "Near Me",
    seoTitleSuffix: "Near Me",
    description:
      "Find nearby pros and submit a local service request in your area.",
    group: "availability",
    priority: 1,
    indexable: false,
  },

  price: {
    slug: "price",
    title: "Price",
    seoTitleSuffix: "Cost",
    description:
      "Compare pricing, cost factors, project scope, and quotes from local pros.",
    group: "price",
    priority: 1,
    indexable: true,
  },

  cheap: {
    slug: "cheap",
    title: "Cheap",
    seoTitleSuffix: "Affordable",
    description:
      "Find budget-friendly local service options and compare quotes from available pros.",
    group: "price",
    priority: 2,
    indexable: true,
  },

  licensed: {
    slug: "licensed",
    title: "Licensed",
    seoTitleSuffix: "Licensed",
    description:
      "Find licensed professionals for services where credentials, safety, permits, or technical experience may matter.",
    group: "trust",
    priority: 1,
    indexable: true,
  },

  insured: {
    slug: "insured",
    title: "Insured",
    seoTitleSuffix: "Insured",
    description:
      "Find insured pros for safer home, property, repair, maintenance, and improvement projects.",
    group: "trust",
    priority: 2,
    indexable: true,
  },

  commercial: {
    slug: "commercial",
    title: "Commercial",
    seoTitleSuffix: "Commercial",
    description:
      "Find pros for offices, retail spaces, facilities, rental properties, and business service needs.",
    group: "commercial",
    priority: 2,
    indexable: true,
  },

  residential: {
    slug: "residential",
    title: "Residential",
    seoTitleSuffix: "Residential",
    description:
      "Find pros for home repairs, maintenance, installation, cleanup, and improvement projects.",
    group: "property",
    priority: 2,
    indexable: true,
  },

  "move-out": {
    slug: "move-out",
    title: "Move Out",
    seoTitleSuffix: "Move Out",
    description:
      "Find pros for move-out cleaning, turnover, moving-related service needs, and final property preparation.",
    group: "property",
    priority: 3,
    indexable: true,
  },

  "deep-cleaning": {
    slug: "deep-cleaning",
    title: "Deep Cleaning",
    seoTitleSuffix: "Deep Cleaning",
    description:
      "Find pros for detailed deep cleaning, heavy buildup, seasonal cleaning, and full-home refreshes.",
    group: "cleaning",
    priority: 3,
    indexable: true,
  },

  weekend: {
    slug: "weekend",
    title: "Weekend",
    seoTitleSuffix: "Weekend",
    description:
      "Find local pros who may be available for weekend service appointments.",
    group: "availability",
    priority: 2,
    indexable: true,
  },
} satisfies Record<string, ServiceIntent>;

export type ServiceIntentSlug = keyof typeof serviceIntents;

export const highValueIntentSlugs = [
  "same-day",
  "emergency",
  "24-hour",
  "price",
  "licensed",
] satisfies ServiceIntentSlug[];

export const secondaryIntentSlugs = [
  "cheap",
  "insured",
  "commercial",
  "residential",
  "weekend",
] satisfies ServiceIntentSlug[];

export const specializedIntentSlugs = [
  "move-out",
  "deep-cleaning",
] satisfies ServiceIntentSlug[];

export const nonCanonicalIntentSlugs = [
  "near-me",
] satisfies ServiceIntentSlug[];

export const tierOneIntentSlugs = highValueIntentSlugs;

export const allServiceIntentSlugs = [
  ...highValueIntentSlugs,
  ...secondaryIntentSlugs,
  ...specializedIntentSlugs,
  ...nonCanonicalIntentSlugs,
] satisfies ServiceIntentSlug[];

export function isServiceIntentSlug(slug?: string | null): slug is ServiceIntentSlug {
  return Boolean(slug && slug in serviceIntents);
}

export function getServiceIntentBySlug(slug?: string | null) {
  if (!isServiceIntentSlug(slug)) return null;

  return serviceIntents[slug];
}

export function getAllServiceIntents() {
  return allServiceIntentSlugs.map((slug) => serviceIntents[slug]);
}

export function getIndexableServiceIntents() {
  return getAllServiceIntents().filter((intent) => intent.indexable);
}