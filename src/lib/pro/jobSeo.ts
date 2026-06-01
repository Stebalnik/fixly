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
  jobs: ProJobRequest[];
};

type ProJobSeoSourceRow = ProJobRequest & {
  updated_at?: string | null;
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
    jobs,
  };
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
