import Link from "next/link";
import type { ServiceIntent, ServiceIntentSlug } from "@/lib/seo/intents";
import {
  getAllowedIntentsForService,
  getIntentValidation,
  serviceIntents,
  tierOneIntentSlugs,
} from "@/lib/seo/intents";
import HandymanCategoryPage from "@/features/services/category-pages/HandymanCategoryPage";
import PlumbingCategoryPage from "@/features/services/category-pages/PlumbingCategoryPage";
import ElectricalCategoryPage from "@/features/services/category-pages/ElectricalCategoryPage";
import AppliancesCategoryPage from "@/features/services/category-pages/AppliancesCategoryPage";
import CleaningCategoryPage from "@/features/services/category-pages/CleaningCategoryPage";
import RoofingCategoryPage from "./category-pages/RoofingCategoryPage";
import RemodelingCategoryPage from "@/features/services/category-pages/RemodelingCategoryPage";
import FlooringCategoryPage from "./category-pages/FlooringCategoryPage";
import LawnCategoryPage from "./category-pages/LawnCategoryPage";
import PaintingCategoryPage from "./category-pages/PaintingCategoryPage";
import PressureCategoryPage from "./category-pages/PressureCategoryPage";
import HvacCategoryPage from "./category-pages/HvacCategoryPage";
import GarageCategoryPage from "./category-pages/GarageCategoryPage";
import PestCategoryPage from "./category-pages/PestCategoryPage";
import MovingCategoryPage from "./category-pages/MovingCategoryPage";
import MaintenanceCategoryPage from "./category-pages/MaintenanceCategoryPage";
import FenceCategoryPage from "./category-pages/FenceCategoryPage";
import AwningsCategoryPage from "./category-pages/AwningsCategoryPage";
import JunkCategoryPage from "./category-pages/JunkCategoryPage";
import SolarCategoryPage from "./category-pages/SolarCategoryPage";
import PoolCategoryPage from "./category-pages/PoolCategoryPage";
import PublicPageShell from "@/components/PublicPageShell";
import type { Category } from "@/lib/services/categories";
import type { Subcategory } from "@/lib/services/types";
import type { Market } from "@/lib/geo";
import {
  formatLocation,
  getMarketUrlPath,
  getSeoRelationMarkets,
} from "@/lib/geo";
import {
  getCategorySeoBySlug,
  getEnhancedServiceFaq,
  getLocalSearchPhrases,
  getLocalSeoParagraphs,
  getServiceBreadcrumbs,
  getServiceFaq,
  getServiceIncludedItems,
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
  intent?: ServiceIntent;
  intentH1?: string;
};

function getServiceHref(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent?: ServiceIntent;
}) {
  const marketPath = getMarketUrlPath(params.market);

  if (params.subcategory) {
    const basePath = `${marketPath}/${params.subcategory.parentSlug}/${params.subcategory.slug}`;
    return params.intent ? `${basePath}/${params.intent.slug}` : basePath;
  }

  if (params.category) {
    const basePath = `${marketPath}/${params.category.slug}`;
    return params.intent ? `${basePath}/${params.intent.slug}` : basePath;
  }

  return marketPath;
}

function getBookHref(params: {
  market: Market;
  category?: Category;
  subcategory?: Subcategory;
  intent?: ServiceIntent;
}) {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("category", params.category.slug);
  }

  if (params.subcategory) {
    searchParams.set("category", params.subcategory.parentSlug);
    searchParams.set("subcategory", params.subcategory.slug);
  }

  if (params.intent) {
    searchParams.set("intent", params.intent.slug);
  }

  searchParams.set("market", params.market.slug);

  return `/book?${searchParams.toString()}`;
}

function getIntentSectionTitle(intent: ServiceIntent, title: string) {
  if (intent.slug === "price") return `${title} pricing in your area`;
  if (intent.slug === "emergency") return `Urgent ${title.toLowerCase()} help`;
  if (intent.slug === "24-hour")
    return `24-hour ${title.toLowerCase()} availability`;
  if (intent.slug === "same-day")
    return `Same-day ${title.toLowerCase()} availability`;
  if (intent.slug === "near-me") return `${title} near you`;
  if (intent.slug === "cheap")
    return `Affordable ${title.toLowerCase()} options`;

  return `${intent.title} ${title.toLowerCase()} service`;
}

