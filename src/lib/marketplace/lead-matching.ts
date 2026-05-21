import {
  getProServiceAreaSlugs,
  type PublicProProfile,
} from "@/lib/marketplace/profiles";

export type MatchableLeadRequest = {
  id?: string | null;
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  market_slug: string | null;
  city: string;
  state: string;
  public_description?: string | null;
  status?: string | null;
  lead_status?: string | null;
  purchase_count: number;
  max_purchases: number;
  created_at: string;
};

export type LeadMatchResult = {
  score: number;
  percentage: number;
  reasons: string[];
  serviceAreaMatch: boolean;
  categoryMatch: boolean;
  subcategoryMatch: boolean;
  freshnessLabel: string;
  competitionLabel: string;
  sortScore: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function isLeadUnlockable(request: MatchableLeadRequest) {
  return (
    (request.status === undefined || request.status === "open") &&
    (request.lead_status === undefined || request.lead_status === "available") &&
    request.purchase_count < request.max_purchases
  );
}

export function scoreLeadForPro(
  request: MatchableLeadRequest,
  profile: PublicProProfile,
  now = new Date()
): LeadMatchResult {
  const serviceAreaSlugs = getProServiceAreaSlugs(profile);
  const categorySlugs = profile.service_categories ?? [];
  const subcategorySlugs = profile.service_subcategories ?? [];
  const serviceAreaMatch = Boolean(
    request.market_slug && serviceAreaSlugs.includes(request.market_slug)
  );
  const categoryMatch = categorySlugs.includes(request.category_slug);
  const hasSubcategoryPreferences = subcategorySlugs.length > 0;
  const subcategoryMatch = Boolean(
    request.subcategory_slug &&
      subcategorySlugs.includes(request.subcategory_slug)
  );
  const ageDays = getAgeDays(request.created_at, now);
  const freshnessScore = scoreFreshness(ageDays);
  const competitionScore = scoreCompetition(
    request.purchase_count,
    request.max_purchases
  );
  const urgencyScore = scoreUrgency(request);
  const verificationScore = scoreVerification(profile.verification_status);
  const reasons: string[] = [];

  let score = 0;

  if (serviceAreaMatch) {
    score += 30;
    reasons.push(`Service area match: ${request.city}, ${request.state}.`);
  }

  if (categoryMatch) {
    score += 25;
    reasons.push(`Category match: ${request.category_slug}.`);
  }

  if (subcategoryMatch) {
    score += 20;
    reasons.push(`Exact service match: ${request.subcategory_slug}.`);
  } else if (!hasSubcategoryPreferences) {
    score += 8;
    reasons.push("Add specific services to improve exact lead matching.");
  }

  score += urgencyScore;
  if (urgencyScore > 0) reasons.push("Urgency signal found in request text.");

  score += freshnessScore;
  reasons.push(getFreshnessLabel(ageDays));

  score += competitionScore;
  reasons.push(getCompetitionLabel(request.purchase_count, request.max_purchases));

  score += verificationScore;
  if (verificationScore > 0) {
    reasons.push(`Pro verification status boosts match confidence.`);
  }

  const cappedScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score: cappedScore,
    percentage: cappedScore,
    reasons,
    serviceAreaMatch,
    categoryMatch,
    subcategoryMatch,
    freshnessLabel: getFreshnessLabel(ageDays),
    competitionLabel: getCompetitionLabel(
      request.purchase_count,
      request.max_purchases
    ),
    sortScore: cappedScore,
  };
}

export function sortMatchedLeads<T extends MatchableLeadRequest>(
  items: Array<{ request: T; match: LeadMatchResult }>,
  sort: string
) {
  return [...items].sort((a, b) => {
    if (sort === "newest") {
      return (
        new Date(b.request.created_at).getTime() -
        new Date(a.request.created_at).getTime()
      );
    }

    if (sort === "low-competition") {
      return a.request.purchase_count - b.request.purchase_count;
    }

    if (sort === "exact-subcategory") {
      return Number(b.match.subcategoryMatch) - Number(a.match.subcategoryMatch);
    }

    return b.match.sortScore - a.match.sortScore;
  });
}

function getAgeDays(value: string, now: Date) {
  const created = new Date(value).getTime();
  if (!Number.isFinite(created)) return 999;
  return Math.max(0, Math.floor((now.getTime() - created) / DAY_MS));
}

function scoreFreshness(ageDays: number) {
  if (ageDays <= 1) return 10;
  if (ageDays <= 3) return 7;
  if (ageDays <= 7) return 4;
  return 1;
}

function scoreCompetition(purchaseCount: number, maxPurchases: number) {
  if (purchaseCount === 0) return 8;
  if (purchaseCount <= 1) return 6;
  if (purchaseCount >= maxPurchases - 1) return 1;
  return 3;
}

function scoreUrgency(request: MatchableLeadRequest) {
  const text =
    `${request.category_slug} ${request.subcategory_slug ?? ""} ${request.public_description ?? ""}`.toLowerCase();
  if (/(emergency|urgent|same-day|leak|no heat|no cooling|electrical)/.test(text)) {
    return 5;
  }
  return 0;
}

function scoreVerification(status: string | null | undefined) {
  if (status === "verified") return 2;
  if (status === "pending") return 1;
  return 0;
}

function getFreshnessLabel(ageDays: number) {
  if (ageDays <= 1) return "Fresh: posted in the last 24 hours.";
  if (ageDays <= 3) return "Fresh: posted in the last 3 days.";
  if (ageDays <= 7) return "Recent: posted this week.";
  return "Older request: review timing before unlocking.";
}

function getCompetitionLabel(purchaseCount: number, maxPurchases: number) {
  if (purchaseCount === 0) return "Low competition: no pro unlocks yet.";
  if (purchaseCount <= 1) return "Low competition: one or fewer pro unlocks.";
  if (purchaseCount >= maxPurchases - 1) return "High competition: almost sold out.";
  return "Moderate competition.";
}
