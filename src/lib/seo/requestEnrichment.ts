import type { Market } from "@/lib/geo";
import { getMarketUrlPath, getNearbyMarkets } from "@/lib/geo";
import type { Category } from "@/lib/services/categories";
import type { Subcategory } from "@/lib/services/types";
import { getIndexableServiceIntents } from "./intents/registry";

type RequestEnrichmentParams = {
  market?: Market | null;
  category?: Category | null;
  subcategory?: Subcategory | null;
  city: string;
  state: string;
  publicDescription: string;
  leadPriceFixas?: number | null;
};

export type RequestSeoFaqItem = {
  question: string;
  answer: string;
};

export type RequestSeoLink = {
  title: string;
  href: string;
  description: string;
};

export type RequestSummaryBlock = {
  title: string;
  body: string;
};

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getServiceTitle(params: {
  category?: Category | null;
  subcategory?: Subcategory | null;
}) {
  return params.subcategory?.title ?? params.category?.title ?? "Home Service";
}

function getServiceShortTitle(params: {
  category?: Category | null;
  subcategory?: Subcategory | null;
}) {
  return (
    params.subcategory?.shortTitle ??
    params.category?.shortTitle ??
    "home service"
  );
}

function getServiceLower(params: {
  category?: Category | null;
  subcategory?: Subcategory | null;
}) {
  return getServiceShortTitle(params).toLowerCase();
}

function getIssueSignals(description: string) {
  const lowerDescription = description.toLowerCase();

  return {
    isUrgent: [
      "urgent",
      "emergency",
      "asap",
      "same day",
      "today",
      "immediately",
      "now",
      "24 hour",
    ].some((term) => lowerDescription.includes(term)),
    hasActiveDamage: [
      "leak",
      "flood",
      "water damage",
      "smoke",
      "sparking",
      "burning",
      "mold",
      "broken pipe",
      "roof leak",
    ].some((term) => lowerDescription.includes(term)),
    hasSystemFailure: [
      "not working",
      "stopped working",
      "no power",
      "won't turn on",
      "doesn't work",
      "broken",
      "failed",
      "clogged",
      "backed up",
    ].some((term) => lowerDescription.includes(term)),
  };
}

function getPriceUnitLabel(unit: Subcategory["priceUnit"]) {
  if (unit === "hourly") return "per hour";
  if (unit === "sqft") return "per square foot";
  return "for common jobs";
}

function getServicePath(params: RequestEnrichmentParams) {
  if (!params.market) return null;

  const marketPath = getMarketUrlPath(params.market);

  if (params.subcategory) {
    return `${marketPath}/${params.subcategory.parentSlug}/${params.subcategory.slug}`;
  }

  if (params.category) {
    return `${marketPath}/${params.category.slug}`;
  }

  return marketPath;
}

export function getRequestJobTitle(params: RequestEnrichmentParams) {
  return `${getServiceTitle(params)} Job in ${params.city}, ${params.state}`;
}

export function getRequestHeroSummary(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  return `Local ${service} work is available for pros in ${params.city}, ${params.state}. Review the scope, location, and access notes before unlocking customer contact details.`;
}

export function getRequestJobSummary(params: RequestEnrichmentParams) {
  const description = cleanText(params.publicDescription);

  return `The customer needs help with this project: ${description}`;
}

export function getRequestProblemSummary(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);
  const description = cleanText(params.publicDescription);

  return `${params.city}, ${params.state} has an active ${service} request. The public scope says: ${description}`;
}