function getIntentDetails(args: {
  intent: ServiceIntent;
  title: string;
  market: Market;
  isWeakIntent: boolean;
}) {
  const { intent, title, market, isWeakIntent } = args;
  const serviceTitle = title.toLowerCase();

  if (isWeakIntent) {
    return [
      `${intent.title} ${serviceTitle} in ${market.city} may depend on project scope, availability, permits, materials, and whether the request is for full completion, inspection, estimate, or scheduling.`,
      "For larger projects, local pros may not complete the full job immediately, but they may still offer a fast consultation, estimate, inspection, or first available appointment.",
      "Submit clear details so pros can decide whether the request fits their availability and give realistic next steps.",
    ];
  }

  if (intent.slug === "price") {
    return [
      `Typical ${serviceTitle} pricing in ${market.city} depends on project size, materials, access, urgency, and whether specialized labor is required.`,
      "Compare quotes before booking so you can understand labor, materials, trip fees, and any emergency or weekend charges.",
      "Fixly helps turn your request into a clear lead so local pros can review the details and respond with realistic pricing.",
    ];
  }

  if (intent.slug === "emergency") {
    return [
      `Emergency ${serviceTitle} requests should be handled quickly when there is active damage, safety risk, loss of essential service, or a problem that may get worse if delayed.`,
      "Describe the issue clearly, add photos when possible, and mention whether the problem is active right now.",
      "For safety-critical plumbing, electrical, roofing, HVAC, or structural issues, avoid risky DIY work and contact a qualified local pro.",
    ];
  }

  if (intent.slug === "24-hour") {
    return [
      `24-hour ${serviceTitle} pages are for situations where timing matters outside normal business hours.`,
      "Availability can vary by city, category, and urgency, so the clearest requests usually get faster responses.",
      "Include the best contact method, access notes, and whether the work can wait until morning or needs immediate attention.",
    ];
  }

  if (intent.slug === "same-day") {
    return [
      `Same-day ${serviceTitle} service in ${market.city} is best for projects that need fast scheduling but may not be a true emergency.`,
      "Share the scope, location, photos, preferred time window, and any access limitations.",
      "Local pros can decide quickly whether they have today availability and what the likely price range may be.",
    ];
  }

  return [
    intent.description,
    `Fixly helps homeowners in ${market.city} describe the job clearly and connect with local pros for ${serviceTitle}.`,
    "The more specific your request is, the easier it is for pros to respond with accurate availability and pricing.",
  ];
}

