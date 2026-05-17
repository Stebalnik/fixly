export type AiAgentRunStatus = "running" | "completed" | "failed";

export type SeoOpportunityType =
  | "missing_intent_page"
  | "thin_content"
  | "missing_faq"
  | "missing_price_section"
  | "internal_linking"
  | "geo_gap"
  | "technical_seo";

export type SeoOpportunity = {
  countryCode: string;
  marketSlug?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  intentSlug?: string;
  opportunityType: SeoOpportunityType;
  title: string;
  targetUrl?: string;
  searchQuery?: string;
  priorityScore: number;
  recommendation: string;
  proposedAction?: Record<string, unknown>;
};