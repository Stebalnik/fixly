import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getAllMarkets,
  getMarketBySlug,
  getMarketUrlPath,
  getNearbyMarkets,
} from "@/lib/geo";
import { categories, getSubcategoryBySlug } from "@/lib/services";
import { scoreProForMarketplace } from "./pro-ranking";

const DEFAULT_PRO_NAME = "Fixly Pro";
export const SERVICE_RADIUS_OPTIONS = [5, 15, 30, 50] as const;

export const PUBLIC_PRO_PROFILE_SELECT = `
  user_id,
  slug,
  display_name,
  company_name,
  full_name,
  contact_name,
  contact_email,
  contact_phone,
  avatar_url,
  logo_url,
  bio,
  years_experience,
  service_categories,
  service_subcategories,
  service_areas,
  home_market_slug,
  service_radius_miles,
  derived_service_area_slugs,
  licenses,
  identity_verified,
  license_verified,
  insurance_verified,
  background_check_status,
  portfolio_images,
  verification_status,
  average_response_minutes,
  response_rate,
  completed_jobs_count,
  repeat_customers_count,
  unlocked_leads_count,
  lead_response_count,
  rating_average,
  reviews_count,
  rating_summary
`;

export type PublicProProfile = {
  user_id: string;
  slug: string | null;
  display_name: string | null;
  company_name: string;
  full_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  bio: string | null;
  years_experience: number | null;
  service_categories: string[] | null;
  service_subcategories: string[] | null;
  service_areas: string[] | null;
  home_market_slug: string | null;
  service_radius_miles: number | null;
  derived_service_area_slugs: string[] | null;
  licenses: Array<Record<string, unknown>> | null;
  identity_verified: boolean | null;
  license_verified: boolean | null;
  insurance_verified: boolean | null;
  background_check_status: string | null;
  portfolio_images: Array<Record<string, unknown>> | null;
  verification_status: string | null;
  average_response_minutes: number | null;
  response_rate: number | null;
  completed_jobs_count: number | null;
  repeat_customers_count: number | null;
  unlocked_leads_count: number | null;
  lead_response_count: number | null;
  rating_average: number | null;
  reviews_count: number | null;
  rating_summary: {
    average?: number;
    count?: number;
    qualityAverage?: number;
    communicationAverage?: number;
    valueAverage?: number;
    punctualityAverage?: number;
  } | null;
};

export type ProProfileCompletion = {
  score: number;
  completedFields: string[];
  missingFields: string[];
  nextBestAction: string;
};

export type PublicProReview = {
  id: string;
  rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  value_rating: number | null;
  punctuality_rating: number | null;
  review_title: string | null;
  review_body: string | null;
  review_text: string | null;
  verified: boolean;
  created_at: string;
};

export async function getPublicProProfileBySlug(slug: string) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("pro_profiles")
    .select(PUBLIC_PRO_PROFILE_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .eq("public_profile_enabled", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizePublicProProfile(data as PublicProProfile) : null;
}

export async function getFeaturedPublicPros(args: {
  marketSlug?: string | null;
  categorySlug?: string | null;
  limit?: number;
}) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("pro_profiles")
    .select(PUBLIC_PRO_PROFILE_SELECT)
    .eq("status", "active")
    .eq("public_profile_enabled", true)
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as PublicProProfile[])
    .map(normalizePublicProProfile)
    .filter((profile) => Boolean(getProProfileSlug(profile)))
    .map((profile) => ({
      profile,
      ranking: getProRanking(profile, {
        marketSlug: args.marketSlug,
        categorySlug: args.categorySlug,
      }),
    }))
    .sort((a, b) => b.ranking.rankingScore - a.ranking.rankingScore)
    .slice(0, args.limit ?? 6);
}

export async function getPublicProReviews(proUserId: string) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("pro_reviews")
    .select(
      "id, rating, quality_rating, communication_rating, value_rating, punctuality_rating, review_title, review_body, review_text, verified, created_at"
    )
    .eq("pro_user_id", proUserId)
    .eq("moderation_status", "approved")
    .order("verified", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PublicProReview[];
}

