import type { Metadata } from "next";
import type { Market } from "@/lib/geo";
import { getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";

const SITE_URL = "https://fixly.work";

export type GeoHubFaqItem = {
  question: string;
  answer: string;
};

export type GeoHubSearch = {
  label: string;
  href: string;
};

export function getGeoHubTitle(market: Market) {
  return `Home Services in ${market.city}, ${market.state}`;
}

export function getGeoHubDescription(market: Market) {
  return `Find local home service pros in ${market.city}, ${market.stateFull}. Browse popular categories, compare common service searches, and submit a request on Fixly.`;
}

export function getGeoHubMetadata(market: Market): Metadata {
  const path = getMarketUrlPath(market);
  const title = `${getGeoHubTitle(market)} | Fixly`;
  const description = getGeoHubDescription(market);

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "Fixly",
      type: "website",
    },
  };
}

export function getGeoHubPopularSearches(params: {
  market: Market;
  categories: Category[];
}): GeoHubSearch[] {
  const { market, categories } = params;
  const marketPath = getMarketUrlPath(market);
  const topCategories = categories.slice(0, 8);

  return topCategories.flatMap((category) => [
    {
      label: `${category.shortTitle} near me in ${market.city}`,
      href: `${marketPath}/${category.slug}`,
    },
    {
      label: `Same-day ${category.shortTitle.toLowerCase()} in ${market.city}`,
      href: `${marketPath}/${category.slug}`,
    },
  ]);
}

export function getGeoHubFaq(market: Market): GeoHubFaqItem[] {
  return [
    {
      question: `How do I find home services in ${market.city}?`,
      answer: `You can browse popular home service categories in ${market.city}, choose the type of work you need, and submit a request on Fixly so local pros can respond.`,
    },
    {
      question: `What types of home services are available in ${market.city}?`,
      answer:
        "Fixly supports common home services such as plumbing, handyman work, electrical work, cleaning, painting, roofing, lawn care, appliance repair, junk removal, HVAC, pest control, moving, and more.",
    },
    {
      question: `Can I submit a service request in ${market.city}?`,
      answer: `Yes. You can create a request with your service category, project details, location, timing, and photos so pros near ${market.city} can review it.`,
    },
    {
      question: `Does Fixly show nearby cities around ${market.city}?`,
      answer: `Yes. Fixly links to nearby same-state service areas when they are available in the geo library.`,
    },
  ];
}

export function getGeoHubInternalLinks(params: {
  market: Market;
  categories: Category[];
}) {
  const { market, categories } = params;
  const marketPath = getMarketUrlPath(market);

  return [
    {
      title: "Browse all services",
      href: "/services",
      description: "Explore the full Fixly service directory.",
    },
    {
      title: "Open service requests",
      href: "/requests",
      description: "See public homeowner requests available to local pros.",
    },
    {
      title: "Create a request",
      href: `/book?market=${market.slug}`,
      description: `Post a home service request in ${market.city}.`,
    },
    ...categories.slice(0, 4).map((category) => ({
      title: `${category.shortTitle} in ${market.city}`,
      href: `${marketPath}/${category.slug}`,
      description: category.description,
    })),
  ];
}