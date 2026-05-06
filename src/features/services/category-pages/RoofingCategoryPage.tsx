import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { roofingSubcategories } from "@/lib/services/subcategories/roofing";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=roofing&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/roofing/${subcategorySlug}`;
}

const popularSearches = [
  "roof repair near me",
  "roofing contractor near me",
  "emergency roof repair",
  "same day roof repair",
  "roof leak repair",
  "roof replacement cost",
  "roof installation near me",
  "storm damage roof repair",
  "hail damage roof repair",
  "shingle roof repair",
  "metal roof repair",
  "flat roof repair",
  "gutter installation and repair",
  "roof inspection near me",
  "licensed roofing contractor",
  "affordable roofer near me",
];

const proHelpItems = [
  "Roof leak detection and repair",
  "Missing, cracked, or lifted shingle repair",
  "Storm, wind, and hail damage restoration",
  "Roof replacement planning and installation",
  "Flashing, chimney, vent, and skylight leak repair",
  "Gutter installation, gutter repair, and drainage fixes",
  "Flat roof, metal roof, and asphalt shingle roofing",
  "Roof inspections, maintenance, and condition reports",
];

const commonProblems = [
  "Water stains on ceilings or walls",
  "Drips during rain or after storms",
  "Missing shingles after wind",
  "Soft spots, sagging areas, or visible roof deck damage",
  "Granules collecting near downspouts",
  "Damaged flashing around chimneys, vents, or skylights",
  "Overflowing gutters or poor roof drainage",
  "Older roofs nearing the end of service life",
];

const priceFactors = [
  "Roof size, pitch, height, and access",
  "Material type, including asphalt shingles, metal, tile, or flat roofing",
  "Repair size and whether decking is damaged",
  "Storm damage, emergency timing, and temporary protection needs",
  "Flashing, ventilation, gutter, chimney, or skylight work",
  "Permit, disposal, underlayment, and code requirements",
];

const betterResponseItems = [
  "Photos of the roof area, leak location, ceiling stains, and exterior damage",
  "Whether the issue started after wind, hail, heavy rain, or a known impact",
  "Roof type, approximate age, number of stories, and access limitations",
  "Whether the request is repair, replacement, inspection, or maintenance",
  "Any insurance claim status, inspection report, or prior estimate",
  "Preferred timing, urgency, and whether temporary leak protection is needed",
];

const faq = [
  {
    question: "How much does roofing cost?",
    answer:
      "Roofing cost depends on roof size, material, pitch, access, damage level, labor, disposal, permits, and whether the job is a repair or full replacement.",
  },
  {
    question: "Can I get same-day roof repair?",
    answer:
      "Many urgent roof leaks, missing shingles, and storm-related issues can be reviewed quickly. Same-day availability depends on weather, access, safety, and local pro schedules.",
  },
  {
    question: "Should I repair or replace my roof?",
    answer:
      "A repair may work for isolated leaks or limited damage. Replacement may make more sense when the roof is old, repeatedly leaking, widely damaged, or near the end of its service life.",
  },
  {
    question: "What should I include in a roofing request?",
    answer:
      "Include photos, roof type, number of stories, approximate roof age, where the leak or damage appears, when it started, and whether the job is urgent.",
  },
  {
    question: "Do roofing pros handle insurance storm damage?",
    answer:
      "Many roofing pros can inspect storm damage, document visible issues, and provide estimates. Insurance claim decisions and coverage depend on the insurer and policy.",
  },
  {
    question: "Are gutter repairs part of roofing?",
    answer:
      "Gutters are closely connected to roof drainage. Many roofing pros handle gutter installation, gutter repair, downspout issues, and drainage problems near roof edges.",
  },
];

const relatedCategorySlugs = [
  "remodeling",
  "painting",
  "cleaning",
  "handyman",
  "property-maintenance",
];

export default function RoofingCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(roofingSubcategories);

  const relatedCategories = relatedCategorySlugs
    .map((slug) => getCategoryBySlug(slug))
    .filter((item): item is Category => Boolean(item));

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((item): item is Market => Boolean(item));

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="service-hero">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">Roofing services</p>
                <h1>Roofing Services in {market.city}, {market.state}</h1>
                <p className="hero-text">
                  Find local roofing pros for roof repair, roof replacement,
                  roof installation, leak detection, storm damage restoration,
                  gutter work, inspections, and urgent roofing needs in{" "}
                  {market.city}.
                </p>
                <div className="flex gap-sm">
                  <Link className="button button-primary" href={getBookHref(market)}>
                    Request roofing help
                  </Link>
                  <a className="button button-secondary" href="#roofing-services">
                    View roofing services
                  </a>
                </div>
              </div>

              <div className="card">
                <p className="badge badge-primary">Request-first marketplace</p>
                <h2>Need roofing help in {market.city}?</h2>
                <p>
                  Submit one clear request with photos, timing, roof type, and
                  damage details. Local roofing pros can review the scope and
                  respond with relevant next steps.
                </p>
                <Link className="button button-primary" href={getBookHref(market)}>
                  Start a roofing request
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="roofing-services" className="section">
          <div className="container">
            <div className="flex-between gap-md">
              <div>
                <p className="eyebrow">All roofing services</p>
                <h2>Roofing services people request in {market.city}</h2>
              </div>
              <Link className="button button-outline" href={getBookHref(market)}>
                Book roofing
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
                  <span className="badge badge-primary">{subcategory.shortTitle}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card-flat">
              <p className="eyebrow">Popular searches</p>
              <h2>Popular roofing searches in {market.city}</h2>
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
          <div className="container">
            <div className="grid-2 gap-lg">
              <div className="card">
                <p className="eyebrow">What pros can help with</p>
                <h2>Roofing work local pros handle</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Common problems</p>
                <h2>Common roofing issues</h2>
                <ul className="service-list">
                  {commonProblems.map((item) => (
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
              <p className="eyebrow">Price guidance</p>
              <h2>What affects roofing prices?</h2>
              <p>
                Roofing prices vary because a small shingle repair, a leak
                diagnosis, a gutter repair, and a full roof replacement require
                different labor, materials, access, and risk levels.
              </p>
              <div className="grid-3 gap-md">
                <div className="card-flat">
                  <h3>Small repairs</h3>
                  <p>
                    Best for limited shingle damage, minor flashing issues,
                    small gutter repairs, or a focused leak check.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Medium jobs</h3>
                  <p>
                    Best for larger leak repairs, several damaged roof sections,
                    skylight leaks, chimney flashing, or partial roof work.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Larger projects</h3>
                  <p>
                    Best for full roof replacement, storm restoration, major
                    decking damage, commercial roofing, or material upgrades.
                  </p>
                </div>
              </div>
              <ul className="service-list">
                {priceFactors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div className="card">
                <p className="eyebrow">When to hire a pro</p>
                <h2>When roofing should not wait</h2>
                <p>
                  Hire a roofing pro when water is entering the home, shingles
                  are missing after a storm, roof decking feels soft, flashing
                  has failed, or the roof is old enough that repeated repairs no
                  longer solve the problem.
                </p>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>High-risk roofing situations</h2>
                <p>
                  Active leaks, storm openings, sagging roof sections, major
                  wind damage, exposed decking, electrical fixtures near water,
                  and unsafe roof access should be treated as urgent.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">Better responses</p>
              <h2>How to get better roofing responses</h2>
              <p>
                The more specific your request is, the easier it is for roofing
                pros to understand urgency, materials, access, and whether you
                need repair, replacement, inspection, or temporary protection.
              </p>
              <ul className="service-list">
                {betterResponseItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 && (
          <section className="section">
            <div className="container">
              <p className="eyebrow">Nearby cities</p>
              <h2>Roofing services near {market.city}</h2>
              <div className="grid-3 gap-md">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/roofing`}
                    key={nearbyMarket.slug}
                  >
                    <h3>{nearbyMarket.city}, {nearbyMarket.state}</h3>
                    <p>
                      Find roofing help near {nearbyMarket.city} for repairs,
                      inspections, replacement, storm damage, and gutters.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedCategories.length > 0 && (
          <section className="section-sm">
            <div className="container">
              <p className="eyebrow">Related services</p>
              <h2>Related home services in {market.city}</h2>
              <div className="grid-3 gap-md">
                {relatedCategories.map((relatedCategory) => (
                  <Link
                    className="card card-hover"
                    href={`${getMarketUrlPath(market)}/${relatedCategory.slug}`}
                    key={relatedCategory.slug}
                  >
                    <h3>{relatedCategory.title}</h3>
                    <p>{relatedCategory.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <p className="eyebrow">FAQ</p>
            <h2>Roofing questions</h2>
            <div className="grid-2 gap-md">
              {faq.map((item) => (
                <div className="card" key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <p className="eyebrow">Get started</p>
              <h2>Request roofing help in {market.city}</h2>
              <p>
                Describe the roof issue, add photos, choose your timing, and
                send one request for local roofing pros to review.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Request roofing help
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}