export function getProRanking(
  profile: PublicProProfile,
  target?: { marketSlug?: string | null; categorySlug?: string | null }
) {
  return scoreProForMarketplace({
    averageResponseMinutes: profile.average_response_minutes,
    ratingAverage: getProRatingAverage(profile),
    reviewCount: getProReviewsCount(profile),
    serviceAreas: getProServiceAreaSlugs(profile),
    serviceCategories: profile.service_categories,
    targetMarketSlug: target?.marketSlug,
    targetCategorySlug: target?.categorySlug,
    unlockedLeadsCount: profile.unlocked_leads_count,
    leadResponseCount: profile.lead_response_count,
    completedJobsCount: profile.completed_jobs_count,
    repeatCustomersCount: profile.repeat_customers_count,
  });
}

export function normalizePublicProProfile(
  profile: PublicProProfile
): PublicProProfile {
  const displayName = cleanText(profile.display_name);
  const companyName = cleanText(profile.company_name);
  const fullName = cleanText(profile.full_name);

  return {
    ...profile,
    slug: cleanText(profile.slug) ?? createFallbackSlug(displayName ?? companyName ?? fullName ?? profile.user_id),
    display_name: displayName ?? companyName ?? fullName ?? DEFAULT_PRO_NAME,
    company_name: companyName ?? DEFAULT_PRO_NAME,
    full_name: fullName,
    contact_name: cleanText(profile.contact_name),
    contact_email: cleanText(profile.contact_email),
    contact_phone: cleanText(profile.contact_phone),
    avatar_url: getSafeHttpUrl(profile.avatar_url),
    logo_url: getSafeHttpUrl(profile.logo_url),
    bio: cleanText(profile.bio),
    years_experience: normalizeNonnegativeNumber(profile.years_experience),
    service_categories: normalizeSlugList(profile.service_categories),
    service_subcategories: normalizeSubcategorySlugs(
      profile.service_subcategories,
      profile.service_categories
    ),
    home_market_slug: cleanText(profile.home_market_slug),
    service_radius_miles: normalizeServiceRadius(profile.service_radius_miles),
    derived_service_area_slugs: normalizeSlugList(
      profile.derived_service_area_slugs
    ),
    service_areas: normalizeSlugList(
      profile.derived_service_area_slugs?.length
        ? profile.derived_service_area_slugs
        : profile.service_areas
    ),
    licenses: Array.isArray(profile.licenses) ? profile.licenses : [],
    identity_verified: Boolean(profile.identity_verified),
    license_verified: Boolean(profile.license_verified),
    insurance_verified: Boolean(profile.insurance_verified),
    background_check_status:
      cleanText(profile.background_check_status) ?? "not_started",
    portfolio_images: Array.isArray(profile.portfolio_images)
      ? profile.portfolio_images
      : [],
    verification_status: cleanText(profile.verification_status) ?? "unverified",
    average_response_minutes: normalizeNonnegativeNumber(
      profile.average_response_minutes
    ),
    response_rate: normalizePercent(profile.response_rate),
    completed_jobs_count: normalizeNonnegativeNumber(profile.completed_jobs_count),
    repeat_customers_count: normalizeNonnegativeNumber(
      profile.repeat_customers_count
    ),
    unlocked_leads_count: normalizeNonnegativeNumber(profile.unlocked_leads_count),
    lead_response_count: normalizeNonnegativeNumber(profile.lead_response_count),
    rating_average: normalizeRating(profile.rating_average),
    reviews_count: normalizeNonnegativeNumber(profile.reviews_count),
    rating_summary: profile.rating_summary ?? null,
  };
}

