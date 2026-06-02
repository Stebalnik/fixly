import {
  categories,
  getCategoryBySlug,
  getSubcategoryBySlug,
  subcategories,
} from "@/lib/services";
import { getProJobsBaseUrl, type ProJobRequest } from "./jobs";

export type ProJobSeoKind = "category_city" | "subcategory_city" | "category_state";

export type ProJobSeoTarget = {
  slug: string;
  kind: ProJobSeoKind;
  categorySlug: string;
  subcategorySlug?: string;
  city?: string;
  state: string;
  count?: number;
  lastModified?: Date;
};

export type ProJobSeoPage = ProJobSeoTarget & {
  title: string;
  h1: string;
  description: string;
  intro: string;
  keywords: string[];
  relatedLinks: ProJobSeoRelatedLink[];
  jobs: ProJobRequest[];
};

type ProJobSeoSourceRow = ProJobRequest & {
  updated_at?: string | null;
};

export type ProJobSeoRelatedLink = {
  href: string;
  title: string;
  description: string;
};

const MAX_SEO_TARGETS = 3500;
const STATE_NAME_BY_CODE: Record<string, string> = {
  al: "Alabama",
  ak: "Alaska",
  az: "Arizona",
  ar: "Arkansas",
  ca: "California",
  co: "Colorado",
  ct: "Connecticut",
  de: "Delaware",
  fl: "Florida",
  ga: "Georgia",
  hi: "Hawaii",
  id: "Idaho",
  il: "Illinois",
  in: "Indiana",
  ia: "Iowa",
  ks: "Kansas",
  ky: "Kentucky",
  la: "Louisiana",
  me: "Maine",
  md: "Maryland",
  ma: "Massachusetts",
  mi: "Michigan",
  mn: "Minnesota",
  ms: "Mississippi",
  mo: "Missouri",
  mt: "Montana",
  ne: "Nebraska",
  nv: "Nevada",
  nh: "New Hampshire",
  nj: "New Jersey",
  nm: "New Mexico",
  ny: "New York",
  nc: "North Carolina",
  nd: "North Dakota",
  oh: "Ohio",
  ok: "Oklahoma",
  or: "Oregon",
  pa: "Pennsylvania",
  ri: "Rhode Island",
  sc: "South Carolina",
  sd: "South Dakota",
  tn: "Tennessee",
  tx: "Texas",
  ut: "Utah",
  vt: "Vermont",
  va: "Virginia",
  wa: "Washington",
  wv: "West Virginia",
  wi: "Wisconsin",
  wy: "Wyoming",
  dc: "Washington DC",
};

export function getProJobSeoPath(slug: string) {
  return `/jobs/${slug}`;
}

export function getProJobSeoUrl(slug: string) {
  return `${getProJobsBaseUrl()}${getProJobSeoPath(slug)}`;
}

export function buildProJobSeoTargets(rows: ProJobSeoSourceRow[]) {
  const targetMap = new Map<string, ProJobSeoTarget>();

  for (const row of rows) {
    if (!row.category_slug || !row.city || !row.state) {
      continue;
    }

    addTarget(targetMap, {
      slug: buildCategoryCitySlug(row.category_slug, row.city, row.state),
      kind: "category_city",
      categorySlug: row.category_slug,
      city: row.city,
      state: row.state,
      lastModified: getRowLastModified(row),
    });

    if (row.subcategory_slug) {
      addTarget(targetMap, {
        slug: buildSubcategoryCitySlug(
          row.subcategory_slug,
          row.city,
          row.state
        ),
        kind: "subcategory_city",
        categorySlug: row.category_slug,
        subcategorySlug: row.subcategory_slug,
        city: row.city,
        state: row.state,
        lastModified: getRowLastModified(row),
      });
    }

    addTarget(targetMap, {
      slug: buildCategoryStateSlug(row.category_slug, row.state),
      kind: "category_state",
      categorySlug: row.category_slug,
      state: row.state,
      lastModified: getRowLastModified(row),
    });
  }

  return Array.from(targetMap.values())
    .sort((a, b) => {
      const countDiff = (b.count ?? 0) - (a.count ?? 0);
      if (countDiff !== 0) return countDiff;
      return (b.lastModified?.getTime() ?? 0) - (a.lastModified?.getTime() ?? 0);
    })
    .slice(0, MAX_SEO_TARGETS);
}