export function getRequestSemanticSummaries(
  params: RequestEnrichmentParams
): RequestSummaryBlock[] {
  const service = getServiceLower(params);
  const description = cleanText(params.publicDescription);
  const signals = getIssueSignals(description);

  return [
    {
      title: "Issue summary",
      body: `${params.city}, ${params.state} has a public ${service} request with this homeowner-provided scope: ${description}`,
    },
    {
      title: "Homeowner situation",
      body: signals.hasSystemFailure
        ? `The homeowner appears to be dealing with a ${service} problem that may affect normal use of part of the home until it is inspected.`
        : `The homeowner is looking for local ${service} help and needs a pro to confirm the exact conditions, access, and work requirements.`,
    },
    {
      title: "Urgency context",
      body:
        signals.isUrgent || signals.hasActiveDamage
          ? `The wording suggests this may be time-sensitive. A pro should ask whether the issue is active, spreading, unsafe, or blocking normal use before scheduling.`
          : `The public description does not clearly indicate an emergency. A pro should still confirm timing, safety, access, and whether the condition has changed.`,
    },
    {
      title: "Likely scope of work",
      body: `A typical ${service} response starts with inspection, scope confirmation, quote review, work planning, cleanup expectations, and final verification with the homeowner.`,
    },
  ];
}

export function getRequestUrgencyContext(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);
  const description = cleanText(params.publicDescription).toLowerCase();
  const urgentTerms = [
    "urgent",
    "emergency",
    "asap",
    "same day",
    "today",
    "leak",
    "broken",
    "no power",
    "flood",
  ];
  const soundsUrgent = urgentTerms.some((term) => description.includes(term));

  if (soundsUrgent) {
    return `This ${service} request may need faster follow-up based on the customer description. Pros should confirm timing, site access, safety risks, and whether temporary mitigation is needed before quoting.`;
  }

  return `This ${service} request appears suitable for normal scheduling unless the customer confirms a time-sensitive issue. Pros should verify preferred timing, access, materials, and cleanup expectations before starting work.`;
}

export function getRequestPricingGuidance(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  if (params.subcategory) {
    const unitLabel = getPriceUnitLabel(params.subcategory.priceUnit);

    return [
      `${params.subcategory.shortTitle} often ranges from $${params.subcategory.priceMin.toLocaleString()} to $${params.subcategory.priceMax.toLocaleString()} ${unitLabel}, depending on scope and local conditions.`,
      "Final pricing can change with materials, access, permits, urgency, disposal, and repair complexity.",
      "Pros should confirm the customer scope directly before giving a final quote.",
    ];
  }

  return [
    `Pricing for ${service} work depends on labor time, materials, access, urgency, and local market conditions.`,
    "Small jobs may be quoted as a flat visit, while larger work may need an inspection or itemized estimate.",
    "Pros should confirm the customer scope directly before giving a final quote.",
  ];
}

export function getRequestPricingFactors(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  return [
    `${service} labor time and number of workers needed`,
    "Materials, parts, disposal, and cleanup requirements",
    "Access conditions, height, wall type, equipment, or workspace limits",
    "Permit, license, safety, or inspection requirements when applicable",
    "Urgent, same-day, weekend, or after-hours scheduling",
  ];
}

export function getRequestAiSummary(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  return [
    `Request type: ${service}.`,
    `Service area: ${params.city}, ${params.state}.`,
    `Public scope: ${cleanText(params.publicDescription)}`,
    "Customer contact details are private and are never shown on the public page.",
    "Eligible pros can unlock contact details only through Fixly lead access.",
  ];
}

export function getRequestJobDetails(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  return [
    `Service type: ${service}.`,
    `Work area: ${params.city}, ${params.state}.`,
    "Customer contact details are private until the job is unlocked.",
  ];
}

export function getRequestStepByStepProcess(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  return [
    `Review the public ${service} request and location context.`,
    "Ask the homeowner clarifying questions about symptoms, timing, access, and constraints.",
    "Inspect the work area or request photos before final pricing when needed.",
    "Confirm labor, materials, permits, cleanup, and expected timeline.",
    "Complete the work, test the result, and explain any follow-up maintenance.",
  ];
}

