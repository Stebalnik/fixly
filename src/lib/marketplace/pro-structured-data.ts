import {
  getCategoryLabels,
  getProDisplayName,
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
  const ratingAverage = Number(profile.rating_summary?.average ?? 0);
  const ratingCount = Number(profile.rating_summary?.count ?? 0);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/pro/${profile.slug}#business`,
    name,
    url: `${SITE_URL}/pro/${profile.slug}`,
    image: profile.logo_url ?? profile.avatar_url ?? undefined,
    description:
      profile.bio ??
      `${name} is a Fixly home services pro with public trust and reputation signals.`,
    telephone: profile.contact_phone ?? undefined,
    email: profile.contact_email ?? undefined,
    areaServed: (profile.service_areas ?? []).map((area) => ({
      "@type": "Place",
      name: area,
    })),
    makesOffer: getCategoryLabels(profile).map((label) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: label,
      },
    })),
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
    review: reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      name: review.review_title ?? `${name} customer review`,
      reviewBody: review.review_body ?? undefined,
      datePublished: review.created_at,
      author: {
        "@type": "Person",
        name: review.verified ? "Verified Fixly customer" : "Fixly customer",
      },
    })),
  };
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