export function parseProJobSeoSlug(slug: string): ProJobSeoTarget | null {
  const stateMatch = slug.match(/^(.+)-side-jobs-in-([a-z]{2})$/);

  if (stateMatch) {
    const categorySlug = stateMatch[1];
    if (!categories[categorySlug]) return null;

    return {
      slug,
      kind: "category_state",
      categorySlug,
      state: stateMatch[2].toUpperCase(),
    };
  }

  const cityMatch = slug.match(/^(.+)-jobs-in-(.+)-([a-z]{2})$/);

  if (!cityMatch) {
    return null;
  }

  const serviceSlug = cityMatch[1];
  const city = titleCase(cityMatch[2].replace(/-/g, " "));
  const state = cityMatch[3].toUpperCase();

  if (categories[serviceSlug]) {
    return {
      slug,
      kind: "category_city",
      categorySlug: serviceSlug,
      city,
      state,
    };
  }

  const subcategory = subcategories[serviceSlug];

  if (!subcategory) {
    return null;
  }

  return {
    slug,
    kind: "subcategory_city",
    categorySlug: subcategory.parentSlug,
    subcategorySlug: serviceSlug,
    city,
    state,
  };
}

export function buildProJobSeoPage(
  target: ProJobSeoTarget,
  jobs: ProJobRequest[]
): ProJobSeoPage {
  const serviceLabel = getServiceLabel(target);
  const locationLabel = getLocationLabel(target);
  const stateName = getStateName(target.state);

  const h1 =
    target.kind === "category_state"
      ? `${serviceLabel} side jobs in ${stateName}`
      : `${serviceLabel} jobs in ${locationLabel}`;

  const title =
    target.kind === "category_state"
      ? `${serviceLabel} Side Jobs in ${stateName} | Fixly Pro`
      : `${serviceLabel} Jobs in ${locationLabel} | Fixly Pro`;

  const description =
    target.kind === "category_state"
      ? `Find ${serviceLabel.toLowerCase()} side jobs, local gigs, temporary work, and affordable home service leads in ${stateName} on Fixly Pro.`
      : `Find ${serviceLabel.toLowerCase()} jobs, local gigs, temporary work, and affordable home service leads in ${locationLabel} on Fixly Pro.`;

  return {
    ...target,
    title,
    h1,
    description,
    intro: buildIntro({ target, serviceLabel, locationLabel, stateName }),
    keywords: buildKeywords({ target, serviceLabel, locationLabel, stateName }),
    relatedLinks: buildRelatedLinks({
      target,
      serviceLabel,
      locationLabel,
      stateName,
    }),
    jobs,
  };
}

export function buildProJobRelatedLinks(
  request: ProJobRequest
): ProJobSeoRelatedLink[] {
  const category = getCategoryBySlug(request.category_slug);
  const subcategory = request.subcategory_slug
    ? getSubcategoryBySlug(request.subcategory_slug)
    : null;
  const serviceLabel =
    subcategory?.shortTitle ??
    subcategory?.title ??
    category?.shortTitle ??
    category?.title ??
    titleCase(request.category_slug);
  const cityLocation = `${request.city}, ${request.state}`;
  const stateName = getStateName(request.state);
  const links: ProJobSeoRelatedLink[] = [
    {
      href: getProJobSeoPath(
        buildCategoryCitySlug(request.category_slug, request.city, request.state)
      ),
      title: `${category?.shortTitle ?? serviceLabel} jobs in ${cityLocation}`,
      description: `See related ${category?.shortTitle.toLowerCase() ?? "home service"} gigs, side jobs, and temporary work in ${cityLocation}.`,
    },
    {
      href: getProJobSeoPath(buildCategoryStateSlug(request.category_slug, request.state)),
      title: `${category?.shortTitle ?? serviceLabel} side jobs in ${stateName}`,
      description: `Browse statewide ${category?.shortTitle.toLowerCase() ?? "home service"} opportunities and affordable leads for pros.`,
    },
    {
      href: "/side-jobs",
      title: "Side jobs and temporary work",
      description:
        "Explore long-tail Fixly Pro pages for local gigs, weekend work, and contractor job searches.",
    },
  ];

  if (request.subcategory_slug && subcategory) {
    links.splice(1, 0, {
      href: getProJobSeoPath(
        buildSubcategoryCitySlug(
          request.subcategory_slug,
          request.city,
          request.state
        )
      ),
      title: `${subcategory.shortTitle} jobs in ${cityLocation}`,
      description: `Find more ${subcategory.shortTitle.toLowerCase()} leads and temporary service calls near ${cityLocation}.`,
    });
  }

  return dedupeRelatedLinks(links).slice(0, 4);
}

export function buildCategoryCitySlug(
  categorySlug: string,
  city: string,
  state: string
) {
  return `${categorySlug}-jobs-in-${slugify(city)}-${slugify(state)}`;
}

export function buildSubcategoryCitySlug(
  subcategorySlug: string,
  city: string,
  state: string
) {
  return `${subcategorySlug}-jobs-in-${slugify(city)}-${slugify(state)}`;
}

export function buildCategoryStateSlug(categorySlug: string, state: string) {
  return `${categorySlug}-side-jobs-in-${slugify(state)}`;
}

