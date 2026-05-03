import type { Metadata } from "next";
import type { Market } from "@/lib/geo";
import type { Category } from "@/lib/services/categories";
import type { Subcategory } from "@/lib/services";

const BASE_URL = "https://fixly.work";

export function getCategoryPageMeta(
  category: Category,
  geo: Market,
  canonicalPath?: string
): Metadata & { h1: string } {
  return {
    title: `${category.title} in ${geo.city}, ${geo.state} | Fixly`,
    description: `Looking for ${category.shortTitle.toLowerCase()} in ${geo.city}? Fixly connects you with trusted local pros. Get a free estimate today.`,
    h1: `${category.title} in ${geo.city}, ${geo.state}`,
    alternates: canonicalPath
  ? {
      canonical: `${BASE_URL}${canonicalPath}`,
      languages: {
        en: `${BASE_URL}${canonicalPath}`,
        "x-default": `${BASE_URL}${canonicalPath}`,
      },
    }
  : undefined,
  };
}

export function getSubcategoryPageMeta(
  subcategory: Subcategory,
  geo: Market,
  canonicalPath?: string
): Metadata & { h1: string } {
  return {
    title: `${subcategory.title} in ${geo.city}, ${geo.state} | Fixly`,
    description: `Need ${subcategory.shortTitle.toLowerCase()} in ${geo.city}? Local pros available. Estimated cost: $${subcategory.priceMin}–$${subcategory.priceMax}. Get quotes fast.`,
    h1: `${subcategory.title} in ${geo.city}, ${geo.state}`,
    alternates: canonicalPath
  ? {
      canonical: `${BASE_URL}${canonicalPath}`,
      languages: {
        en: `${BASE_URL}${canonicalPath}`,
        "x-default": `${BASE_URL}${canonicalPath}`,
      },
    }
  : undefined,
  };
}

export function getJobPageMeta(
  params: {
    subcategoryTitle: string;
    problem: string;
    city: string;
    state: string;
  },
  canonicalPath?: string
): Metadata & { h1: string } {
  return {
    title: `${params.problem} in ${params.city}, ${params.state} | Fixly`,
    description: `A homeowner in ${params.city} needs help with: ${params.problem}. Registered pros can respond to this request on Fixly.`,
    h1: `${params.subcategoryTitle} — ${params.city}, ${params.state}`,
    alternates: canonicalPath
  ? {
      canonical: `${BASE_URL}${canonicalPath}`,
      languages: {
        en: `${BASE_URL}${canonicalPath}`,
        "x-default": `${BASE_URL}${canonicalPath}`,
      },
    }
  : undefined,
  };
}

export function generateJobSlug(params: {
  city: string;
  problem: string;
  id: number | string;
}): string {
  const citySlug = params.city.toLowerCase().replace(/\s+/g, "-");
  const problemSlug = params.problem
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);

  return `${citySlug}-${problemSlug}-${params.id}`;
}

export function calculateQualityScore(params: {
  categorySlug?: string;
  subcategorySlug?: string;
  city?: string;
  problem?: string;
  description?: string;
  hasPhoto?: boolean;
  priceMin?: number;
}): number {
  let score = 0;
  if (params.categorySlug) score += 15;
  if (params.subcategorySlug) score += 15;
  if (params.city) score += 10;
  if (params.problem) score += 15;
  if (params.description && params.description.length > 120) score += 20;
  if (params.hasPhoto) score += 10;
  if (params.priceMin) score += 10;
  return score;
}

export function getIndexStatus(qualityScore: number): "index" | "noindex" {
  return qualityScore >= 80 ? "index" : "noindex";
}