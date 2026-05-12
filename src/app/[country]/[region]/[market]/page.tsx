export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import PublicPageShell from "@/components/PublicPageShell";
import {
  getMarketByGlobalPath,
  getMarketUrlPath,
  getNearbyMarkets,
} from "@/lib/geo";
import { categories } from "@/lib/services/categories";
import {
  getBreadcrumbJsonLd,
  getGeoHubFaq,
  getGeoHubInternalLinks,
  getGeoHubMetadata,
  getGeoHubPopularSearches,
  getJsonLdScriptProps,
  getOrganizationJsonLd,
  type JsonLdObject,
} from "@/lib/seo";

export const dynamicParams = true;
export const revalidate = 86400;

type PageProps = {
  params: Promise<{
    country: string;
    region: string;
    market: string;
  }>;
};

function JsonLdScript({ data }: { data: JsonLdObject | null | Record<string, unknown> }) {
  const props = getJsonLdScriptProps(data);

  if (!props) {
    return null;
  }

  return <script {...props} />;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { country, region, market } = await params;

  const currentMarket = getMarketByGlobalPath({
    countryCode: country,
    region,
    market,
  });

  if (!currentMarket) {
    return {};
  }

  return getGeoHubMetadata(currentMarket);
}

export default async function GeoHubPage({ params }: PageProps) {
  const { country, region, market } = await params;

  const currentMarket = getMarketByGlobalPath({
    countryCode: country,
    region,
    market,
  });

  if (!currentMarket) {
    notFound();
  }

  const marketPath = getMarketUrlPath(currentMarket);
  const allCategories = Object.values(categories);
  const popularCategories = allCategories.slice(0, 12);
  const popularSearches = getGeoHubPopularSearches({
    market: currentMarket,
    categories: popularCategories,
  }).slice(0, 12);

  const nearbyMarkets = getNearbyMarkets(currentMarket.slug).filter(
    (nearbyMarket) =>
      nearbyMarket.countryCode.toLowerCase() ===
        currentMarket.countryCode.toLowerCase() &&
      nearbyMarket.state.toLowerCase() === currentMarket.state.toLowerCase()
  );

  const faq = getGeoHubFaq(currentMarket);
  const internalLinks = getGeoHubInternalLinks({
    market: currentMarket,
    categories: popularCategories,
  });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "United States", href: "/us" },
    { label: currentMarket.stateFull },
    { label: currentMarket.city },
  ];

  const organizationJsonLd = getOrganizationJsonLd();
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "United States", url: "/us" },
    { name: currentMarket.stateFull, url: `/${country}/${region}` },
    { name: currentMarket.city, url: marketPath },
  ]);
  const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

  return (
    <PublicPageShell market={currentMarket} breadcrumbs={breadcrumbs}>
      <JsonLdScript data={organizationJsonLd} />
      <JsonLdScript data={breadcrumbJsonLd} />
      <JsonLdScript data={faqJsonLd} />

      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly local marketplace</p>

            <h1>
              Home Services in {currentMarket.city}, {currentMarket.state}
            </h1>

            <p className="hero-text">
              Find local pros for repairs, installations, cleaning, remodeling,
              outdoor work, maintenance, and urgent home service requests in{" "}
              {currentMarket.city}, {currentMarket.stateFull}.
            </p>

            <div className="flex gap-md">
              <Link
                href={`/book?market=${currentMarket.slug}`}
                className="button button-primary"
              >
                Request service
              </Link>

              <Link href="/requests" className="button button-secondary">
                View open requests
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Popular categories in {currentMarket.city}</h2>

            <div className="grid-3">
              {popularCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`${marketPath}/${category.slug}`}
                  className="card card-hover"
                >
                  <h3>{category.shortTitle}</h3>
                  <p>{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="card">
              <h2>Popular searches in {currentMarket.city}</h2>

              <div className="service-seo-list">
                {popularSearches.map((search) => (
                  <p key={search.label}>
                    <Link href={search.href}>{search.label}</Link>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 && (
          <section className="section">
            <div className="container">
              <h2>Nearby cities in {currentMarket.stateFull}</h2>

              <div className="grid-4">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    href={getMarketUrlPath(nearbyMarket)}
                    className="card card-hover"
                  >
                    <h3>{nearbyMarket.city}</h3>
                    <p>
                      Home services in {nearbyMarket.city},{" "}
                      {nearbyMarket.state}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <div className="card service-cta-card">
              <h2>Open service requests in {currentMarket.city}</h2>

              <p>
                Homeowners can submit a request, and local pros can review
                available jobs through the Fixly marketplace.
              </p>

              <div className="flex gap-md">
                <Link
                  href={`/book?market=${currentMarket.slug}`}
                  className="button button-primary"
                >
                  Create request
                </Link>

                <Link href="/requests" className="button button-secondary">
                  Browse requests
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <h2>Questions about home services in {currentMarket.city}</h2>

            <div className="grid-2">
              {faq.map((item) => (
                <div key={item.question} className="card">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Explore Fixly in {currentMarket.city}</h2>

            <div className="grid-3">
              {internalLinks.map((link) => (
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
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}