function addTarget(
  targetMap: Map<string, ProJobSeoTarget>,
  target: ProJobSeoTarget
) {
  const existing = targetMap.get(target.slug);

  if (!existing) {
    targetMap.set(target.slug, {
      ...target,
      count: 1,
    });
    return;
  }

  existing.count = (existing.count ?? 0) + 1;

  if (
    target.lastModified &&
    (!existing.lastModified || target.lastModified > existing.lastModified)
  ) {
    existing.lastModified = target.lastModified;
  }
}

function buildIntro(args: {
  target: ProJobSeoTarget;
  serviceLabel: string;
  locationLabel: string;
  stateName: string;
}) {
  const location =
    args.target.kind === "category_state"
      ? args.stateName
      : args.locationLabel;

  return `Fixly Pro organizes open homeowner requests into local job pages for pros searching for ${args.serviceLabel.toLowerCase()} work in ${location}. Use this page to discover side jobs, weekend jobs, short-term gigs, temporary service calls, and affordable leads without exposing customer contact details until a registered pro chooses to unlock the opportunity.`;
}

function buildKeywords(args: {
  target: ProJobSeoTarget;
  serviceLabel: string;
  locationLabel: string;
  stateName: string;
}) {
  const location =
    args.target.kind === "category_state"
      ? args.stateName
      : args.locationLabel;
  const service = args.serviceLabel.toLowerCase();

  return [
    `${service} jobs in ${location}`,
    `${service} side jobs ${location}`,
    `${service} gigs near me`,
    `${service} leads ${location}`,
    `temporary ${service} work`,
    `weekend ${service} jobs`,
    `local contractor jobs ${location}`,
    `cheap home service leads ${location}`,
    `Thumbtack alternative for ${service}`,
    `Angi leads alternative for ${service}`,
  ];
}

function buildRelatedLinks(args: {
  target: ProJobSeoTarget;
  serviceLabel: string;
  locationLabel: string;
  stateName: string;
}): ProJobSeoRelatedLink[] {
  const links: ProJobSeoRelatedLink[] = [];
  const service = args.serviceLabel.toLowerCase();

  if (args.target.city) {
    links.push({
      href: getProJobSeoPath(
        buildCategoryStateSlug(args.target.categorySlug, args.target.state)
      ),
      title: `${getCategoryLabel(args.target.categorySlug)} side jobs in ${args.stateName}`,
      description: `Browse more ${getCategoryLabel(args.target.categorySlug).toLowerCase()} side jobs and temporary work across ${args.stateName}.`,
    });
  }

  if (args.target.kind === "subcategory_city" && args.target.city) {
    links.push({
      href: getProJobSeoPath(
        buildCategoryCitySlug(
          args.target.categorySlug,
          args.target.city,
          args.target.state
        )
      ),
      title: `${getCategoryLabel(args.target.categorySlug)} jobs in ${args.locationLabel}`,
      description: `See broader ${getCategoryLabel(args.target.categorySlug).toLowerCase()} work, gigs, and local leads in ${args.locationLabel}.`,
    });
  }

  links.push(
    {
      href: "/jobs/browse",
      title: "Browse all open Fixly Pro jobs",
      description:
        "Filter open opportunities by location, service type, keyword, and date posted.",
    },
    {
      href: "/side-jobs",
      title: "Side jobs and temporary work hub",
      description:
        "Explore job search pages for weekend gigs, contractor work, local service calls, and after-hours jobs.",
    },
    {
      href: `/jobs/browse?category=${args.target.categorySlug}`,
      title: `${getCategoryLabel(args.target.categorySlug)} jobs on Fixly Pro`,
      description: `Filter current ${service} opportunities and affordable leads across Fixly Pro.`,
    }
  );

  return dedupeRelatedLinks(links).slice(0, 5);
}

function getServiceLabel(target: ProJobSeoTarget) {
  const subcategory = target.subcategorySlug
    ? getSubcategoryBySlug(target.subcategorySlug)
    : null;
  const category = getCategoryBySlug(target.categorySlug);

  return (
    subcategory?.shortTitle ??
    subcategory?.title ??
    category?.shortTitle ??
    category?.title ??
    titleCase(target.subcategorySlug ?? target.categorySlug)
  );
}

function getCategoryLabel(categorySlug: string) {
  const category = getCategoryBySlug(categorySlug);
  return category?.shortTitle ?? category?.title ?? titleCase(categorySlug);
}

function getLocationLabel(target: ProJobSeoTarget) {
  return target.city ? `${target.city}, ${target.state}` : getStateName(target.state);
}

function getStateName(state: string) {
  return STATE_NAME_BY_CODE[state.toLowerCase()] ?? state.toUpperCase();
}

function getRowLastModified(row: ProJobSeoSourceRow) {
  return new Date(row.updated_at ?? row.created_at ?? Date.now());
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dedupeRelatedLinks(links: ProJobSeoRelatedLink[]) {
  const seen = new Set<string>();
  const result: ProJobSeoRelatedLink[] = [];

  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    result.push(link);
  }

  return result;
}