export function getRequestComparisonItems(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  return [
    {
      label: "DIY or wait",
      detail:
        "May be reasonable only for minor, non-urgent issues that are not spreading or creating safety risk.",
    },
    {
      label: "Hire a local pro",
      detail: `Better for ${service} work involving active damage, specialized tools, safety concerns, code requirements, or uncertain scope.`,
    },
  ];
}

export function getRequestScopeItems(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  const baseItems = [
    `Review the ${service} request details`,
    "Confirm project scope with the customer",
    "Plan labor, materials, tools, access, and cleanup",
  ];

  if (params.subcategory?.commonProblems?.length) {
    return params.subcategory.commonProblems.slice(0, 5);
  }

  return baseItems;
}

export function getRequestProGuidance(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  return [
    `Confirm the ${service} scope before starting work.`,
    "Check access, timing, materials, disposal, and cleanup requirements.",
    "Unlock the job only when the location and scope match your service area.",
  ];
}

export function getRequestProSearchPhrases(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  return [
    `${service} jobs in ${params.city}, ${params.state}`,
    `${service} jobs near me`,
    `local ${service} work in ${params.city}`,
    `same-day ${service} jobs`,
    `small ${service} jobs for local pros`,
  ];
}

export function getRequestFaq(
  params: RequestEnrichmentParams
): RequestSeoFaqItem[] {
  const service = getServiceLower(params);
  const description = cleanText(params.publicDescription);
  const signals = getIssueSignals(description);

  return [
    {
      question: `How urgent is this ${service} request?`,
      answer:
        signals.isUrgent || signals.hasActiveDamage
          ? `The public description includes signs that this ${service} request may be time-sensitive. The homeowner should confirm whether the issue is active, unsafe, spreading, or blocking normal use.`
          : `The public description does not clearly mark this ${service} request as an emergency. Timing should still be confirmed because home-service issues can change after a request is posted.`,
    },
    {
      question: `What is the typical timeline for ${service} work?`,
      answer: `Small ${service} jobs may be assessed and completed in one visit, while larger or parts-dependent work can require inspection, ordering, scheduling, and follow-up. The exact timeline depends on scope, access, and materials.`,
    },
    {
      question: "Can this kind of issue get worse if it waits?",
      answer:
        signals.hasActiveDamage || signals.hasSystemFailure
          ? "Yes. Issues involving active damage, leaks, failed systems, electrical symptoms, clogs, or broken components can spread or become more expensive if left unresolved."
          : "Some home-service issues can worsen over time, especially when moisture, movement, electrical load, structural stress, or repeated use is involved.",
    },
    {
      question: "Should the homeowner stop using the affected system?",
      answer:
        "If the issue involves water, electricity, gas, smoke, burning smells, active leaks, structural movement, or unsafe operation, the homeowner should stop using the affected system when safe and contact a qualified professional.",
    },
    {
      question: `Are permits or licenses needed for this ${service} job?`,
      answer: `Permit and licensing requirements depend on the service type, location, and scope. Electrical, plumbing, HVAC, structural, roofing, and major installation work may require a licensed contractor or local permit.`,
    },
    {
      question: `What should a pro check before unlocking this ${service} job?`,
      answer:
        "A pro should review the job scope, location, access notes, timing, materials, disposal needs, and cleanup expectations before unlocking customer contact details.",
    },
    {
      question: "Where is this job located?",
      answer: `This public job request is located in ${params.city}, ${params.state}.`,
    },
    {
      question: "Can pros see the customer contact details?",
      answer:
        "Customer contact details are not shown publicly. Eligible pros can unlock customer contact details through paid job access on Fixly.",
    },
    {
      question: `How can I find similar ${service} jobs?`,
      answer: `Local pros can browse public Fixly requests, review job details, and unlock customer contact information for available work near ${params.city}.`,
    },
    {
      question: `How can I request similar ${service} help?`,
      answer: `Homeowners can submit a new Fixly request, choose the right service category, describe the job, and local pros near ${params.city} can review it.`,
    },
  ];
}

