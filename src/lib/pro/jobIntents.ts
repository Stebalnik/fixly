export type ProJobIntent = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  body: string;
  keywords: string[];
};

export const proJobIntents: ProJobIntent[] = [
  {
    slug: "side-jobs-near-me",
    title: "Side Jobs Near Me for Home Service Pros",
    h1: "Side jobs near me for independent pros",
    description:
      "Find local side jobs, flexible service calls, and paid homeowner requests near you on Fixly Pro.",
    body: "Browse homeowner requests that can turn into evening jobs, weekend work, handyman gigs, repair calls, maintenance visits, cleanup jobs, and short-term local work.",
    keywords: ["side jobs near me", "local side jobs", "paid service calls"],
  },
  {
    slug: "weekend-handyman-jobs",
    title: "Weekend Handyman Jobs and Local Gigs",
    h1: "Weekend handyman jobs and local gigs",
    description:
      "Find weekend handyman jobs, small repair gigs, and flexible local service requests from homeowners.",
    body: "Fixly Pro helps pros find weekend jobs for repairs, mounting, assembly, cleanup, maintenance, small installations, and other local tasks that fit between larger projects.",
    keywords: ["weekend handyman jobs", "weekend gigs", "handyman side work"],
  },
  {
    slug: "temporary-work-for-contractors",
    title: "Temporary Work for Contractors and Small Crews",
    h1: "Temporary work for contractors and small crews",
    description:
      "Browse short-term home service work, fill schedule gaps, and find local requests that need qualified pros.",
    body: "Contractors and small crews can use Fixly Pro to find short-term repair work, maintenance requests, installation jobs, cleanup tasks, and other temporary work from nearby homeowners.",
    keywords: [
      "temporary work for contractors",
      "short term contractor jobs",
      "local contractor gigs",
    ],
  },
  {
    slug: "home-service-gigs",
    title: "Home Service Gigs and Local Repair Jobs",
    h1: "Home service gigs and local repair jobs",
    description:
      "Find local home service gigs for plumbing, electrical, cleaning, handyman, painting, lawn care, and repairs.",
    body: "Open requests on Fixly Pro include repair jobs, service calls, maintenance work, cleaning gigs, lawn jobs, painting projects, and other homeowner requests that can become paid local work.",
    keywords: ["home service gigs", "local repair jobs", "service gigs"],
  },
  {
    slug: "after-hours-service-jobs",
    title: "After-Hours Service Jobs for Pros",
    h1: "After-hours service jobs for pros",
    description:
      "Find evening service jobs, after-hours repair calls, and flexible local work on Fixly Pro.",
    body: "Pros looking for extra work after regular business hours can browse homeowner requests for repairs, maintenance, installations, and service calls that may fit flexible schedules.",
    keywords: [
      "after hours service jobs",
      "evening repair jobs",
      "after work side jobs",
    ],
  },
  {
    slug: "local-gigs-for-skilled-trades",
    title: "Local Gigs for Skilled Trades",
    h1: "Local gigs for skilled trades",
    description:
      "Browse local gig work for skilled trades, home repair pros, technicians, handymen, and small crews.",
    body: "Fixly Pro organizes open homeowner requests as local gigs for skilled trades so pros can find nearby work without waiting for large contracts or long hiring cycles.",
    keywords: [
      "local gigs for skilled trades",
      "trade jobs near me",
      "skilled labor gigs",
    ],
  },
];

export function getProJobIntent(slug: string) {
  return proJobIntents.find((intent) => intent.slug === slug) ?? null;
}

export function getProJobIntentPath(slug: string) {
  return `/side-jobs/${slug}`;
}

export function getProJobIntentUrl(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_PRO_SITE_URL ?? "https://pro.fixly.work";
  return `${baseUrl}${getProJobIntentPath(slug)}`;
}
