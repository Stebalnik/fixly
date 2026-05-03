import type { Market } from "@/lib/geo";
import type { Category } from "@/lib/services";
import type { Subcategory } from "@/lib/services/types";

type Params = {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
};

export function getServiceIncludedItems({ subcategory, category }: Params) {
  const service = subcategory?.shortTitle ?? category?.shortTitle ?? "service";

  return [
    `${service} assessment`,
    "Clear scope before work starts",
    "Local pro matching",
    "Price and timing discussion",
    "Residential service support",
    "Follow-up if more work is needed",
  ];
}

export function getServicePriceFactors({ subcategory, category }: Params) {
  const service = subcategory?.shortTitle ?? category?.shortTitle ?? "service";

  return [
    `Type of ${service.toLowerCase()} needed`,
    "Size and complexity of the job",
    "Materials or parts required",
    "Access to the work area",
    "Urgency or same-day availability",
    "Travel distance and local market demand",
  ];
}

export function getWhenToHirePro({ subcategory, category }: Params) {
  const service = subcategory?.shortTitle ?? category?.shortTitle ?? "service";

  return [
    `You are not sure how serious the ${service.toLowerCase()} issue is.`,
    "The job requires tools, ladders, electrical, plumbing, or structural work.",
    "You want the project completed faster and with fewer mistakes.",
    "You need a local professional who can explain the next step clearly.",
  ];
}

export function getLocalSearchPhrases({ market, subcategory, category }: Params) {
  const service = subcategory?.title ?? category?.title ?? "Home Services";

  return [
    `${service} near me`,
    `${service} in ${market.city}, ${market.state}`,
    `local ${service.toLowerCase()} pros`,
    `same-day ${service.toLowerCase()}`,
    `affordable ${service.toLowerCase()} in ${market.city}`,
  ];
}

export function getEnhancedServiceFaq({ market, subcategory, category }: Params) {
  const service = subcategory?.title ?? category?.title ?? "home service";
  const serviceLower = service.toLowerCase();

  return [
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
}

export function getLocalSeoParagraphs({ market, subcategory, category }: Params) {
  const service = subcategory?.title ?? category?.title ?? "Home Services";
  const serviceLower = service.toLowerCase();

  return [
    `If you are searching for ${serviceLower} in ${market.city}, ${market.state}, Fixly helps you connect with local home service pros who understand the area and common residential project needs.`,
    `Homeowners often search for "${serviceLower} near me", "${serviceLower} in ${market.city}", or "same-day ${serviceLower}" when they need help quickly. This page is built to match those local service searches with a simple request flow.`,
    `Whether the job is small, urgent, seasonal, or part of a larger home project, you can describe what you need and let local professionals respond based on the scope, timing, and location.`,
  ];
}