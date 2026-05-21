import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicPageShell from "@/components/PublicPageShell";
import { getJsonLdScriptProps, type JsonLdObject } from "@/lib/seo";
import {
  getCategoryLabels,
  getNearbyAreaLinks,
  getPortfolioImageAlt,
  getPortfolioImageUrl,
  getProDisplayName,
  getProFaqJsonLd,
  getProHomeMarket,
  getProLocalBusinessJsonLd,
  getProRanking,
  getProRatingAverage,
  getProReviewsCount,
  getProServiceJsonLd,
  getProServiceAreaSlugs,
  getPublicProSeoMetadata,
  getPublicProAreaLinks,
  getPublicProProfileBySlug,
  getPublicProReviews,
  getPublicProServiceLinks,
  getPublicProSubcategoryLinks,
  getSubcategoryLabels,
} from "@/lib/marketplace";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function JsonLdScript({ data }: { data: JsonLdObject | Record<string, unknown> }) {
  const props = getJsonLdScriptProps(data as JsonLdObject);

  if (!props) return null;

  return <script {...props} />;
}

function formatResponseTime(minutes: number | null | undefined) {
  if (!minutes && minutes !== 0) return "Not enough data yet";
  if (minutes < 60) return `${minutes} min average`;
  return `${Math.round(minutes / 60)} hr average`;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getPublicProProfileBySlug(slug);

  if (!profile) {
    return {
      title: "Pro Not Found | Fixly",
    };
  }

  return getPublicProSeoMetadata(profile);
}