export function getRequestRelatedServiceLinks(
  params: RequestEnrichmentParams
): RequestSeoLink[] {
  if (!params.market) {
    return [];
  }

  const marketPath = getMarketUrlPath(params.market);
  const links: RequestSeoLink[] = [];

  links.push({
    title: `All home services in ${params.city}`,
    href: marketPath,
    description: `Browse home service categories and local job requests in ${params.city}, ${params.state}.`,
  });

  if (params.category) {
    links.push({
      title: `${params.category.shortTitle} in ${params.city}`,
      href: `${marketPath}/${params.category.slug}`,
      description: params.category.description,
    });
  }

  if (params.subcategory) {
    links.push({
      title: `${params.subcategory.shortTitle} in ${params.city}`,
      href: `${marketPath}/${params.subcategory.parentSlug}/${params.subcategory.slug}`,
      description: params.subcategory.description,
    });
  }

  return links;
}

export function getRequestIntentLinks(
  params: RequestEnrichmentParams
): RequestSeoLink[] {
  const servicePath = getServicePath(params);
  const service = getServiceShortTitle(params);

  if (!servicePath) return [];

  return getIndexableServiceIntents()
    .filter((intent) =>
      ["same-day", "emergency", "price", "licensed"].includes(intent.slug)
    )
    .slice(0, 4)
    .map((intent) => ({
      title: `${intent.title} ${service} in ${params.city}`,
      href: `${servicePath}/${intent.slug}`,
      description: intent.description,
    }));
}

export function getRequestNearbyMarketLinks(
  params: RequestEnrichmentParams
): RequestSeoLink[] {
  if (!params.market) {
    return [];
  }

  return getNearbyMarkets(params.market.slug)
    .filter(
      (market) =>
        market.countryCode.toLowerCase() ===
          params.market?.countryCode.toLowerCase() &&
        market.state.toLowerCase() === params.market?.state.toLowerCase()
    )
    .slice(0, 6)
    .map((market) => ({
      title: `Home service jobs in ${market.city}, ${market.state}`,
      href: getMarketUrlPath(market),
      description: `Browse local service areas and home service opportunities near ${market.city}.`,
    }));
}

export function getRequestStructuredData(params: RequestEnrichmentParams) {
  const service = getServiceShortTitle(params);
  const pricingGuidance = getRequestPricingGuidance(params);
  const semanticSummaries = getRequestSemanticSummaries(params);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: getRequestJobTitle(params),
    serviceType: service,
    category: params.category?.title,
    description: `${getRequestHeroSummary(params)} ${semanticSummaries
      .map((item) => item.body)
      .join(" ")}`,
    areaServed: {
      "@type": "City",
      name: params.city,
      addressRegion: params.state,
      addressCountry: params.market?.countryCode.toUpperCase(),
    },
    provider: {
      "@type": "Organization",
      name: "Fixly",
      url: "https://fixly.work",
    },
    subjectOf: {
      "@type": "WebPage",
      name: getRequestJobTitle(params),
      description: getRequestProblemSummary(params),
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".request-direct-summary", ".request-facts"],
      },
    },
    offers: params.leadPriceFixas
      ? {
          "@type": "Offer",
          price: (params.leadPriceFixas / 100).toFixed(2),
          priceCurrency: "USD",
        }
      : undefined,
    additionalProperty: pricingGuidance.map((item) => ({
      "@type": "PropertyValue",
      name: "Pricing guidance",
      value: item,
    })),
  };
}

export function getRequestFaqJsonLd(items: RequestSeoFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function getRequestHowToJsonLd(params: RequestEnrichmentParams) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to evaluate ${getServiceLower(params)} work in ${params.city}`,
    description: getRequestUrgencyContext(params),
    step: getRequestStepByStepProcess(params).map((item, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: item,
      text: item,
    })),
  };
}
