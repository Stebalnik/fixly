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
  getProLocalBusinessJsonLd,
  getProRanking,
  getPublicProAreaLinks,
  getPublicProProfileBySlug,
  getPublicProReviews,
  getPublicProServiceLinks,
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

  const name = getProDisplayName(profile);
  const categories = getCategoryLabels(profile).join(", ");

  return {
    title: `${name} Reviews, Services & Trust Signals | Fixly`,
    description: `${name} on Fixly: ${categories || "home services"}, response metrics, verification status, reviews, portfolio, and service areas.`,
    alternates: {
      canonical: `/pro/${profile.slug}`,
    },
  };
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
  const areaLinks = getPublicProAreaLinks(profile);
  const nearbyAreaLinks = getNearbyAreaLinks(profile);
  const ratingAverage = Number(profile.rating_summary?.average ?? 0);
  const ratingCount = Number(profile.rating_summary?.count ?? 0);
  const businessJsonLd = getProLocalBusinessJsonLd({ profile, reviews });
  const faqJsonLd = getProFaqJsonLd(profile);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Pros", href: "/pro" },
    { label: name },
  ];

  return (
    <PublicPageShell breadcrumbs={breadcrumbs}>
      <JsonLdScript data={businessJsonLd} />
      <JsonLdScript data={faqJsonLd} />

      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly verified pro profile</p>
            <h1>{name}</h1>
            <p className="hero-text">
              {profile.bio ??
                `${name} is a Fixly pro profile with service areas, review signals, response metrics, and marketplace reputation data.`}
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

        {Array.isArray(profile.portfolio_images) &&
          profile.portfolio_images.length > 0 && (
            <section className="section">
              <div className="container">
                <h2>Portfolio</h2>
                <div className="grid-3">
                  {profile.portfolio_images.slice(0, 6).map((item, index) => {
                    const url = getPortfolioImageUrl(item);
                    if (!url) return null;

                    return (
                      <div key={`${url}-${index}`} className="card">
                        <Image
                          src={url}
                          alt={getPortfolioImageAlt(item)}
                          width={640}
                          height={420}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

        <section className="section">
          <div className="container">
            <h2>Reviews</h2>

            {reviews.length > 0 ? (
              <div className="grid-2">
                {reviews.map((review) => (
                  <article key={review.id} className="card">
                    <h3>{review.review_title ?? `${review.rating}/5 review`}</h3>
                    <p>{review.review_body ?? "No written review provided."}</p>
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

        {[...areaLinks, ...nearbyAreaLinks].length > 0 && (
          <section className="section-sm">
            <div className="container">
              <h2>Service areas</h2>
              <div className="grid-3">
                {[...areaLinks, ...nearbyAreaLinks].slice(0, 9).map((link) => (
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
