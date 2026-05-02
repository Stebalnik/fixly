import type { Market } from "@/lib/geo";
import type { Category, Subcategory } from "@/lib/services";
import { getServiceFaq } from "./content";

export function getServiceJsonLd(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
}) {
  const { market, category, subcategory } = params;

  const title = subcategory?.title ?? category?.title ?? "Home Services";
  const serviceName =
    subcategory?.shortTitle ?? category?.shortTitle ?? "Home Service";

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${title} in ${market.city}, ${market.state}`,
    serviceType: serviceName,
    areaServed: {
      "@type": "City",
      name: market.city,
      addressRegion: market.state,
      addressCountry: market.countryCode.toUpperCase(),
    },
    provider: {
      "@type": "Organization",
      name: "Fixly",
      url: "https://fixly.work",
    },
  };
}

export function getFaqJsonLd(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
}) {
  const faq = getServiceFaq(params);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}