export default async function PublicProPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getPublicProProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const reviews = await getPublicProReviews(profile.user_id);
  const ranking = getProRanking(profile);
  const name = getProDisplayName(profile);
  const categoryLabels = getCategoryLabels(profile);
  const subcategoryLabels = getSubcategoryLabels(profile);
  const serviceLinks = getPublicProServiceLinks(profile);
  const subcategoryLinks = getPublicProSubcategoryLinks(profile);
  const areaLinks = getPublicProAreaLinks(profile);
  const nearbyAreaLinks = getNearbyAreaLinks(profile);
  const homeMarket = getProHomeMarket(profile);
  const serviceAreaCount = getProServiceAreaSlugs(profile).length;
  const ratingAverage = getProRatingAverage(profile);
  const ratingCount = getProReviewsCount(profile);
  const businessJsonLd = getProLocalBusinessJsonLd({ profile, reviews });
  const faqJsonLd = getProFaqJsonLd(profile);
  const serviceJsonLd = getProServiceJsonLd(profile);
  const portfolioItems = (profile.portfolio_images ?? [])
    .map((item) => ({
      item,
      url: getPortfolioImageUrl(item),
    }))
    .filter((entry): entry is { item: Record<string, unknown>; url: string } =>
      Boolean(entry.url)
    );
  const licenses = profile.licenses ?? [];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Pros", href: "/pro" },
    { label: name },
  ];

  return (
    <PublicPageShell breadcrumbs={breadcrumbs}>
      <JsonLdScript data={businessJsonLd} />
      <JsonLdScript data={faqJsonLd} />
      {serviceJsonLd.map((item) => (
        <JsonLdScript key={String(item["@id"])} data={item} />
      ))}

      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly verified pro profile</p>
            <h1>{name}</h1>
            <div className="flex gap-sm">
              <span className="badge badge-primary">
                {profile.verification_status ?? "unverified"}
              </span>
              {ratingCount > 0 ? (
                <span className="badge badge-success">
                  {ratingAverage.toFixed(1)}/5 from {ratingCount} reviews
                </span>
              ) : (
                <span className="badge">Review profile building</span>
              )}
              {profile.insurance_verified ? (
                <span className="badge badge-success">Insurance verified</span>
              ) : (
                <span className="badge">Insurance not verified</span>
              )}
              {profile.identity_verified ? (
                <span className="badge badge-success">Identity verified</span>
              ) : null}
              {profile.license_verified ? (
                <span className="badge badge-success">License verified</span>
              ) : null}
            </div>
            <p className="hero-text">
              {profile.bio ??
                `${name} is a Fixly pro profile with service areas, review signals, response metrics, and marketplace reputation data.`}
            </p>
            <p className="hero-text">
              {name} serves{" "}
              {homeMarket ? `${homeMarket.city}, ${homeMarket.state}` : "their local market"}
              {profile.service_radius_miles
                ? ` within about ${profile.service_radius_miles} miles`
                : ""}
              {categoryLabels.length > 0
                ? ` for ${categoryLabels.slice(0, 4).join(", ")}.`
                : "."}
            </p>

            <div className="flex gap-md">
              <Link href="/book" className="button button-primary">
                Request service
              </Link>
              <Link href="/requests" className="button button-secondary">
                Browse open requests
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-3">
            <div className="card">
              <h2>Trust signals</h2>
              <div className="service-seo-list">
                <p>
                  <strong>Verification:</strong>{" "}
                  {profile.verification_status ?? "unverified"}
                </p>
                <p>
                  <strong>Insurance:</strong>{" "}
                  {profile.insurance_verified ? "Verified" : "Not verified"}
                </p>
                <p>
                  <strong>Identity:</strong>{" "}
                  {profile.identity_verified ? "Verified" : "Not verified"}
                </p>
                <p>
                  <strong>License:</strong>{" "}
                  {profile.license_verified ? "Verified" : "Not verified"}
                </p>
                <p>
                  <strong>Background check:</strong>{" "}
                  {profile.background_check_status === "clear"
                    ? "Verified"
                    : profile.background_check_status ?? "pending"}
                </p>
                <p>
                  <strong>Experience:</strong>{" "}
                  {profile.years_experience
                    ? `${profile.years_experience} years`
                    : "Not provided"}
                </p>
              </div>
            </div>

            <div className="card">
              <h2>Reputation</h2>
              <div className="service-seo-list">
                <p>
                  <strong>Rating:</strong>{" "}
                  {ratingCount > 0 ? `${ratingAverage}/5` : "No reviews yet"}
                </p>
                <p>
                  <strong>Reviews:</strong> {ratingCount}
                </p>
                <p>
                  <strong>Completed jobs:</strong>{" "}
                  {profile.completed_jobs_count ?? 0}
                </p>
              </div>
            </div>

            <div className="card">
              <h2>Response metrics</h2>
              <div className="service-seo-list">
                <p>
                  <strong>Response time:</strong>{" "}
                  {formatResponseTime(profile.average_response_minutes)}
                </p>
                <p>
                  <strong>Response rate:</strong>{" "}
                  {profile.response_rate !== null && profile.response_rate !== undefined
                    ? `${profile.response_rate}%`
                    : "Not enough data yet"}
                </p>
                <p>
                  <strong>Lead responses:</strong>{" "}
                  {profile.lead_response_count ?? 0}
                </p>
                <p>
                  <strong>Marketplace score:</strong>{" "}
                  {ranking.rankingScore}/100
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2">
            <div className="card">
              <h2>Services</h2>
              <ul className="service-list">
                {(categoryLabels.length ? categoryLabels : ["Home services"]).map(
                  (item) => (
                    <li key={item}>{item}</li>
                  )
                )}
              </ul>
            </div>

            <div className="card">
              <h2>Licenses and insurance</h2>
              <ul className="service-list">
                {licenses.length > 0 ? (
                  licenses.map((item, index) => (
                    <li key={index}>
                      {typeof item.name === "string"
                        ? item.name
                        : "License information on file"}
                    </li>
                  ))
                ) : (
                  <li>
                    License details have not been published yet. Ask the pro to
                    confirm license requirements for regulated work.
                  </li>
                )}
                <li>
                  Insurance status:{" "}
                  {profile.insurance_verified ? "verified" : "not verified"}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2">
            <div className="card">
              <h2>Common work</h2>
              <ul className="service-list">
                {(subcategoryLabels.length
                  ? subcategoryLabels
                  : ["Repairs", "Maintenance", "Installations"]
                ).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>Service areas</h2>
              <p>
                <strong>Hometown:</strong>{" "}
                {homeMarket ? `${homeMarket.city}, ${homeMarket.state}` : "Not set"}
              </p>
              <p>
                <strong>Radius:</strong>{" "}
                {profile.service_radius_miles
                  ? `${profile.service_radius_miles} miles`
                  : "Not set"}
              </p>
              {areaLinks.length > 0 ? (
                <>
                  <ul className="service-list">
                    {areaLinks.slice(0, 20).map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.title}</Link>
                    </li>
                    ))}
                  </ul>
                  {serviceAreaCount > areaLinks.length ? (
                    <p>+{serviceAreaCount - areaLinks.length} more service areas</p>
                  ) : null}
                </>
              ) : (
                <p>
                  This pro has not published specific service areas yet. Use
                  Fixly request details to confirm local availability before
                  booking.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2">
            <div className="card">
              <h2>Why homeowners compare this pro</h2>
              <p>
                A strong pro profile helps homeowners evaluate fit before they
                request help. Important signals include verified reviews,
                response speed, service area match, completed work, insurance,
                licenses, and clear service categories.
              </p>
            </div>

            <div className="card">
              <h2>Ranking signals</h2>
              <ul className="service-list">
                {ranking.reasons.slice(0, 6).map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Portfolio</h2>
            {portfolioItems.length > 0 ? (
                <div className="grid-3">
                  {portfolioItems.slice(0, 6).map(({ item, url }, index) => (
                    <div key={`${url}-${index}`} className="card">
                      <Image
                        src={url}
                        alt={getPortfolioImageAlt(item)}
                        width={640}
                        height={420}
                      />
                    </div>
                  ))}
                </div>
            ) : (
              <div className="card">
                <p>
                  Portfolio photos have not been published yet. Ask for recent
                  project examples, photos, or references before approving major
                  work.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Reviews</h2>

            {reviews.length > 0 ? (
              <div className="grid-2">
                {reviews.map((review) => (
                  <article key={review.id} className="card">
                    <h3>{review.review_title ?? `${review.rating}/5 review`}</h3>
                    <p>
                      {review.review_text ??
                        review.review_body ??
                        "No written review provided."}
                    </p>
                    <p>
                      <strong>Rating:</strong> {review.rating}/5
                      {review.verified ? " Verified review" : ""}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="card">
                <p>
                  This pro does not have approved public reviews yet. Fixly
                  review summaries update as moderated reviews are approved.
                </p>
              </div>
            )}
          </div>
        </section>

        {serviceLinks.length > 0 && (
          <section className="section-sm">
            <div className="container">
              <h2>Related services</h2>
              <div className="grid-3">
                {serviceLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="card card-hover">
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {subcategoryLinks.length > 0 && (
          <section className="section-sm">
            <div className="container">
              <h2>Specific services</h2>
              <div className="grid-3">
                {subcategoryLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="card card-hover">
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section-sm">
          <div className="container">
            <h2>Nearby markets</h2>
            {nearbyAreaLinks.length > 0 ? (
              <div className="grid-3">
                {nearbyAreaLinks.slice(0, 6).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="card card-hover"
                  >
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card">
                <p>
                  Nearby market links will appear after this pro publishes local
                  service areas.
                </p>
              </div>
            )}
            </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <h2>Common questions</h2>
            <div className="grid-2">
              <div className="card">
                <h3>How should I compare pros?</h3>
                <p>
                  Compare verification, insurance, reviews, response speed,
                  service categories, service areas, portfolio examples, and
                  whether the pro has completed similar work.
                </p>
              </div>
              <div className="card">
                <h3>Can I contact this pro directly?</h3>
                <p>
                  Start by posting a request on Fixly. Public profiles provide
                  trust signals, while request workflows help organize scope,
                  timing, and local pro fit.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
