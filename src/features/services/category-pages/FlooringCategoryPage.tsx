import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketUrlPath, getSeoRelationMarkets } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { flooringSubcategories } from "@/lib/services/subcategories/flooring";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=flooring&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/flooring/${subcategorySlug}`;
}

const popularSearches = [
  "flooring installation near me",
  "flooring contractors near me",
  "flooring repair near me",
  "same day flooring repair",
  "LVP flooring installation near me",
  "laminate flooring installation near me",
  "hardwood floor repair near me",
  "hardwood floor refinishing near me",
  "tile floor installation near me",
  "tile floor repair near me",
  "carpet installation near me",
  "carpet stretching near me",
  "subfloor repair near me",
  "flooring removal service",
  "affordable flooring installers",
  "licensed flooring pros near me",
];

const proHelpItems = [
  "Install LVP, laminate, hardwood, tile, carpet, and other flooring materials",
  "Repair damaged planks, cracked tiles, loose boards, scratches, seams, and transitions",
  "Remove old flooring and prepare the surface for new installation",
  "Check subfloor condition, moisture concerns, soft spots, and uneven areas",
  "Install baseboards, quarter round, shoe molding, and transition strips",
  "Help homeowners compare repair, replacement, and refinishing options",
];

const commonUseCases = [
  "Replacing old carpet with LVP or laminate",
  "Updating rental properties before listing or move-in",
  "Repairing water-damaged flooring or soft subfloor areas",
  "Fixing cracked tile, loose boards, separated LVP planks, or carpet ripples",
  "Installing new floors during a remodel",
  "Refinishing dull, scratched, or worn hardwood floors",
  "Preparing floors before selling a home",
];

const priceFactors = [
  "Flooring material type and installation method",
  "Total square footage and number of rooms",
  "Condition of the existing subfloor",
  "Old flooring removal and disposal needs",
  "Furniture moving, appliance moving, stairs, closets, and tight areas",
  "Baseboards, transitions, underlayment, leveling, and prep work",
  "Urgency, schedule constraints, and material availability",
];

const hireProItems = [
  "The floor is uneven, soft, squeaky, or damaged by moisture",
  "You need a clean finish around doors, stairs, cabinets, and transitions",
  "The project includes tile, hardwood, glue-down flooring, stairs, or subfloor repair",
  "You want the job measured, scoped, and priced clearly before work begins",
  "You need fast completion for move-in, rental turnover, sale prep, or tenant work",
];

const urgentCases = [
  "Active water damage affecting flooring or subfloor",
  "Soft spots that may indicate rot or structural weakness",
  "Loose tile, lifted planks, or trip hazards in walking areas",
  "Floor damage before a move-in, showing, inspection, or rental turnover",
  "Commercial flooring problems that affect customer or employee safety",
];

const requestTips = [
  "Flooring type you have now and flooring type you want installed or repaired",
  "Approximate square footage, room count, and whether stairs are included",
  "Whether materials are already purchased or need to be supplied",
  "Photos of the current floor, transitions, damage, and room layout",
  "Details about old flooring removal, subfloor issues, water damage, or uneven areas",
  "Your preferred timeline and whether the job is urgent or flexible",
];

const faq = [
  {
    question: "How much does flooring installation cost?",
    answer:
      "Flooring cost depends on material type, square footage, removal, prep work, subfloor condition, trim, transitions, and installation method. LVP and laminate are usually more budget-friendly, while tile, hardwood, and complex prep work usually cost more.",
  },
  {
    question: "Can I request same-day flooring repair?",
    answer:
      "Yes. Small repairs like loose transitions, damaged planks, carpet stretching, or cracked tile replacement may be possible quickly if materials are available and the area is accessible.",
  },
  {
    question: "Do I need to buy flooring materials before booking?",
    answer:
      "You can request help either way. Some homeowners already have flooring, trim, and underlayment. Others need a pro to inspect the project and help confirm materials before installation.",
  },
  {
    question: "What flooring is best for rentals or high-traffic homes?",
    answer:
      "LVP and laminate are common for rentals and high-traffic areas because they are durable, easier to clean, and often more cost-effective than hardwood. Tile is common for wet areas.",
  },
  {
    question: "Can pros repair only part of a floor?",
    answer:
      "Often yes. Localized repair may work for damaged planks, cracked tiles, carpet seams, scratches, and small subfloor sections. Matching material availability is usually the biggest factor.",
  },
  {
    question: "Should I repair, refinish, or replace hardwood floors?",
    answer:
      "It depends on the depth of damage, wood thickness, staining, movement, and budget. Refinishing can restore many worn hardwood floors, while replacement may be better for severe water damage or unstable boards.",
  },
  {
    question: "Can flooring pros remove old flooring?",
    answer:
      "Yes. Flooring removal can include carpet, tile, laminate, vinyl, LVP, glue-down flooring, and hardwood tear-out. Disposal, adhesive removal, and subfloor prep should be included in the request scope.",
  },
];

export default function FlooringCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(flooringSubcategories);

  const nearbyMarkets = getSeoRelationMarkets(market.slug).nearbyMarkets;

  const relatedCategorySlugs = [
    "remodeling",
    "painting",
    "handyman",
    "cleaning",
    "plumbing",
    "roofing",
    "appliance-repair-installation",
  ];

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
            <p className="eyebrow">Local flooring pros</p>

            <h1>
              Flooring Services in {market.city}, {market.state}
            </h1>

            <p className="hero-text">
              Find flooring help in {market.city} for LVP, laminate, hardwood,
              tile, carpet, floor repair, flooring removal, subfloor repair,
              trim, and installation projects. Compare local flooring pros and
              send one clear request instead of calling multiple contractors.
            </p>

            <div className="flex gap-sm">
              <Link href={getBookHref(market)} className="button button-primary">
                Request flooring service
              </Link>

              <Link href="#flooring-services" className="button button-secondary">
                Browse flooring services
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Fast request</p>
                <h2>Need flooring help in {market.city}?</h2>
                <p>
                  Describe the floor type, room size, material status, damage,
                  and timeline. Fixly turns the project into a clear request so
                  local pros can understand the scope before responding.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Start request
              </Link>
            </div>
          </div>
        </section>

        <section id="flooring-services" className="section">
          <div className="container">
            <p className="eyebrow">Flooring service hub</p>
            <h2>Flooring services in {market.city}</h2>
            <p>
              Choose the closest flooring service below. Each page is built for
              a specific flooring need, from LVP installation and hardwood
              refinishing to tile repair, carpet stretching, and subfloor work.
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
            <p className="eyebrow">Popular searches</p>
            <h2>Popular flooring searches in {market.city}</h2>

            <div className="service-seo-list">
              {popularSearches.map((phrase) => (
                <span key={phrase}>
                  {phrase.replace("near me", `near ${market.city}`)}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">What pros can help with</p>
                <h2>Flooring work local pros handle</h2>

                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Common use cases</p>
                <h2>Common flooring projects</h2>

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
            <div className="card">
              <p className="eyebrow">Price guidance</p>
              <h2>How flooring pricing usually works</h2>

              <p>
                Flooring prices vary because the visible floor is only one part
                of the job. A small repair may be priced as a flat visit, while
                larger installation projects are usually driven by square
                footage, material type, removal, prep work, trim, and access.
              </p>

              <div className="grid-3">
                <div className="card-flat">
                  <h3>Small flooring jobs</h3>
                  <p>
                    Repairs, transitions, small tile replacement, carpet
                    stretching, minor plank replacement, or inspection visits.
                  </p>
                </div>

                <div className="card-flat">
                  <h3>Medium flooring jobs</h3>
                  <p>
                    One-room LVP, laminate, carpet, tile repair, partial
                    hardwood repair, or flooring removal before installation.
                  </p>
                </div>

                <div className="card-flat">
                  <h3>Larger flooring projects</h3>
                  <p>
                    Whole-home flooring, hardwood refinishing, tile installation,
                    subfloor repair, stairs, multiple rooms, or commercial work.
                  </p>
                </div>
              </div>

              <h3>Common price factors</h3>
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
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">When to hire a pro</p>
                <h2>When flooring should be handled professionally</h2>

                <ul className="service-list">
                  {hireProItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>Flooring issues to handle quickly</h2>

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
              <h2>How to get better flooring quotes</h2>

              <p>
                The more specific the request, the easier it is for flooring
                pros to respond with useful questions, realistic timing, and
                better pricing guidance.
              </p>

              <ul className="service-list">
                {requestTips.map((item) => (
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
              <h2>Flooring services near {market.city}</h2>

              <div className="grid-3">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    href={`${getMarketUrlPath(nearbyMarket)}/flooring`}
                    className="card card-hover"
                  >
                    <h3>
                      Flooring in {nearbyMarket.city}, {nearbyMarket.state}
                    </h3>
                    <p>
                      Find flooring installation, repair, replacement, and
                      subfloor help near {nearbyMarket.city}.
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
        )}

        <section className="section">
          <div className="container-narrow">
            <p className="eyebrow">FAQ</p>
            <h2>Flooring services FAQ</h2>

            <div className="service-list">
              {faq.map((item) => (
                <div key={item.question} className="card">
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
              <div>
                <p className="eyebrow">Get local responses</p>
                <h2>Request flooring service in {market.city}</h2>
                <p>
                  Submit one clear request for flooring installation, repair,
                  replacement, removal, refinishing, trim, or subfloor work.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Request flooring help
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}