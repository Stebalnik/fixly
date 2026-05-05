import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { lawnSubcategories } from "@/lib/services/subcategories/lawn";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=lawn-care&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/lawn-care/${subcategorySlug}`;
}

const popularSearches = [
  "lawn mowing near me",
  "same day lawn mowing",
  "lawn care near me",
  "yard cleanup near me",
  "leaf removal near me",
  "weed control service near me",
  "mulch installation near me",
  "sod installation near me",
  "lawn repair near me",
  "grass seeding service near me",
  "lawn aeration near me",
  "hedge trimming near me",
  "brush removal near me",
  "affordable lawn care",
  "best lawn care company",
  "local lawn care pros",
];

const proHelpItems = [
  "Mowing, edging, trimming, and recurring lawn maintenance",
  "One-time yard cleanup, overgrowth cleanup, and seasonal cleanup",
  "Leaf removal, brush removal, and outdoor debris cleanup",
  "Mulch installation, flower bed cleanup, and landscape edging",
  "Sod installation, lawn repair, seeding, overseeding, and aeration",
  "Weed control, fertilization coordination, and lawn health support",
  "Hedge trimming, shrub cleanup, and small shrub removal",
  "Sprinkler troubleshooting and irrigation coverage issues",
];

const commonUseCases = [
  "The grass is too high and needs same-day or urgent mowing.",
  "The yard needs cleanup before guests, move-out, sale, rent, or HOA review.",
  "Leaves, branches, or storm debris are covering the lawn.",
  "Flower beds are overgrown with weeds and old mulch.",
  "The lawn has bare spots, dead patches, pet damage, or thin grass.",
  "A property needs recurring outdoor maintenance while vacant or rented.",
  "Shrubs or hedges are blocking walkways, windows, or curb appeal.",
  "Sprinkler issues are causing dry spots or water waste.",
];

const priceFactors = [
  "Yard size, service area, and slope",
  "Grass height, overgrowth, and current condition",
  "One-time service versus recurring maintenance",
  "Debris amount, bagging, and haul-away needs",
  "Materials such as mulch, sod, seed, soil, or fertilizer",
  "Gate access, equipment access, parking, and property layout",
  "Weather, seasonality, urgency, and same-day availability",
];

const hireProItems = [
  "The lawn is overgrown or hard to manage with basic tools.",
  "You need reliable recurring service instead of one-time help.",
  "The yard needs cleanup before a deadline, listing, inspection, or HOA notice.",
  "The job involves hauling, heavy debris, sod, soil, or larger landscape areas.",
  "You are not sure whether the lawn needs mowing, repair, seeding, aeration, or irrigation help.",
];

const urgentCases = [
  "HOA or property management notice with a short deadline",
  "Overgrown grass attracting pests or blocking safe access",
  "Storm debris, fallen branches, or wet leaves creating slip risks",
  "Sprinkler leaks causing water waste or lawn damage",
  "Move-out, rental turnover, open house, or listing photos scheduled soon",
];

const responseTips = [
  "Add clear photos of the front yard, back yard, side yards, beds, and problem areas.",
  "Mention yard size or approximate square footage if you know it.",
  "Describe grass height, debris amount, weeds, access, gates, slope, and parking.",
  "Say whether you need one-time, same-day, weekly, biweekly, or seasonal service.",
  "Note whether bagging, haul-away, mulch, sod, seed, soil, or sprinkler parts may be needed.",
];

const faq = [
  {
    question: "How much does lawn care cost?",
    answer:
      "Lawn care cost depends on yard size, grass height, cleanup needs, materials, access, urgency, and whether the service is one-time or recurring. Routine mowing is usually simpler than heavy cleanup, sod installation, grading, or lawn repair.",
  },
  {
    question: "Can I get same-day lawn service?",
    answer:
      "Same-day lawn service may be available depending on local pro schedules, weather, daylight, and job size. Photos and clear access notes help pros respond faster.",
  },
  {
    question: "What lawn services can I request on Fixly?",
    answer:
      "You can request mowing, maintenance, yard cleanup, leaf removal, weed control, mulch installation, flower bed cleanup, edging, sod, lawn repair, seeding, aeration, fertilization, hedge trimming, brush removal, and sprinkler repair.",
  },
  {
    question: "Do I need recurring lawn maintenance or one-time service?",
    answer:
      "Choose one-time service for cleanup, urgent mowing, or a specific project. Choose recurring maintenance if the property needs ongoing mowing, edging, trimming, and seasonal care.",
  },
  {
    question: "What should I include in my lawn care request?",
    answer:
      "Include the property type, yard size, current condition, photos, grass height, debris amount, gate access, pets, preferred timing, and whether haul-away or materials are needed.",
  },
  {
    question: "Can lawn pros help with rental or vacant properties?",
    answer:
      "Yes. Lawn care requests are common for rentals, vacant homes, move-outs, sale prep, open houses, and property management needs.",
  },
];

export default function LawnCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(lawnSubcategories);

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((nearbyMarket): nearbyMarket is Market => Boolean(nearbyMarket));

  const relatedCategories = [
    "handyman",
    "cleaning",
    "pressure-washing",
    "property-maintenance",
    "fence-installation-repair",
    "junk-removal",
  ]
    .map((slug) => getCategoryBySlug(slug))
    .filter((relatedCategory): relatedCategory is Category =>
      Boolean(relatedCategory)
    );

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="service-hero">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">Lawn care services</p>
                <h1>
                  Lawn Services in {market.city}, {market.state}
                </h1>
                <p className="hero-text">
                  Find local lawn care pros for mowing, yard cleanup, leaf
                  removal, weed control, mulch, sod, lawn repair, seeding,
                  aeration, hedge trimming, brush removal, sprinkler issues,
                  and seasonal outdoor maintenance in {market.city}.
                </p>
                <div className="flex gap-sm">
                  <Link className="button button-primary" href={getBookHref(market)}>
                    Request lawn help
                  </Link>
                  <a className="button button-secondary" href="#lawn-services">
                    View services
                  </a>
                </div>
              </div>

              <div className="card">
                <p className="badge badge-success">Local lawn request</p>
                <h2>Need lawn help in {market.city}?</h2>
                <p>
                  Tell Fixly what your yard needs, add photos, and submit one
                  clear request. Local pros can review the scope and respond
                  with availability, next steps, and price guidance.
                </p>
                <Link className="button button-primary" href={getBookHref(market)}>
                  Start a request
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="lawn-services">
          <div className="container">
            <div className="flex-between gap-md">
              <div>
                <p className="eyebrow">All lawn services</p>
                <h2>Lawn care, cleanup, repair, and seasonal maintenance</h2>
              </div>
              <Link className="button button-outline" href={getBookHref(market)}>
                Request service
              </Link>
            </div>

            <div className="grid-3 gap-md">
              {subcategories.map((subcategory) => (
                <Link
                  className="card card-hover"
                  href={getServiceHref(market, subcategory.slug)}
                  key={subcategory.slug}
                >
                  <h3>{subcategory.title}</h3>
                  <p>{subcategory.description}</p>
                  <p className="badge badge-primary">{subcategory.shortTitle}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">Popular searches</p>
              <h2>High-intent lawn searches in {market.city}</h2>
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

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-md">
              <div className="card">
                <p className="eyebrow">What pros can help with</p>
                <h2>Common lawn services</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Common problems</p>
                <h2>When homeowners request lawn help</h2>
                <ul className="service-list">
                  {commonUseCases.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-md">
              <div className="card">
                <p className="eyebrow">Price guidance</p>
                <h2>What affects lawn service pricing?</h2>
                <p>
                  Lawn pricing changes by scope. A small mowing visit is
                  different from a heavy yard cleanup, sod installation, lawn
                  repair, grading, or recurring maintenance plan.
                </p>
                <ul className="service-list">
                  {priceFactors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Typical job tiers</p>
                <h2>Small, medium, and larger lawn jobs</h2>
                <ul className="service-list">
                  <li>
                    Small jobs: routine mowing, edging, light trimming, or a
                    small leaf cleanup.
                  </li>
                  <li>
                    Medium jobs: yard cleanup, flower bed cleanup, mulch,
                    hedge trimming, weed control, or lawn repair.
                  </li>
                  <li>
                    Larger jobs: sod installation, grading, brush removal,
                    heavy cleanup, or multi-service seasonal work.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-md">
              <div className="card">
                <p className="eyebrow">When to hire a pro</p>
                <h2>Use a lawn pro when timing, tools, or quality matter</h2>
                <ul className="service-list">
                  {hireProItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>High-priority lawn situations</h2>
                <ul className="service-list">
                  {urgentCases.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">Better responses</p>
              <h2>How to get better lawn care responses</h2>
              <p>
                Lawn pros can respond more accurately when the request includes
                clear photos, scope, timing, property access, and whether
                materials or haul-away are needed.
              </p>
              <ul className="service-list">
                {responseTips.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 ? (
          <section className="section-sm">
            <div className="container">
              <div className="card">
                <p className="eyebrow">Nearby cities</p>
                <h2>Lawn care near {market.city}</h2>
                <div className="grid-3 gap-sm">
                  {nearbyMarkets.map((nearbyMarket) => (
                    <Link
                      className="card-flat"
                      href={`${getMarketUrlPath(nearbyMarket)}/lawn-care`}
                      key={nearbyMarket.slug}
                    >
                      Lawn services in {nearbyMarket.city}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {relatedCategories.length > 0 ? (
          <section className="section-sm">
            <div className="container">
              <div className="card">
                <p className="eyebrow">Related categories</p>
                <h2>Other home services near {market.city}</h2>
                <div className="grid-3 gap-md">
                  {relatedCategories.map((relatedCategory) => (
                    <Link
                      className="card card-hover"
                      href={`${getMarketUrlPath(market)}/${relatedCategory.slug}`}
                      key={relatedCategory.slug}
                    >
                      <h3>{relatedCategory.title}</h3>
                      {relatedCategory.description ? (
                        <p>{relatedCategory.description}</p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">FAQ</p>
              <h2>Lawn service questions</h2>
              <div className="grid-2 gap-md">
                {faq.map((item) => (
                  <div className="card-flat" key={item.question}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="service-cta-card">
              <p className="eyebrow">Get local lawn help</p>
              <h2>Ready to request lawn service in {market.city}?</h2>
              <p>
                Submit one clear request with photos, timing, and property
                details. Fixly helps route the request toward local lawn care
                pros who can respond based on scope and availability.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Request lawn service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}