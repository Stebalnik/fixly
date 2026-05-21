export type ProRankingInput = {
  averageResponseMinutes?: number | null;
  ratingAverage?: number | null;
  reviewCount?: number | null;
  serviceAreas?: string[] | null;
  serviceCategories?: string[] | null;
  targetMarketSlug?: string | null;
  targetCategorySlug?: string | null;
  unlockedLeadsCount?: number | null;
  leadResponseCount?: number | null;
  completedJobsCount?: number | null;
  repeatCustomersCount?: number | null;
};

export type ProRankingResult = {
  rankingScore: number;
  responseSpeedScore: number;
  reviewQualityScore: number;
  geoRelevanceScore: number;
  unlockConversionScore: number;
  completedJobsScore: number;
  repeatCustomerScore: number;
  leadResponsivenessScore: number;
  reasons: string[];
};

export function scoreProForMarketplace(
  input: ProRankingInput
): ProRankingResult {
  const responseSpeedScore = scoreResponseSpeed(input.averageResponseMinutes);
  const reviewQualityScore = scoreReviewQuality(
    input.ratingAverage,
    input.reviewCount
  );
  const geoRelevanceScore = scoreGeoRelevance(
    input.serviceAreas,
    input.targetMarketSlug
  );
  const unlockConversionScore = scoreUnlockConversion(
    input.unlockedLeadsCount,
    input.leadResponseCount
  );
  const completedJobsScore = Math.min(input.completedJobsCount ?? 0, 20);
  const repeatCustomerScore = Math.min((input.repeatCustomersCount ?? 0) * 2, 10);
  const leadResponsivenessScore = scoreLeadResponsiveness(
    input.unlockedLeadsCount,
    input.leadResponseCount
  );

  const categoryBoost =
    input.targetCategorySlug &&
    input.serviceCategories?.includes(input.targetCategorySlug)
      ? 8
      : 0;

  const rankingScore = Math.max(
    1,
    Math.min(
      100,
      responseSpeedScore +
        reviewQualityScore +
        geoRelevanceScore +
        unlockConversionScore +
        completedJobsScore +
        repeatCustomerScore +
        leadResponsivenessScore +
        categoryBoost
    )
  );

  return {
    rankingScore,
    responseSpeedScore,
    reviewQualityScore,
    geoRelevanceScore,
    unlockConversionScore,
    completedJobsScore,
    repeatCustomerScore,
    leadResponsivenessScore,
    reasons: buildReasons({
      input,
      rankingScore,
      responseSpeedScore,
      reviewQualityScore,
      geoRelevanceScore,
      unlockConversionScore,
      completedJobsScore,
      repeatCustomerScore,
      leadResponsivenessScore,
      categoryBoost,
    }),
  };
}

function scoreResponseSpeed(minutes?: number | null) {
  if (minutes === null || minutes === undefined) return 4;
  if (minutes <= 30) return 16;
  if (minutes <= 120) return 12;
  if (minutes <= 480) return 8;
  return 4;
}

function scoreReviewQuality(
  ratingAverage?: number | null,
  reviewCount?: number | null
) {
  const rating = ratingAverage ?? 0;
  const count = reviewCount ?? 0;
  const ratingScore = Math.round((rating / 5) * 22);
  const volumeScore = Math.min(count, 8);

  return ratingScore + volumeScore;
}

function scoreGeoRelevance(
  serviceAreas?: string[] | null,
  targetMarketSlug?: string | null
) {
  if (!targetMarketSlug) return 6;
  if (serviceAreas?.includes(targetMarketSlug)) return 14;
  if (serviceAreas?.length) return 8;
  return 4;
}

function scoreUnlockConversion(
  unlockedLeadsCount?: number | null,
  leadResponseCount?: number | null
) {
  const unlocked = unlockedLeadsCount ?? 0;
  const responses = leadResponseCount ?? 0;

  if (unlocked === 0) return 3;

  return Math.min(Math.round((responses / unlocked) * 12), 12);
}

function scoreLeadResponsiveness(
  unlockedLeadsCount?: number | null,
  leadResponseCount?: number | null
) {
  const unlocked = unlockedLeadsCount ?? 0;
  const responses = leadResponseCount ?? 0;

  if (responses >= 10) return 10;
  if (unlocked > 0 && responses / unlocked >= 0.75) return 8;
  if (responses > 0) return 5;
  return 2;
}

function buildReasons(args: {
  input: ProRankingInput;
  rankingScore: number;
  responseSpeedScore: number;
  reviewQualityScore: number;
  geoRelevanceScore: number;
  unlockConversionScore: number;
  completedJobsScore: number;
  repeatCustomerScore: number;
  leadResponsivenessScore: number;
  categoryBoost: number;
}) {
  const reasons = [
    `Response speed score: ${args.responseSpeedScore}.`,
    `Review quality score: ${args.reviewQualityScore}.`,
    `Geo relevance score: ${args.geoRelevanceScore}.`,
    `Unlock conversion score: ${args.unlockConversionScore}.`,
    `Completed jobs score: ${args.completedJobsScore}.`,
    `Repeat customer score: ${args.repeatCustomerScore}.`,
    `Lead responsiveness score: ${args.leadResponsivenessScore}.`,
  ];

  if (args.categoryBoost > 0) {
    reasons.push(`Category match boost: ${args.categoryBoost}.`);
  }

  reasons.push(`Total marketplace ranking score: ${args.rankingScore}.`);

  return reasons;
}