export function getPublicProServiceLinks(profile: PublicProProfile) {
  return (profile.service_categories ?? [])
    .map((slug) => {
      const category = categories[slug];
      if (!category) return null;

      return {
        title: category.shortTitle,
        href: `/${category.slug}`,
        description: category.description,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function getPublicProSubcategoryLinks(profile: PublicProProfile) {
  return (profile.service_subcategories ?? [])
    .map((slug) => {
      const subcategory = getSubcategoryBySlug(slug);
      if (!subcategory) return null;

      return {
        title: subcategory.shortTitle,
        href: `/${subcategory.parentSlug}/${subcategory.slug}`,
        description: subcategory.description,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function getPublicProAreaLinks(profile: PublicProProfile) {
  return getProServiceAreaSlugs(profile)
    .map((slug) => getMarketBySlug(slug))
    .filter((market): market is NonNullable<typeof market> => Boolean(market))
    .slice(0, 20)
    .map((market) => ({
      title: `${market.city}, ${market.state}`,
      href: getMarketUrlPath(market),
      description: `Home services in ${market.city}, ${market.state}.`,
    }));
}

export function getNearbyAreaLinks(profile: PublicProProfile) {
  const firstArea = profile.home_market_slug ?? getProServiceAreaSlugs(profile)[0];
  if (!firstArea) return [];

  return getNearbyMarkets(firstArea)
    .slice(0, 6)
    .map((market) => ({
      title: `${market.city}, ${market.state}`,
      href: getMarketUrlPath(market),
      description: `Nearby service area for ${getProDisplayName(profile)}.`,
    }));
}

export function getProHomeMarket(profile: PublicProProfile) {
  return profile.home_market_slug ? getMarketBySlug(profile.home_market_slug) : null;
}

export function getProServiceAreaSlugs(profile: PublicProProfile) {
  const derived = normalizeSlugList(profile.derived_service_area_slugs);
  if (derived.length > 0) return derived;
  return normalizeSlugList(profile.service_areas);
}

export function deriveServiceAreaSlugs(
  homeMarketSlug: string | null | undefined,
  radiusMiles: number | null | undefined
) {
  const homeMarket = homeMarketSlug ? getMarketBySlug(homeMarketSlug) : null;
  if (!homeMarket) return [];

  const radius = normalizeServiceRadius(radiusMiles);
  const byDistance = getAllMarkets()
    .map((market) => ({
      market,
      distance: getDistanceMiles(
        homeMarket.lat,
        homeMarket.lng,
        market.lat,
        market.lng
      ),
    }))
    .filter(({ market, distance }) => {
      return (
        market.countryCode.toLowerCase() === homeMarket.countryCode.toLowerCase() &&
        distance <= radius
      );
    })
    .sort((a, b) => a.distance - b.distance)
    .map(({ market }) => market.slug);

  if (byDistance.length > 0) {
    return Array.from(new Set(byDistance));
  }

  return Array.from(
    new Set([
      homeMarket.slug,
      ...getNearbyMarkets(homeMarket.slug, { limit: 12 }).map(
        (market) => market.slug
      ),
    ])
  );
}

export function getPortfolioImageUrl(item: Record<string, unknown>) {
  const url = item.url;
  return typeof url === "string" && url.startsWith("http") ? url : null;
}

export function getPortfolioImageAlt(item: Record<string, unknown>) {
  const alt = item.alt;
  return typeof alt === "string" ? alt : "Project photo";
}

export function getProDisplayName(profile: PublicProProfile) {
  return (
    cleanText(profile.display_name) ||
    cleanText(profile.company_name) ||
    cleanText(profile.full_name) ||
    DEFAULT_PRO_NAME
  );
}

export function getProProfileSlug(profile: PublicProProfile) {
  return cleanText(profile.slug) ?? createFallbackSlug(getProDisplayName(profile));
}

export function getProProfileHref(profile: PublicProProfile) {
  return `/pro/${getProProfileSlug(profile)}`;
}

export function getProRatingAverage(profile: PublicProProfile) {
  return normalizeRating(profile.rating_average ?? profile.rating_summary?.average);
}

export function getProReviewsCount(profile: PublicProProfile) {
  return normalizeNonnegativeNumber(
    profile.reviews_count ?? profile.rating_summary?.count
  );
}

export function getProCompletion(profile: Partial<PublicProProfile>) {
  const checks = [
    {
      label: "Company or display name",
      complete: Boolean(
        cleanText(profile.company_name) ?? cleanText(profile.display_name)
      ),
    },
    { label: "Bio", complete: Boolean(cleanText(profile.bio)) },
    {
      label: "Service categories",
      complete: normalizeSlugList(profile.service_categories).length > 0,
    },
    {
      label: "Service areas",
      complete: getProServiceAreaSlugs(profile as PublicProProfile).length > 0,
    },
    {
      label: "Hometown",
      complete: Boolean(cleanText(profile.home_market_slug)),
    },
    {
      label: "Service subcategories",
      complete: normalizeSlugList(profile.service_subcategories).length > 0,
    },
    {
      label: "Years experience",
      complete: normalizeNonnegativeNumber(profile.years_experience) > 0,
    },
    {
      label: "License information",
      complete: Array.isArray(profile.licenses) && profile.licenses.length > 0,
    },
    {
      label: "Insurance information",
      complete:
        Boolean(profile.insurance_verified) ||
        (Array.isArray(profile.licenses) && profile.licenses.length > 0),
    },
    {
      label: "Avatar or logo",
      complete: Boolean(getSafeHttpUrl(profile.avatar_url) ?? getSafeHttpUrl(profile.logo_url)),
    },
    {
      label: "Verification status",
      complete:
        cleanText(profile.verification_status) !== null &&
        cleanText(profile.verification_status) !== "unverified",
    },
  ];

  const completedFields = checks
    .filter((check) => check.complete)
    .map((check) => check.label);
  const missingFields = checks
    .filter((check) => !check.complete)
    .map((check) => check.label);

  return {
    score: Math.round((completedFields.length / checks.length) * 100),
    completedFields,
    missingFields,
    nextBestAction:
      missingFields.length > 0
        ? `Add ${missingFields[0].toLowerCase()}`
        : "Keep reviews and response metrics current",
  } satisfies ProProfileCompletion;
}

export function isProServiceMatch(
  profile: Pick<PublicProProfile, "service_categories" | "service_subcategories">,
  categorySlug?: string | null
) {
  if (!categorySlug) return true;
  const categoriesMatch = normalizeSlugList(profile.service_categories).includes(
    categorySlug
  );
  const subcategoriesMatch = normalizeSlugList(
    profile.service_subcategories
  ).includes(categorySlug);
  return categoriesMatch || subcategoriesMatch;
}

export function isProGeoMatch(
  profile: Pick<PublicProProfile, "service_areas" | "derived_service_area_slugs">,
  marketSlug?: string | null
) {
  if (!marketSlug) return true;
  return getProServiceAreaSlugs(profile as PublicProProfile).includes(marketSlug);
}

export function getPublicProSeoMetadata(profile: PublicProProfile) {
  const name = getProDisplayName(profile);
  const categoryText = getCategoryLabels(profile).join(", ") || "home services";
  const areaText = getPublicProAreaLinks(profile)
    .slice(0, 3)
    .map((area) => area.title)
    .join(", ");
  const trustText = [
    getProReviewsCount(profile) > 0
      ? `${getProRatingAverage(profile).toFixed(1)}/5 rating`
      : null,
    profile.insurance_verified ? "insurance verified" : null,
    profile.verification_status ? `${profile.verification_status} verification` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    title: `${name} Reviews, Services & Trust Signals | Fixly`,
    description: `${name} on Fixly: ${categoryText}${areaText ? ` in ${areaText}` : ""}. Review signals, response metrics, verification status, service areas, and marketplace reputation${trustText ? ` including ${trustText}` : ""}.`,
    alternates: {
      canonical: getProProfileHref(profile),
    },
  };
}

export function getCategoryLabels(profile: PublicProProfile) {
  return (profile.service_categories ?? []).map((slug) => {
    return categories[slug]?.shortTitle ?? humanizeSlug(slug);
  });
}

export function getSubcategoryLabels(profile: PublicProProfile) {
  const explicit = normalizeSlugList(profile.service_subcategories);
  const slugs =
    explicit.length > 0
      ? explicit
      : (profile.service_categories ?? [])
          .flatMap((slug) => categories[slug]?.subcategories ?? [])
          .slice(0, 8);

  return slugs
    .slice(0, 8)
    .map((slug) => getSubcategoryBySlug(slug)?.shortTitle ?? humanizeSlug(slug));
}

function humanizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cleanText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function createFallbackSlug(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "fixly-pro"
  );
}

function normalizeSlugList(value: string[] | null | undefined) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function normalizeSubcategorySlugs(
  subcategorySlugs: string[] | null | undefined,
  categorySlugs: string[] | null | undefined
) {
  const selectedCategories = new Set(normalizeSlugList(categorySlugs));

  return normalizeSlugList(subcategorySlugs).filter((slug) => {
    const subcategory = getSubcategoryBySlug(slug);
    if (!subcategory) return false;
    return selectedCategories.size === 0 || selectedCategories.has(subcategory.parentSlug);
  });
}

function getSafeHttpUrl(value: string | null | undefined) {
  const url = cleanText(value);
  if (!url) return null;
  return url.startsWith("http://") || url.startsWith("https://") ? url : null;
}

function normalizeNonnegativeNumber(value: number | null | undefined) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, numeric);
}

function normalizePercent(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.max(0, Math.min(100, numeric));
}

function normalizeRating(value: number | null | undefined) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(5, numeric));
}

function normalizeServiceRadius(value: number | null | undefined) {
  const numeric = Number(value ?? 15);
  return SERVICE_RADIUS_OPTIONS.includes(
    numeric as (typeof SERVICE_RADIUS_OPTIONS)[number]
  )
    ? numeric
    : 15;
}

function getDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadiusMiles = 3958.8;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}
