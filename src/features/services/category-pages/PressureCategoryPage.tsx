import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { pressureSubcategories } from "@/lib/services/subcategories/pressure";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=pressure-washing&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/pressure-washing/${subcategorySlug}`;
}

const popularSearches = [
  "pressure washing near me",
  "same day pressure washing",
  "driveway pressure washing",
  "house washing near me",
  "soft wash house cleaning",
  "roof soft washing",
  "deck pressure washing",
  "fence pressure washing",
  "patio pressure washing",
  "concrete pressure washing",
  "sidewalk pressure washing",
  "affordable pressure washing",
  "local pressure washing pros",
  "best pressure washing service",
  "residential pressure washing",
  "commercial pressure washing",
];

const proHelpItems = [
  "Choose the right method for concrete, siding, wood, stucco, roof surfaces, and pavers.",
  "Remove dirt, algae, mildew, surface stains, tire marks, and outdoor buildup.",
  "Use soft washing when high pressure may damage siding, painted surfaces, wood, or roofing.",
  "Clean driveways, sidewalks, patios, pool decks, fences, decks, and exterior walls.",
  "Prepare surfaces before painting, sealing, staining, selling, renting, or seasonal maintenance.",
];

const commonUseCases = [
  "Driveway or sidewalk looks dark, stained, or slippery.",
  "Siding has algae, mildew, pollen, dirt, or weather buildup.",
  "Deck, fence, patio, or pool deck needs outdoor cleaning.",
  "Roof has black streaks or organic growth that needs soft washing.",
  "Commercial entry, storefront, or sidewalk needs a cleaner customer-facing appearance.",
];

const priceFactors = [
  "Surface type and cleaning method",
  "Approximate square footage",
  "Amount of algae, mildew, dirt, oil, or stain buildup",
  "Number of stories and access difficulty",
  "Water access and drainage conditions",
  "Whether soft washing, pre-treatment, or post-treatment is needed",
];

const hireProSituations = [
  "The surface may be damaged by high pressure.",
  "You need roof, siding, stucco, painted surface, or wood cleaning.",
  "The area is large, stained, slippery, or difficult to access.",
  "You are preparing the property for sale, rent, guests, painting, sealing, or inspection.",
  "You want faster, more even results than consumer-grade equipment can provide.",
];

const urgentCases = [
  "Slippery algae on walkways, stairs, pool decks, or entry areas",
  "Heavy mildew or organic growth on siding or exterior walls",
  "Oil, grease, or commercial stains in customer-facing areas",
  "Cleaning needed before a listing, move-in, inspection, event, or exterior painting job",
];

const requestTips = [
  "Surface type: concrete, siding, brick, pavers, wood, vinyl, stucco, roof, or composite",
  "Approximate size or dimensions",
  "Number of stories and access details",
  "Type of buildup: algae, mildew, oil, tire marks, dirt, rust, gum, or general grime",
  "Water access, parking, drainage concerns, and preferred timing",
  "Photos of the surface and close-ups of stains or buildup",
];

const faq = [
  {
    question: "How much does pressure washing cost?",
    answer:
      "Pressure washing cost depends on surface type, size, buildup, access, and cleaning method. Small areas may be priced as a flat job, while larger driveways, homes, roofs, or commercial areas cost more.",
  },
  {
    question: "Is pressure washing safe for siding?",
    answer:
      "Siding often needs soft washing or controlled pressure. A pro can choose the right method to reduce the risk of water intrusion, paint damage, or surface marks.",
  },
  {
    question: "Can I get same-day pressure washing?",
    answer:
      "Same-day service may be available depending on local pro availability, surface size, water access, and weather conditions.",
  },
  {
    question: "What is the difference between pressure washing and soft washing?",
    answer:
      "Pressure washing uses higher pressure for durable surfaces like concrete. Soft washing uses lower pressure and cleaning solution for siding, roofs, painted surfaces, wood, and other sensitive materials.",
  },
  {
    question: "Can pressure washing remove oil stains?",
    answer:
      "It can improve many oil stains, but results depend on stain age, surface porosity, and whether treatment is needed before washing.",
  },
  {
    question: "Should I pressure wash before painting or staining?",
    answer:
      "Yes, cleaning before painting, sealing, or staining can help remove dirt, mildew, and loose surface buildup. The surface may still need drying time and prep after washing.",
  },
];

const relatedCategorySlugs = [
  "cleaning",
  "painting",
  "roofing",
  "lawn-care",
  "property-maintenance",
];

export default function PressureCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(pressureSubcategories);

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((nearbyMarket): nearbyMarket is Market => Boolean(nearbyMarket));

  const relatedCategories = relatedCategorySlugs
    .map((slug) => getCategoryBySlug(slug))
    .filter((relatedCategory): relatedCategory is Category =>
      Boolean(relatedCategory)
    );

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pressure Washing</p>

            <h1>
              Pressure Washing Services in {market.city}, {market.state}
            </h1>

            <p className="hero-text">
              Request pressure washing, power washing, and soft washing for
              driveways, siding, decks, fences, patios, sidewalks, roofs, pool
              decks, and commercial exterior surfaces in {market.city}.
            </p>

            <div className="flex gap-md">
              <Link href={getBookHref(market)} className="button button-primary">
                Request pressure washing
              </Link>

              <Link href="#pressure-services" className="button button-secondary">
                Browse services
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Quick request</p>
                <h2>Need pressure washing help in {market.city}?</h2>
                <p>
                  Describe the surface, size, stains, water access, and timing.
                  Fixly turns your request into a clear local job so available
                  pros can respond with the right scope.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Start request
              </Link>
            </div>
          </div>
        </section>

        <section id="pressure-services" className="section">
          <div className="container">
            <p className="eyebrow">All pressure washing services</p>
            <h2>Exterior cleaning services you can request</h2>
            <p>
              Use this category as a traffic hub for high-intent pressure
              washing searches across residential and light commercial jobs.
            </p>

            <div className="grid-3">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  href={getServiceHref(market, subcategory.slug)}
                  className="card card-hover"
                >
                  <h3>{subcategory.title}</h3>
                  <p>{subcategory.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">Popular searches</p>
              <h2>Pressure washing searches in {market.city}</h2>

              <ul className="service-seo-list">
                {popularSearches.map((phrase) => (
                  <li key={phrase}>
                    {phrase} in {market.city}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2">
            <div className="card">
              <h2>What pros can help with</h2>
              <ul className="service-list">
                {proHelpItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>Common problems and use cases</h2>
              <ul className="service-list">
                {commonUseCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2">
            <div className="card">
              <h2>Pressure washing price guidance</h2>
              <p>
                Small jobs often include a single driveway, sidewalk, patio, or
                entry area. Medium jobs may include a home exterior, deck,
                fence, or larger hardscape area. Larger jobs can include roof
                soft washing, full exterior cleaning, multi-surface projects, or
                commercial properties.
              </p>
              <p>
                Final pricing depends on size, condition, access, safety,
                surface type, treatment needs, and whether the job requires
                pressure washing, soft washing, or stain-specific cleaning.
              </p>
            </div>

            <div className="card">
              <h2>Common price factors</h2>
              <ul className="service-list">
                {priceFactors.map((factor) => (
                  <li key={factor}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2">
            <div className="card">
              <h2>When to hire a pressure washing pro</h2>
              <ul className="service-list">
                {hireProSituations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>Urgent or high-risk cases</h2>
              <ul className="service-list">
                {urgentCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <h2>How to get better responses</h2>
              <p>
                Clear requests help pros estimate the job faster and avoid vague
                pricing. Include:
              </p>

              <ul className="service-list">
                {requestTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 && (
          <section className="section-sm">
            <div className="container">
              <h2>Pressure washing near {market.city}</h2>

              <div className="grid-3">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    href={`${getMarketUrlPath(nearbyMarket)}/pressure-washing`}
                    className="card card-hover"
                  >
                    <h3>
                      Pressure Washing in {nearbyMarket.city},{" "}
                      {nearbyMarket.state}
                    </h3>
                    <p>
                      Find local exterior cleaning pros near{" "}
                      {nearbyMarket.city}.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section-sm">
          <div className="container">
            <h2>Related home service categories</h2>

            <div className="grid-3">
              {relatedCategories.map((relatedCategory) => (
                <Link
                  key={relatedCategory.slug}
                  href={`${getMarketUrlPath(market)}/${relatedCategory.slug}`}
                  className="card card-hover"
                >
                  <h3>{relatedCategory.title}</h3>
                  <p>{relatedCategory.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <h2>Pressure washing FAQ</h2>

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
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Get started</p>
                <h2>Request pressure washing in {market.city}</h2>
                <p>
                  Create a clear request for driveway washing, house washing,
                  roof soft washing, deck cleaning, fence washing, or commercial
                  exterior cleaning.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Request service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}