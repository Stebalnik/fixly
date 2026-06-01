import { getCategoryBySlug, getSubcategoryBySlug } from "@/lib/services";

export type ProJobRequest = {
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  city: string;
  state: string;
  public_description: string;
  created_at: string;
  updated_at?: string | null;
  lead_price_fixas?: number | null;
  purchase_count?: number | null;
  max_purchases?: number | null;
  max_responses?: number | null;
};

export function getProJobsBaseUrl() {
  return process.env.NEXT_PUBLIC_PRO_SITE_URL ?? "https://pro.fixly.work";
}

export function getProJobPath(publicSlug: string) {
  return `/jobs/${publicSlug}`;
}

export function getProJobUrl(publicSlug: string) {
  return `${getProJobsBaseUrl()}${getProJobPath(publicSlug)}`;
}

export function getProJobServiceLabel(request: ProJobRequest) {
  const category = getCategoryBySlug(request.category_slug);
  const subcategory = request.subcategory_slug
    ? getSubcategoryBySlug(request.subcategory_slug)
    : null;

  return (
    subcategory?.shortTitle ??
    subcategory?.title ??
    category?.shortTitle ??
    category?.title ??
    request.category_slug
  );
}

export function getProJobTitle(request: ProJobRequest) {
  const serviceLabel = getProJobServiceLabel(request);

  return `${serviceLabel} side job in ${request.city}, ${request.state}`;
}

export function getProJobMetaDescription(request: ProJobRequest) {
  const serviceLabel = getProJobServiceLabel(request);

  return `${serviceLabel} temporary work opportunity in ${request.city}, ${request.state}. Review this local gig, side job, or short-term home service request on Fixly Pro.`;
}

export function getProJobMaxResponses(request: ProJobRequest) {
  return request.max_purchases ?? request.max_responses ?? null;
}

export function formatProJobDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
