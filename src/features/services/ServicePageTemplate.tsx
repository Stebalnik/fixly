import Link from "next/link";
import HandymanCategoryPage from "@/features/services/category-pages/HandymanCategoryPage";
import PlumbingCategoryPage from "@/features/services/category-pages/PlumbingCategoryPage";
import ElectricalCategoryPage from "@/features/services/category-pages/ElectricalCategoryPage";
import AppliancesCategoryPage from "@/features/services/category-pages/AppliancesCategoryPage";
import CleaningCategoryPage from "@/features/services/category-pages/CleaningCategoryPage";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Category } from "@/lib/services/categories";
import type { Subcategory } from "@/lib/services/types";
import type { Market } from "@/lib/geo";
import { getMarketUrlPath } from "@/lib/geo";
import {
  getCategorySeoBySlug,
  getEnhancedServiceFaq,
  getLocalSearchPhrases,
  getLocalSeoParagraphs,
  getServiceBreadcrumbs,
  getServiceFaq,
  getServiceIncludedItems,
  getServiceJsonLd,
  getServicePriceFactors,
  getServiceSeoDetails,
  getServiceSeoIntro,
  getWhenToHirePro,
} from "@/lib/seo";

type ServicePageTemplateProps = {
  category?: Category;
  subcategory?: Subcategory;
  market: Market;
  relatedSubcategories?: Subcategory[];
};

function getServiceHref(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
}) {
  const marketPath = getMarketUrlPath(params.market);

  if (params.subcategory) {
    return `${marketPath}/${params.subcategory.parentSlug}/${params.subcategory.slug}`;
  }

  if (params.category) {
    return `${marketPath}/${params.category.slug}`;
  }

  return marketPath;
}

function getBookHref(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
}) {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category.slug);
  }

  if (params.subcategory) {
    searchParams.set("category", params.subcategory.parentSlug);
    searchParams.set("subcategory", params.subcategory.slug);
  }

  searchParams.set("market", params.market.slug);

  return `/book?${searchParams.toString()}`;
}

export default function ServicePageTemplate({
  category,
  subcategory,
  market,
  relatedSubcategories = [],
}: ServicePageTemplateProps) {
  const categorySeo = !subcategory
    ? getCategorySeoBySlug(
        {
          city: market.city,
          state: market.state,
        },
        category?.slug
      )
    : undefined;

  const title = subcategory?.title ?? category?.title ?? "Fixly Services";

  const description =
    subcategory?.description ??
    categorySeo?.description ??
    category?.description ??
    "Find trusted local home service professionals.";

  const heroSubtitle = categorySeo?.subtitle ?? description;


  const seoIntro =
    categorySeo?.description ??
    getServiceSeoIntro({
      market,
      category,
      subcategory,
    });

  const seoDetails: string[] = [
    ...(categorySeo?.whyChoose ?? []),
    ...getServiceSeoDetails({
      market,
      category,
      subcategory,
    }),
  ];

  const baseFaq =
    categorySeo?.faq ??
    getServiceFaq({
      market,
      category,
      subcategory,
    });

  const enhancedFaq = getEnhancedServiceFaq({
    market,
    category,
    subcategory,
  });

  const faq = [...baseFaq, ...enhancedFaq];

  const includedItems = getServiceIncludedItems({
    market,
    category,
    subcategory,
  });

  const priceFactors = getServicePriceFactors({
    market,
    category,
    subcategory,
  });

  const whenToHirePro = getWhenToHirePro({
    market,
    category,
    subcategory,
  });

  const searchPhrases = getLocalSearchPhrases({
    market,
    category,
    subcategory,
  });

  const localSeoParagraphs = getLocalSeoParagraphs({
    market,
    category,
    subcategory,
  });

  const serviceJsonLd = getServiceJsonLd({
    market,
    category,
    subcategory,
  });

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

  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
    subcategory,
  });

  const bookHref = getBookHref({
    market,
    category,
    subcategory,
  });

///category//slugs

  if (category?.slug === "handyman" && !subcategory) {
  return <HandymanCategoryPage category={category} market={market} />;
}
if (category?.slug === "plumbing" && !subcategory) {
  return <PlumbingCategoryPage category={category} market={market} />;
}
if (category?.slug === "electrical" && !subcategory) {
  return <ElectricalCategoryPage category={category} market={market} />;
}
if (category?.slug === "appliance-repair-installation" && !subcategory) {
  return <AppliancesCategoryPage category={category} market={market} />;
}
if (category?.slug === "cleaning" && !subcategory) {
  return <CleaningCategoryPage category={category} market={market} />;
}

  return (
    <PublicPageShell market={market}>
      <main className="page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceJsonLd),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />

        <section className="section-sm">
          <div className="container">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </section>

        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Services</p>

            <h1>
              {title} in {market.city}, {market.state}
            </h1>

            <p className="hero-text">{heroSubtitle}</p>

            <div className="flex gap-md">
              <Link href={bookHref} className="button button-primary">
                Request service
              </Link>

              <Link href="/services" className="button button-secondary">
                Browse services
              </Link>
            </div>
          </div>
        </section>

        {subcategory && (
          <section className="section">
            <div className="container grid-2">
              <div className="card">
                <h2>Common requests</h2>

                <ul className="service-list">
                  {subcategory.commonProblems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h2>Estimated price</h2>

                <p className="service-price">
                  ${subcategory.priceMin}–${subcategory.priceMax}
                </p>

                <p className="text-muted">
                  Final price depends on project size, materials, access, and
                  urgency.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container grid-3">
            <div className="card">
              <h2>What’s included</h2>
              <ul className="service-list">
                {includedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>Price factors</h2>
              <ul className="service-list">
                {priceFactors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>When to hire a pro</h2>
              <ul className="service-list">
                {whenToHirePro.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {categorySeo?.whyChoose && categorySeo.whyChoose.length > 0 && (
          <section className="section">
            <div className="container">
              <h2>Why choose Fixly for {title.toLowerCase()}?</h2>

              <div className="grid-3">
                {categorySeo.whyChoose.map((item) => (
                  <div key={item} className="card">
                    <h3>{item}</h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedSubcategories.length > 0 && (
          <section className="section">
            <div className="container">
              <h2>Related services in {market.city}</h2>

              <div className="grid-3">
                {relatedSubcategories.map((item) => (
                  <Link
                    key={item.slug}
                    href={getServiceHref({ market, subcategory: item })}
                    className="card card-hover"
                  >
                    <h3>{item.shortTitle}</h3>
                    <p>{item.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <div className="card">
              <h2>
                Local {title.toLowerCase()} in {market.city}, {market.state}
              </h2>

              <p>{seoIntro}</p>

              {localSeoParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <div className="service-seo-list">
                {seoDetails.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="card">
              <h2>
                Popular searches for {title.toLowerCase()} in {market.city}
              </h2>

              <div className="service-seo-list">
                {searchPhrases.map((phrase) => (
                  <p key={phrase}>{phrase}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <h2>Questions about {title.toLowerCase()}</h2>

            <div className="grid-3">
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
          <div className="container flex-center">
            <div className="card service-cta-card">
              <h2>Need {title.toLowerCase()}?</h2>

              <p>
                Submit your request and let local pros in {market.city},{" "}
                {market.state} respond.
              </p>

              <Link href={bookHref} className="button button-primary">
                Start request
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}