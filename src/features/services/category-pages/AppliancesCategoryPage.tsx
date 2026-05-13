import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Category } from "@/lib/services/categories";
import type { Market } from "@/lib/geo";
import { categories, getSubcategoriesByParent } from "@/lib/services";
import { getMarketUrlPath, getSeoRelationMarkets } from "@/lib/geo";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=appliance-repair-installation&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/appliances/${subcategorySlug}`;
}

const popularSearches = [
  "appliance repair near me",
  "same day appliance repair",
  "emergency appliance repair",
  "washer repair near me",
  "dryer repair near me",
  "refrigerator repair near me",
  "dishwasher installation near me",
  "garbage disposal repair near me",
  "microwave installation near me",
  "appliance installation cost",
  "dryer vent cleaning near me",
  "ice maker water line installation",
  "affordable appliance repair",
  "licensed appliance repair pro",
];

const prosCanHelpWith = [
  "Diagnosing appliance problems before replacement is needed",
  "Installing new appliances after delivery",
  "Replacing old appliances safely",
  "Fixing leaks, drain problems, noises, and performance issues",
  "Connecting water lines, drain hoses, vents, and power hookups",
  "Checking whether a repair is practical or replacement makes more sense",
  "Helping homeowners, landlords, rental properties, and small businesses",
];

const commonProblems = [
  "Washer not draining, spinning, or filling correctly",
  "Dryer not heating or taking too long to dry",
  "Refrigerator not cooling or freezer icing up",
  "Dishwasher leaking, not draining, or leaving dishes dirty",
  "Oven, range, stove, or cooktop not heating properly",
  "Garbage disposal humming, leaking, or jammed",
  "Ice maker not filling or refrigerator water line leaking",
  "New appliance delivered but not installed correctly",
];

const priceFactors = [
  "Type of appliance and whether the job is repair or installation",
  "Brand, model, age, and availability of replacement parts",
  "Access to water, drain, gas, vent, or electrical connections",
  "Whether old appliance removal, leveling, or cabinet fit adjustments are needed",
  "Urgency, same-day availability, and local pro scheduling",
  "Whether the job requires plumbing, electrical, or gas-related work",
];

const whenToHirePro = [
  "The appliance leaks, overheats, sparks, smells unusual, or trips a breaker",
  "A refrigerator or freezer stops cooling and food may spoil",
  "A washer, dishwasher, or ice maker has a water leak",
  "A new appliance needs water, drain, vent, or secure mounting connections",
  "You are unsure whether the issue is the appliance, hookup, outlet, or plumbing",
];

const urgentCases = [
  "Refrigerator or freezer stopped cooling",
  "Active water leak from washer, dishwasher, fridge, or ice maker line",
  "Burning smell, overheating, or electrical issue",
  "Gas appliance connection concern",
  "Dryer overheating or strong lint / burning smell",
];

const requestTips = [
  "Appliance type, brand, model number, and approximate age",
  "Whether you need repair, installation, replacement, or troubleshooting",
  "A clear description of what changed and when it started",
  "Photos of the appliance, label, connections, leak area, or error code",
  "Whether the appliance is gas or electric when relevant",
  "How urgent the request is and when the pro can access the property",
];

const appliancesFaq = [
  {
    question: "How much does appliance repair cost?",
    answer:
      "Appliance repair pricing depends on the appliance type, issue, parts, access, brand, age, and urgency. Simple diagnostics or small repairs may be lower, while sealed-system refrigerator issues, control boards, or complex installations can cost more.",
  },
  {
    question: "Can I request same-day appliance repair?",
    answer:
      "Yes, you can submit a same-day request. Availability depends on the appliance issue, local pro schedules, parts, and how clearly the request describes the problem.",
  },
  {
    question: "Should I repair or replace my appliance?",
    answer:
      "A pro can help compare repair cost, appliance age, part availability, and replacement cost. Newer appliances with simple failures are often worth repairing, while older appliances with repeated major issues may be better replaced.",
  },
  {
    question: "Do appliance pros install new appliances?",
    answer:
      "Yes. Pros can help install dishwashers, washers, dryers, refrigerators, microwaves, ranges, garbage disposals, and other major appliances when the proper hookups and space are available.",
  },
  {
    question: "What should I include in an appliance request?",
    answer:
      "Include the appliance type, brand, model, issue, photos, error codes, whether the job is repair or installation, and whether there is leaking, power loss, heating, cooling, or drainage trouble.",
  },
  {
    question: "Are appliance services available for rental properties?",
    answer:
      "Yes. Appliance repair, installation, replacement, maintenance, and troubleshooting are common for landlords, property managers, rental turnovers, and small commercial properties.",
  },
];

export default function AppliancesCategoryPage({ category, market }: Props) {
  const subcategories = getSubcategoriesByParent("appliance-repair-installation");
  const breadcrumbs = getServiceBreadcrumbs({ market, category });
  const nearbyMarkets = getSeoRelationMarkets(market.slug).nearbyMarkets;

  const relatedCategories = Object.values(categories).filter((item) =>
    [
      "plumbing",
      "electrical",
      "handyman",
      "remodeling",
      "cleaning",
      "property-maintenance",
    ].includes(item.slug)
  );

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Appliance Services</p>

            <h1>Appliance Services in {market.city}, {market.state}</h1>

            <p className="hero-text">
              Find local appliance pros in {market.city} for washer and dryer
              repair, refrigerator repair, dishwasher installation, oven and
              stove troubleshooting, garbage disposal replacement, dryer vent
              service, and new appliance hookups. Submit one request and give
              pros the details they need to respond with relevant availability,
              pricing guidance, and next steps.
            </p>

            <div className="flex gap-md">
              <Link href={getBookHref(market)} className="button button-primary">
                Request appliance service
              </Link>

              <Link href="#appliance-services" className="button button-secondary">
                View appliance services
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card service-cta-card">
              <p className="eyebrow">Quick request</p>
              <h2>Need appliance help in {market.city}?</h2>
              <p>
                Describe the appliance, the problem, and how urgent it is. Your
                public request helps local pros understand the job before they
                respond, while private contact details stay protected.
              </p>
              <Link href={getBookHref(market)} className="button button-primary">
                Start appliance request
              </Link>
            </div>
          </div>
        </section>

        <section id="appliance-services" className="section">
          <div className="container">
            <p className="eyebrow">Appliance repair and installation</p>
            <h2>All Appliance Services</h2>
            <p>
              Build a more specific request by choosing the appliance or job
              type. Specific pages help match high-intent searches and give pros
              better context before they open a lead.
            </p>

            <div className="grid-3">
              {subcategories.map((item) => (
                <Link
                  key={item.slug}
                  href={getServiceHref(market, item.slug)}
                  className="card card-hover"
                >
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <p className="eyebrow">High-intent local searches</p>
            <h2>Popular Appliance Searches in {market.city}</h2>

            <div className="service-seo-list">
              {popularSearches.map((phrase) => (
                <span key={phrase} className="badge badge-primary">
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
                <h2>What Appliance Pros Can Help With</h2>
                <ul className="service-list">
                  {prosCanHelpWith.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h2>Common Appliance Problems</h2>
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
              <h2>Appliance Service Cost in {market.city}</h2>
              <p>
                Appliance pricing depends on the appliance, the issue, parts,
                access, urgency, and whether the job is repair, installation,
                replacement, or troubleshooting. Fixly should avoid fake exact
                promises, but the page should still give users useful pricing
                context before they submit a request.
              </p>

              <div className="grid-3">
                <div className="card-flat">
                  <h3>Small jobs</h3>
                  <p>
                    Basic diagnostics, simple hookups, small adjustments, dryer
                    vent hose replacement, or disposal jam troubleshooting.
                  </p>
                </div>

                <div className="card-flat">
                  <h3>Medium jobs</h3>
                  <p>
                    Dishwasher replacement, washer or dryer repair, microwave
                    installation, garbage disposal replacement, or fridge water
                    line repair.
                  </p>
                </div>

                <div className="card-flat">
                  <h3>Larger jobs</h3>
                  <p>
                    Complex refrigerator repair, stacked laundry installation,
                    gas or electric range replacement, multiple appliances, or
                    work requiring another trade.
                  </p>
                </div>
              </div>

              <h3>Price factors</h3>
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
                <h2>When to Hire an Appliance Pro</h2>
                <ul className="service-list">
                  {whenToHirePro.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h2>Urgent or High-Risk Appliance Cases</h2>
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
              <h2>How to Get Better Responses From Appliance Pros</h2>
              <p>
                Appliance requests perform better when the pro can quickly see
                the appliance type, symptoms, access, and urgency. Better inputs
                reduce back-and-forth and help pros decide whether the job is a
                repair, installation, replacement, or diagnostic visit.
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
              <p className="eyebrow">Nearby service areas</p>
              <h2>Appliance Services Near {market.city}</h2>

              <div className="grid-3">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    href={`${getMarketUrlPath(nearbyMarket)}/appliances`}
                    className="card card-hover"
                  >
                    <h3>Appliance services in {nearbyMarket.city}</h3>
                    <p>
                      Repair, installation, troubleshooting, and maintenance
                      help near {nearbyMarket.city}, {nearbyMarket.state}.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section-sm">
          <div className="container">
            <p className="eyebrow">Related categories</p>
            <h2>Related Home Services</h2>

            <div className="grid-3">
              {relatedCategories.map((item) => (
                <Link
                  key={item.slug}
                  href={`${getMarketUrlPath(market)}/${item.slug}`}
                  className="card card-hover"
                >
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">Appliance FAQ</p>
            <h2>Appliance Services FAQ</h2>

            <div className="grid-3">
              {appliancesFaq.map((item) => (
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
              <p className="eyebrow">Get matched locally</p>
              <h2>Request Appliance Service in {market.city}</h2>
              <p>
                Create one clear appliance request and let local pros decide if
                they can help with repair, installation, replacement,
                maintenance, or troubleshooting.
              </p>

              <Link href={getBookHref(market)} className="button button-primary">
                Request appliance service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}