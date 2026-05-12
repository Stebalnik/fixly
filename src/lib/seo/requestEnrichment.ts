import type { Market } from "@/lib/geo";
import { getMarketUrlPath, getNearbyMarkets } from "@/lib/geo";
import type { Category } from "@/lib/services/categories";
import type { Subcategory } from "@/lib/services/types";

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

export function getRequestJobDetails(params: RequestEnrichmentParams) {
  const service = getServiceLower(params);

  return [
    `Service type: ${service}.`,
    `Work area: ${params.city}, ${params.state}.`,
    "Customer contact details are private until the job is unlocked.",
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

  return [
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
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: getRequestJobTitle(params),
    description: getRequestHeroSummary(params),
    areaServed: {
      "@type": "City",
      name: params.city,
      addressRegion: params.state,
    },
    provider: {
      "@type": "Organization",
      name: "Fixly",
      url: "https://fixly.work",
    },
    offers: params.leadPriceFixas
      ? {
          "@type": "Offer",
          price: (params.leadPriceFixas / 100).toFixed(2),
          priceCurrency: "USD",
        }
      : undefined,
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