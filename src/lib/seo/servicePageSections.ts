import type { Market } from "@/lib/geo";
import type { Category } from "@/lib/services";
import type { Subcategory } from "@/lib/services/types";
import type { ServiceIntent } from "@/lib/seo/intents";

type Params = {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent?: ServiceIntent;
};

function getServiceTitle(category?: Category, subcategory?: Subcategory) {
  return subcategory?.title ?? category?.title ?? "Home Services";
}

function getServiceShortTitle(category?: Category, subcategory?: Subcategory) {
  return subcategory?.shortTitle ?? category?.shortTitle ?? "service";
}

function getIntentLabel(intent?: ServiceIntent) {
  if (!intent) return null;

  if (intent.slug === "price") return "pricing";
  if (intent.slug === "cheap") return "affordable";
  if (intent.slug === "near-me") return "local";
  if (intent.slug === "same-day") return "same-day";
  if (intent.slug === "24-hour") return "24-hour";

  return intent.title.toLowerCase();
}

export function getServiceIncludedItems({
  subcategory,
  category,
  intent,
}: Params) {
  const service = getServiceShortTitle(category, subcategory);
  const intentLabel = getIntentLabel(intent);

  if (intentLabel) {
    return [
      `${intentLabel} ${service.toLowerCase()} request review`,
      "Clear scope before work starts",
      "Local pro matching",
      "Price, timing, and availability discussion",
      "Residential service support",
      "Follow-up if more work is needed",
    ];
  }

  return [
    `${service} assessment`,
    "Clear scope before work starts",
    "Local pro matching",
    "Price and timing discussion",
    "Residential service support",
    "Follow-up if more work is needed",
  ];
}

export function getServicePriceFactors({
  subcategory,
  category,
  intent,
}: Params) {
  const service = getServiceShortTitle(category, subcategory);
  const factors = [
    `Type of ${service.toLowerCase()} needed`,
    "Size and complexity of the job",
    "Materials or parts required",
    "Access to the work area",
    "Travel distance and local market demand",
  ];

  if (intent?.slug === "same-day" || intent?.slug === "emergency") {
    return [
      ...factors,
      "Urgency and same-day availability",
      "After-hours or emergency response needs",
    ];
  }

  if (intent?.slug === "24-hour") {
    return [
      ...factors,
      "After-hours availability",
      "Night, weekend, or urgent scheduling needs",
    ];
  }

  if (intent?.slug === "price" || intent?.slug === "cheap") {
    return [
      ...factors,
      "Labor minimums or trip fees",
      "Budget range and quote comparison",
    ];
  }

  return [...factors, "Urgency or same-day availability"];
}

export function getWhenToHirePro({ subcategory, category, intent }: Params) {
  const service = getServiceShortTitle(category, subcategory);

  if (intent?.slug === "emergency" || intent?.slug === "24-hour") {
    return [
      `The ${service.toLowerCase()} issue may cause damage, safety risk, or loss of essential service.`,
      "The problem is active right now or may get worse if delayed.",
      "The job may involve electrical, plumbing, roofing, HVAC, structural, or other specialized work.",
      "You need a local professional who can explain the next step clearly.",
    ];
  }

  if (intent?.slug === "price" || intent?.slug === "cheap") {
    return [
      `You want to understand realistic ${service.toLowerCase()} pricing before hiring.`,
      "You need to compare labor, materials, access, timing, and possible minimum charges.",
      "You want the project completed faster and with fewer mistakes.",
      "You need a local professional who can explain the next step clearly.",
    ];
  }

  return [
    `You are not sure how serious the ${service.toLowerCase()} issue is.`,
    "The job requires tools, ladders, electrical, plumbing, or structural work.",
    "You want the project completed faster and with fewer mistakes.",
    "You need a local professional who can explain the next step clearly.",
  ];
}

export function getLocalSearchPhrases({
  market,
  subcategory,
  category,
  intent,
}: Params) {
  const service = getServiceTitle(category, subcategory);
  const serviceLower = service.toLowerCase();

  const basePhrases = [
    `${service} near me`,
    `${service} in ${market.city}, ${market.state}`,
    `local ${serviceLower} pros`,
    `same-day ${serviceLower}`,
    `affordable ${serviceLower} in ${market.city}`,
  ];

  if (!intent) return basePhrases;

  return [
    `${intent.seoTitleSuffix} ${service}`,
    `${intent.seoTitleSuffix} ${service} in ${market.city}`,
    `${intent.seoTitleSuffix} ${service} near me`,
    ...basePhrases,
  ];
}

export function getEnhancedServiceFaq({
  market,
  subcategory,
  category,
  intent,
}: Params) {
  const service = getServiceTitle(category, subcategory);
  const serviceLower = service.toLowerCase();

  const baseFaq = [
    {
      question: `How much does ${serviceLower} cost in ${market.city}, ${market.state}?`,
      answer: `The cost depends on the job size, materials, access, urgency, and the type of ${serviceLower} needed. Fixly helps you submit a clear request so local pros can respond with relevant pricing.`,
    },
    {
      question: `Can I find same-day ${serviceLower} in ${market.city}?`,
      answer: `Same-day availability depends on the service, schedule, and local pro capacity. For urgent jobs, describe the issue clearly and mention when you need help.`,
    },
    {
      question: `Do I need to provide materials for ${serviceLower}?`,
      answer: `Some jobs require homeowner-provided materials, while others can be handled by the pro. Include what you already have when submitting your request.`,
    },
    {
      question: `How do I choose the right pro for ${serviceLower}?`,
      answer: `Look for clear communication, relevant experience, availability, and pricing that matches the scope of the job.`,
    },
    {
      question: `Does Fixly serve nearby areas around ${market.city}?`,
      answer: `Yes. Fixly pages can support nearby cities and local markets so homeowners can find pros in and around ${market.city}, ${market.state}.`,
    },
  ];

  if (!intent) return baseFaq;

  return [
    {
      question: `Can I request ${intent.title.toLowerCase()} ${serviceLower} in ${market.city}?`,
      answer: `Yes. Availability depends on the service type, local pro capacity, project scope, and timing. Add clear details so pros can evaluate the request quickly.`,
    },
    ...baseFaq,
  ];
}

export function getLocalSeoParagraphs({
  market,
  subcategory,
  category,
  intent,
}: Params) {
  const service = getServiceTitle(category, subcategory);
  const serviceLower = service.toLowerCase();

  if (intent) {
    return [
      `If you are searching for ${intent.seoTitleSuffix.toLowerCase()} ${serviceLower} in ${market.city}, ${market.state}, Fixly helps you connect with local home service pros who can review your timing, scope, and service needs.`,
      `Homeowners often search for "${intent.seoTitleSuffix.toLowerCase()} ${serviceLower} near me" or "${intent.seoTitleSuffix.toLowerCase()} ${serviceLower} in ${market.city}" when they need a more specific service match.`,
      `Whether the job is urgent, budget-sensitive, time-sensitive, seasonal, or part of a larger home project, you can describe what you need and let local professionals respond based on scope, timing, and location.`,
    ];
  }

  return [
    `If you are searching for ${serviceLower} in ${market.city}, ${market.state}, Fixly helps you connect with local home service pros who understand the area and common residential project needs.`,
    `Homeowners often search for "${serviceLower} near me", "${serviceLower} in ${market.city}", or "same-day ${serviceLower}" when they need help quickly. This page is built to match those local service searches with a simple request flow.`,
    `Whether the job is small, urgent, seasonal, or part of a larger home project, you can describe what you need and let local professionals respond based on the scope, timing, and location.`,
  ];
}