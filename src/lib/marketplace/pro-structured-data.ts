import {
  getCategoryLabels,
  getProDisplayName,
  getProProfileHref,
  getProProfileSlug,
  getProRatingAverage,
  getProReviewsCount,
  getProServiceAreaSlugs,
  type PublicProProfile,
  type PublicProReview,
} from "./profiles";

const SITE_URL = "https://fixly.work";

export function getProLocalBusinessJsonLd(args: {
  profile: PublicProProfile;
  reviews: PublicProReview[];
}) {
  const { profile, reviews } = args;
  const name = getProDisplayName(profile);
  const ratingAverage = getProRatingAverage(profile);
  const ratingCount = getProReviewsCount(profile);
  const approvedReviews = reviews.filter((review) => review.rating > 0);
  const categories = getCategoryLabels(profile);

  return removeUndefined({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}${getProProfileHref(profile)}#business`,
    name,
    url: `${SITE_URL}${getProProfileHref(profile)}`,
    image: profile.logo_url ?? profile.avatar_url ?? undefined,
    description:
      profile.bio ??
      `${name} is a Fixly home services pro with public trust and reputation signals.`,
    areaServed:
      getProServiceAreaSlugs(profile).length > 0
        ? getProServiceAreaSlugs(profile).map((area) => ({
            "@type": "Place",
            name: area,
          }))
        : undefined,
    makesOffer:
      categories.length > 0
        ? categories.map((label) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: label,
            },
          }))
        : undefined,
    aggregateRating:
      ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: ratingAverage,
            reviewCount: ratingCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review:
      approvedReviews.length > 0
        ? approvedReviews.slice(0, 5).map((review) =>
            removeUndefined({
              "@type": "Review",
              reviewRating: {
                "@type": "Rating",
                ratingValue: review.rating,
                bestRating: 5,
                worstRating: 1,
              },
              name: review.review_title ?? `${name} customer review`,
              reviewBody: review.review_text ?? review.review_body ?? undefined,
              datePublished: review.created_at,
              author: {
                "@type": "Person",
                name: review.verified ? "Verified Fixly customer" : "Fixly customer",
              },
            })
          )
        : undefined,
  });
}

export function getProServiceJsonLd(profile: PublicProProfile) {
  const categories = getCategoryLabels(profile);
  const name = getProDisplayName(profile);

  if (categories.length === 0) return [];

  return categories.map((category) =>
    removeUndefined({
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${SITE_URL}${getProProfileHref(profile)}#service-${category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}`,
      name: `${category} by ${name}`,
      provider: {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/pro/${getProProfileSlug(profile)}#business`,
        name,
      },
      areaServed:
        getProServiceAreaSlugs(profile).length > 0
          ? getProServiceAreaSlugs(profile).map((area) => ({
              "@type": "Place",
              name: area,
            }))
          : undefined,
    })
  );
}

export function getProFaqJsonLd(profile: PublicProProfile) {
  const name = getProDisplayName(profile);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${name} verified on Fixly?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${name} has a public Fixly verification status of ${profile.verification_status ?? "unverified"}.`,
        },
      },
      {
        "@type": "Question",
        name: `What services does ${name} offer?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${name} lists service categories including ${getCategoryLabels(profile).join(", ") || "home services"}.`,
        },
      },
      {
        "@type": "Question",
        name: `How fast does ${name} respond?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: profile.average_response_minutes
            ? `${name}'s average response time is about ${profile.average_response_minutes} minutes.`
            : `${name} has not published an average response time yet.`,
        },
      },
    ],
  };
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}
