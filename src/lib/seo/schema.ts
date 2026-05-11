import type { Market } from "@/lib/geo";
import type { Category, Subcategory } from "@/lib/services";
import { getServiceFaq } from "./content";

const SITE_URL = "https://fixly.work";
const ORGANIZATION_NAME = "Fixly";

export type JsonLdObject = Record<string, unknown>;

export type BreadcrumbJsonLdItem = {
  name: string;
  url: string;
};

function absoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;

  return `${SITE_URL}${path}`;
}

function cleanJsonLd<T extends JsonLdObject>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      if (Array.isArray(value) && value.length === 0) {
        return undefined;
      }

      return value;
    })
  ) as T;
}

export function getOrganizationJsonLd() {
  return cleanJsonLd({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Fixly helps homeowners find local professionals for home services and repair requests.",
  });
}

export function getBreadcrumbJsonLd(items: BreadcrumbJsonLdItem[]) {
  const normalizedItems = items
    .filter((item) => item.name && item.url)
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    }));

  if (normalizedItems.length < 2) {
    return null;
  }

  return cleanJsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: normalizedItems,
  });
}

export function getServiceJsonLd(params: {
  market?: Market;
  category?: Category;
  subcategory?: Subcategory;
  url?: string;
}) {
  const { market, category, subcategory, url } = params;

  const title = subcategory?.title ?? category?.title ?? "Home Services";
  const serviceName =
    subcategory?.shortTitle ?? category?.shortTitle ?? title;

  return cleanJsonLd({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": url ? `${absoluteUrl(url)}#service` : undefined,
    name: market ? `${title} in ${market.city}, ${market.state}` : title,
    serviceType: serviceName,
    description: subcategory?.description ?? category?.description,
    url: url ? absoluteUrl(url) : undefined,
    areaServed: market
      ? {
          "@type": "City",
          name: market.city,
          addressRegion: market.state,
          addressCountry: market.countryCode.toUpperCase(),
        }
      : undefined,
    provider: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: ORGANIZATION_NAME,
      url: SITE_URL,
    },
    offers:
      subcategory?.priceMin && subcategory?.priceMax
        ? {
            "@type": "AggregateOffer",
            priceCurrency: market?.currency ?? "USD",
            lowPrice: subcategory.priceMin,
            highPrice: subcategory.priceMax,
            offerCount: 1,
          }
        : undefined,
  });
}

export function getFaqJsonLd(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
}) {
  const faq = getServiceFaq(params);

  if (!faq.length) {
    return null;
  }

  return cleanJsonLd({
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
  });
}

export function getJsonLdScriptProps(jsonLd: JsonLdObject | null) {
  if (!jsonLd) {
    return null;
  }

  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
    },
  };
}