export default function ServicePageTemplate({
  category,
  subcategory,
  market,
  relatedSubcategories = [],
  intent,
  intentH1,
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

  const intentValidation = intent
    ? getIntentValidation({
        category,
        subcategory,
        intentSlug: intent.slug,
      })
    : null;

  const isWeakIntent = intentValidation?.status === "weak";
  const heroSubtitle = intent?.description ?? categorySeo?.subtitle ?? description;

  const seoIntro =
    categorySeo?.description ??
    getServiceSeoIntro({
      market,
      category,
      subcategory,
      intent,
    });

  const seoDetails: string[] = [
    ...(categorySeo?.whyChoose ?? []),
    ...getServiceSeoDetails({
      market,
      category,
      subcategory,
      intent,
    }),
  ];

  const baseFaq =
    categorySeo?.faq ??
    getServiceFaq({
      market,
      category,
      subcategory,
      intent,
    });

  const enhancedFaq = getEnhancedServiceFaq({
    market,
    category,
    subcategory,
    intent,
  });

  const faq = [...baseFaq, ...enhancedFaq];

  const includedItems = getServiceIncludedItems({
    market,
    category,
    subcategory,
    intent,
  });

  const priceFactors = getServicePriceFactors({
    market,
    category,
    subcategory,
    intent,
  });

  const whenToHirePro = getWhenToHirePro({
    market,
    category,
    subcategory,
    intent,
  });

  const searchPhrases = getLocalSearchPhrases({
    market,
    category,
    subcategory,
    intent,
  });

  const localSeoParagraphs = getLocalSeoParagraphs({
    market,
    category,
    subcategory,
    intent,
  });

  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
    subcategory,
  });

  const bookHref = getBookHref({
    market,
    category,
    subcategory,
    intent,
  });

  const isCategoryPage = Boolean(category && !subcategory && !intent);

  const intentDetails = intent
    ? getIntentDetails({
        intent,
        title,
        market,
        isWeakIntent,
      })
    : [];

  const allowedRelatedIntentSlugs: ServiceIntentSlug[] =
    getAllowedIntentsForService({
      category,
      subcategory,
      intentSlugs: tierOneIntentSlugs,
    });

  const relatedIntents = allowedRelatedIntentSlugs
    .map((intentSlug: ServiceIntentSlug) => serviceIntents[intentSlug])
    .filter(
      (item: ServiceIntent) => item.slug !== intent?.slug && item.indexable
    );

  const geoRelations = getSeoRelationMarkets(market.slug);

  const serviceAreaMarkets = [
    ...geoRelations.metroMarkets,
    ...geoRelations.nearbyMarkets,
  ].slice(0, 12);

  if (isCategoryPage && category?.slug === "handyman") {
    return <HandymanCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "plumbing") {
    return <PlumbingCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "electrical") {
    return <ElectricalCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "appliance-repair-installation") {
    return <AppliancesCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "cleaning") {
    return <CleaningCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "remodeling") {
    return <RemodelingCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "roofing") {
    return <RoofingCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "flooring") {
    return <FlooringCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "lawn-care") {
    return <LawnCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "painting") {
    return <PaintingCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "pressure-washing") {
    return <PressureCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "hvac") {
    return <HvacCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "garage") {
    return <GarageCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "pest") {
    return <PestCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "moving") {
    return <MovingCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "maintenance") {
    return <MaintenanceCategoryPage category={category} market={market} />;
  }

  if (
    isCategoryPage &&
    category?.slug === "fence-installation-repair-services"
  ) {
    return <FenceCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "awnings") {
    return <AwningsCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "junk-removal") {
    return <JunkCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "solar") {
    return <SolarCategoryPage category={category} market={market} />;
  }

  if (isCategoryPage && category?.slug === "pool") {
    return <PoolCategoryPage category={category} market={market} />;
  }

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">
              {intent ? `${intent.title} service` : "Fixly Services"}
            </p>

            <h1>{intentH1 ?? `${title} in ${market.city}, ${market.state}`}</h1>

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

        {intent && (
          <section className="section-sm">
            <div className="container">
              <div className="card">
                <p className="eyebrow">
                  {isWeakIntent ? "Specialized intent" : "High-intent service"}
                </p>

                <h2>{getIntentSectionTitle(intent, title)}</h2>

                <div className="service-seo-list">
                  {intentDetails.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

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

        {intent && relatedIntents.length > 0 && (
          <section className="section">
            <div className="container">
              <h2>Related searches for {title.toLowerCase()}</h2>

              <div className="grid-3">
                {relatedIntents.map((relatedIntent) => (
                  <Link
                    key={relatedIntent.slug}
                    href={getServiceHref({
                      market,
                      category,
                      subcategory,
                      intent: relatedIntent,
                    })}
                    className="card card-hover"
                  >
                    <h3>
                      {relatedIntent.seoTitleSuffix} {title}
                    </h3>
                    <p>{relatedIntent.description}</p>
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

        {(geoRelations.neighborhoods.length > 0 ||
          serviceAreaMarkets.length > 0) && (
          <section className="section">
            <div className="container">
              <div className="card">
                <h2>
                  {title} service areas around {market.city}, {market.state}
                </h2>

                {geoRelations.neighborhoods.length > 0 && (
                  <>
                    <h3>Neighborhoods and districts</h3>

                    <div className="service-seo-list">
                      {geoRelations.neighborhoods.map((neighborhood) => (
                        <p key={neighborhood.slug}>
                          {title} requests in {neighborhood.name} are handled
                          through the main {market.city}, {market.state} service
                          area.
                        </p>
                      ))}
                    </div>
                  </>
                )}

                {serviceAreaMarkets.length > 0 && (
                  <>
                    <h3>Nearby service areas</h3>

                    <div className="grid-3">
                      {serviceAreaMarkets.map((relatedMarket) => (
                        <Link
                          key={relatedMarket.slug}
                          href={getServiceHref({
                            market: relatedMarket,
                            category,
                            subcategory,
                            intent,
                          })}
                          className="card card-hover"
                        >
                          <h3>{formatLocation(relatedMarket)}</h3>
                          <p>
                            Find {title.toLowerCase()} pros in{" "}
                            {relatedMarket.city}, {relatedMarket.state}.
                          </p>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

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