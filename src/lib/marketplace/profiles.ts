import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMarketBySlug, getMarketUrlPath, getNearbyMarkets } from "@/lib/geo";
import { categories, getSubcategoryBySlug } from "@/lib/services";
import { scoreProForMarketplace } from "./pro-ranking";

export type PublicProProfile = {
  user_id: string;
  slug: string | null;
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
  service_areas: string[] | null;
  licenses: Array<Record<string, unknown>> | null;
  insurance_verified: boolean | null;
  portfolio_images: Array<Record<string, unknown>> | null;
  verification_status: string | null;
  average_response_minutes: number | null;
  completed_jobs_count: number | null;
  repeat_customers_count: number | null;
  unlocked_leads_count: number | null;
  lead_response_count: number | null;
  rating_summary: {
    average?: number;
    count?: number;
    qualityAverage?: number;
    communicationAverage?: number;
    valueAverage?: number;
    punctualityAverage?: number;
  } | null;
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
  verified: boolean;
  created_at: string;
};

export async function getPublicProProfileBySlug(slug: string) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("pro_profiles")
    .select(
      `
      user_id,
      slug,
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
      service_areas,
      licenses,
      insurance_verified,
      portfolio_images,
      verification_status,
      average_response_minutes,
      completed_jobs_count,
      repeat_customers_count,
      unlocked_leads_count,
      lead_response_count,
      rating_summary
    `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .eq("public_profile_enabled", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as PublicProProfile | null;
}

export async function getFeaturedPublicPros(args: {
  marketSlug?: string | null;
  categorySlug?: string | null;
  limit?: number;
}) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("pro_profiles")
    .select(
      "user_id, slug, company_name, full_name, bio, service_categories, service_areas, verification_status, insurance_verified, average_response_minutes, completed_jobs_count, repeat_customers_count, unlocked_leads_count, lead_response_count, rating_summary"
    )
    .eq("status", "active")
    .eq("public_profile_enabled", true)
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as PublicProProfile[])
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
      "id, rating, quality_rating, communication_rating, value_rating, punctuality_rating, review_title, review_body, verified, created_at"
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
    ratingAverage: Number(profile.rating_summary?.average ?? 0),
    reviewCount: Number(profile.rating_summary?.count ?? 0),
    serviceAreas: profile.service_areas,
    serviceCategories: profile.service_categories,
    targetMarketSlug: target?.marketSlug,
    targetCategorySlug: target?.categorySlug,
    unlockedLeadsCount: profile.unlocked_leads_count,
    leadResponseCount: profile.lead_response_count,
    completedJobsCount: profile.completed_jobs_count,
    repeatCustomersCount: profile.repeat_customers_count,
  });
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

export function getPublicProAreaLinks(profile: PublicProProfile) {
  return (profile.service_areas ?? [])
    .map((slug) => getMarketBySlug(slug))
    .filter((market): market is NonNullable<typeof market> => Boolean(market))
    .slice(0, 8)
    .map((market) => ({
      title: `${market.city}, ${market.state}`,
      href: getMarketUrlPath(market),
      description: `Home services in ${market.city}, ${market.state}.`,
    }));
}

export function getNearbyAreaLinks(profile: PublicProProfile) {
  const firstArea = profile.service_areas?.[0];
  if (!firstArea) return [];

  return getNearbyMarkets(firstArea)
    .slice(0, 6)
    .map((market) => ({
      title: `${market.city}, ${market.state}`,
      href: getMarketUrlPath(market),
      description: `Nearby service area for ${getProDisplayName(profile)}.`,
    }));
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
  return profile.company_name || profile.full_name || "Fixly Pro";
}

export function getCategoryLabels(profile: PublicProProfile) {
  return (profile.service_categories ?? []).map((slug) => {
    return categories[slug]?.shortTitle ?? humanizeSlug(slug);
  });
}

export function getSubcategoryLabels(profile: PublicProProfile) {
  return (profile.service_categories ?? [])
    .flatMap((slug) => categories[slug]?.subcategories ?? [])
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
