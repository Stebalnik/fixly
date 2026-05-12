import type { Metadata } from "next";
import type { Market } from "@/lib/geo";
import type { Category, Subcategory } from "@/lib/services";
import type { ServiceIntent } from "@/lib/seo/intents";
import { getIntentValidation } from "@/lib/seo/intentMappings";

function formatMarket(market: Market) {
  if (market.countryCode.toLowerCase() === "us") {
    return `${market.city}, ${market.state}`;
  }

  return `${market.city}, ${market.country}`;
}

function getServiceName(category?: Category, subcategory?: Subcategory) {
  return subcategory?.title ?? category?.title ?? "Home Service";
}

function getServiceNameLower(category?: Category, subcategory?: Subcategory) {
  return getServiceName(category, subcategory).toLowerCase();
}

function getIntentTitlePrefix(intent: ServiceIntent) {
  if (intent.slug === "price") return "";
  if (intent.slug === "near-me") return "";
  if (intent.slug === "cheap") return "Affordable";
  return intent.seoTitleSuffix;
}

function getTitle(args: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent: ServiceIntent;
}) {
  const { market, category, subcategory, intent } = args;
  const location = formatMarket(market);
  const serviceName = getServiceName(category, subcategory);
  const prefix = getIntentTitlePrefix(intent);

  if (intent.slug === "price") {
    return `${serviceName} Cost in ${location} | Fixly`;
  }

  if (intent.slug === "near-me") {
    return `${serviceName} Near Me in ${location} | Fixly`;
  }

  if (intent.slug === "emergency") {
    return `Emergency ${serviceName} in ${location} | Fixly`;
  }

  if (intent.slug === "24-hour") {
    return `24 Hour ${serviceName} in ${location} | Fixly`;
  }

  if (prefix) {
    return `${prefix} ${serviceName} in ${location} | Fixly`;
  }

  return `${intent.title} ${serviceName} in ${location} | Fixly`;
}

function getDescription(args: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent: ServiceIntent;
}) {
  const { market, category, subcategory, intent } = args;
  const location = formatMarket(market);
  
  const serviceNameLower = getServiceNameLower(category, subcategory);

  if (intent.slug === "price") {
    return `Compare ${serviceNameLower} costs in ${location}. Review typical price factors, project scope, labor, materials, urgency, and request quotes from local pros on Fixly.`;
  }

  if (intent.slug === "near-me") {
    return `Find ${serviceNameLower} near you in ${location}. Submit one request, describe the job, and connect with available local pros through Fixly.`;
  }

  if (intent.slug === "same-day") {
    return `Need same-day ${serviceNameLower} in ${location}? Request fast local help, compare availability, and get responses from pros who can review your job today.`;
  }

  if (intent.slug === "emergency") {
    return `Request emergency ${serviceNameLower} in ${location}. Describe the urgent issue, compare available local pros, and get help for problems that should not wait.`;
  }

  if (intent.slug === "24-hour") {
    return `Find 24-hour ${serviceNameLower} in ${location}. Request help for urgent, after-hours, weekend, or time-sensitive service needs through Fixly.`;
  }

  if (intent.slug === "cheap") {
    return `Find affordable ${serviceNameLower} in ${location}. Compare local options, understand cost factors, and request quotes from available pros on Fixly.`;
  }

  if (intent.slug === "licensed") {
    return `Find licensed ${serviceNameLower} in ${location}. Compare local pros for projects where licensing, safety, permits, or technical experience may matter.`;
  }

  if (intent.slug === "insured") {
    return `Find insured ${serviceNameLower} in ${location}. Request service from local pros and compare options for safer home and property projects.`;
  }

  if (intent.slug === "commercial") {
    return `Request commercial ${serviceNameLower} in ${location}. Find pros for offices, retail spaces, rental properties, facilities, and business service needs.`;
  }

  if (intent.slug === "residential") {
    return `Request residential ${serviceNameLower} in ${location}. Find local pros for home repairs, maintenance, installation, cleanup, and improvement projects.`;
  }

  if (intent.slug === "move-out") {
    return `Find move-out ${serviceNameLower} in ${location}. Request help with turnover, cleaning, moving-related service needs, and final property preparation.`;
  }

  if (intent.slug === "deep-cleaning") {
    return `Request deep cleaning service in ${location}. Find local pros for detailed cleaning, heavy buildup, move preparation, seasonal cleaning, and full-home refreshes.`;
  }

  if (intent.slug === "weekend") {
    return `Find weekend ${serviceNameLower} in ${location}. Request local service when weekday scheduling does not work and compare available pros on Fixly.`;
  }

  return `${intent.description} Compare local ${serviceNameLower} options in ${location}, review pricing factors, and request help from available pros on Fixly.`;
}

export function getIntentPageMeta(args: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent: ServiceIntent;
  canonicalPath: string;
}): Metadata {
  const { market, category, subcategory, intent, canonicalPath } = args;

  const validation = getIntentValidation({
    category,
    subcategory,
    intentSlug: intent.slug,
  });

  const title = getTitle({
    market,
    category,
    subcategory,
    intent,
  });

  const description = getDescription({
    market,
    category,
    subcategory,
    intent,
  });

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    robots: {
      index: validation.status !== "blocked",
      follow: validation.status !== "blocked",
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "website",
    },
  };
}

export function getIntentH1(args: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent: ServiceIntent;
}) {
  const serviceName = getServiceName(args.category, args.subcategory);

  if (args.intent.slug === "price") {
    return `${serviceName} Cost in ${args.market.city}`;
  }

  if (args.intent.slug === "near-me") {
    return `${serviceName} Near Me in ${args.market.city}`;
  }

  if (args.intent.slug === "emergency") {
    return `Emergency ${serviceName} in ${args.market.city}`;
  }

  if (args.intent.slug === "24-hour") {
    return `24 Hour ${serviceName} in ${args.market.city}`;
  }

  if (args.intent.slug === "cheap") {
    return `Affordable ${serviceName} in ${args.market.city}`;
  }

  return `${args.intent.seoTitleSuffix} ${serviceName} in ${args.market.city}`;
}