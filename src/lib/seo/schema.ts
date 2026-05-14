import type { Market } from "@/lib/geo";
import type { Category, Subcategory } from "@/lib/services";
import type { ServiceIntent } from "@/lib/seo/intents";
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

function getIntentServiceName(params: {
  title: string;
  intent?: ServiceIntent;
}) {
  const { title, intent } = params;

  if (!intent) return title;

  if (intent.slug === "price") return `${title} Cost`;
  if (intent.slug === "near-me") return `${title} Near Me`;
  if (intent.slug === "cheap") return `Affordable ${title}`;

  return `${intent.seoTitleSuffix} ${title}`;
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

  if (normalizedItems.length < 2) return null;

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
  intent?: ServiceIntent;
  url?: string;
}) {
  const { market, category, subcategory, intent, url } = params;

  const baseTitle = subcategory?.title ?? category?.title ?? "Home Services";
  const title = getIntentServiceName({
    title: baseTitle,
    intent,
  });

  const serviceName =
    subcategory?.shortTitle ?? category?.shortTitle ?? baseTitle;

  const cityLabel = market
    ? market.countryCode.toLowerCase() === "us"
      ? `${market.city}, ${market.state}`
      : `${market.city}, ${market.country}`
    : undefined;

  return cleanJsonLd({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": url ? `${absoluteUrl(url)}#service` : undefined,
    name: cityLabel ? `${title} in ${cityLabel}` : title,
    serviceType: intent
      ? `${intent.seoTitleSuffix} ${serviceName}`
      : serviceName,
    description:
      intent?.description ?? subcategory?.description ?? category?.description,
    url: url ? absoluteUrl(url) : undefined,
    category: category?.title,
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
            priceCurrency: market?.currency || "USD",
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
  intent?: ServiceIntent;
}) {
  const faq = getServiceFaq(params);

  if (!faq.length) return null;

  return cleanJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: params.intent
        ? `${params.intent.title}: ${item.question}`
        : item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: params.intent
          ? `${params.intent.description} ${item.answer}`
          : item.answer,
      },
    })),
  });
}

export function getJsonLdScriptProps(jsonLd: JsonLdObject | null) {
  if (!jsonLd) return null;

  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
    },
  };
}