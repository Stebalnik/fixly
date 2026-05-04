import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { garageSubcategories } from "@/lib/services/subcategories/garage";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=garage&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/garage/${subcategorySlug}`;
}

const popularSearches = [
  "garage door repair near me",
  "garage door repair in {city}",
  "same day garage door repair {city}",
  "emergency garage door repair {city}",
  "garage door spring replacement {city}",
  "garage door opener repair near me",
  "garage door opener installation {city}",
  "garage door installation cost {city}",
  "garage door replacement price {city}",
  "garage door cable replacement near me",
  "garage door off track repair {city}",
  "garage door sensor alignment {city}",
  "affordable garage door repair {city}",
  "licensed garage door pro {city}",
  "residential garage door service {city}",
  "commercial garage door service {city}",
];

const proHelpItems = [
  "Diagnose garage doors that are stuck, noisy, crooked, shaking, or not closing correctly.",
  "Repair or replace springs, cables, rollers, tracks, hinges, sensors, and opener parts.",
  "Install new garage doors, replacement doors, openers, smart controls, and battery backup systems.",
  "Improve garage storage with shelving, cabinets, overhead racks, and safer organization systems.",
  "Check safety issues before a door becomes dangerous, damages a vehicle, or leaves the home exposed.",
];

const commonUseCases = [
  "The garage door is stuck open and the home cannot be secured.",
  "The garage door is stuck closed and a vehicle cannot get out.",
  "A spring snapped and the door feels too heavy to lift.",
  "The opener runs but the door does not move.",
  "The door reverses because sensors are misaligned or blocked.",
  "A vehicle hit the door and damaged one or more panels.",
  "The door came off track or moves unevenly.",
  "The garage needs better storage, shelving, cabinets, or overhead racks.",
];

const priceFactors = [
  "Type of service: repair, installation, replacement, adjustment, inspection, or storage upgrade.",
  "Door size, door weight, material, insulation, and whether the garage is single-car or double-car.",
  "Parts needed, including springs, cables, rollers, sensors, tracks, panels, remotes, or opener components.",
  "Urgency, same-day scheduling, after-hours requests, and whether the door is stuck open or closed.",
  "Access, ceiling height, wall condition, electrical outlet location, and whether old materials must be removed.",
];

const hireProSituations = [
  "The door is heavy, crooked, stuck, off track, or unsafe to lift manually.",
  "A spring, cable, track, or roller appears damaged.",
  "The opener, sensors, wall button, or remote behaves inconsistently.",
  "You need a new garage door, opener, overhead rack, cabinet system, or mounted storage installed securely.",
  "You want a local pro to inspect the issue before replacing parts unnecessarily.",
];

const urgentCases = [
  "Garage door stuck open, leaving the home, tools, vehicles, or stored items exposed.",
  "Broken spring or snapped cable, especially if the door is heavy or uneven.",
  "Door off track, leaning, hanging, or visibly unstable.",
  "Door stuck closed when a car is trapped inside.",
  "Opener or sensor failure that prevents the door from closing safely.",
];

const betterResponseTips = [
  "Mention whether the door is stuck open, stuck closed, moving unevenly, or not moving at all.",
  "Include the door size if known, such as single-car, double-car, tall door, or commercial-style door.",
  "Describe visible damage to springs, cables, rollers, panels, tracks, sensors, or the opener.",
  "Share the opener brand and whether remotes, wall controls, sensors, or keypads are working.",
  "Add photos if possible, especially for damaged panels, broken springs, cable issues, or storage installation areas.",
];

const faq = [
  {
    question: "How much does garage door repair cost?",
    answer:
      "Garage door repair cost depends on the part, door size, door weight, urgency, access, and whether the issue is a simple adjustment or a safety-related repair. Spring, cable, panel, opener, and track repairs can vary significantly.",
  },
  {
    question: "Can I get same-day garage door repair?",
    answer:
      "Same-day garage door repair may be available when local pros have openings. For urgent cases, include whether the door is stuck open, stuck closed, off track, or unsafe to move.",
  },
  {
    question: "Should I repair or replace my garage door?",
    answer:
      "Repair may be enough for isolated parts like rollers, cables, sensors, openers, or one damaged panel. Replacement may make more sense when the door is badly damaged, repeatedly failing, unsafe, poorly insulated, or outdated.",
  },
  {
    question: "Is a broken garage door spring dangerous?",
    answer:
      "Yes. Garage door springs carry high tension and a broken spring can make the door extremely heavy or unstable. It is better to avoid forcing the door and request professional help.",
  },
  {
    question: "Can a pro install a garage door opener I already bought?",
    answer:
      "Yes, many pros can install homeowner-purchased openers if the model is compatible with the door and the garage has proper mounting space and power access.",
  },
  {
    question: "Do garage pros also install shelves and overhead storage?",
    answer:
      "Yes, garage service requests can include shelving, cabinets, ceiling-mounted racks, hooks, and storage systems. Include wall type, ceiling height, rack size, and expected weight when submitting the request.",
  },
  {
    question: "Can Fixly help with commercial garage doors?",
    answer:
      "Fixly can route commercial garage requests when the scope is described clearly. Mention the business type, door size, access needs, safety concerns, and whether the issue affects operations.",
  },
];

export default function GarageCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(garageSubcategories);

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((nearbyMarket): nearbyMarket is Market => Boolean(nearbyMarket));

  const relatedCategorySlugs = [
  "handyman",
  "electrical",
  "flooring",
  "property-maintenance",
];

const relatedCategories = relatedCategorySlugs
  .map((slug) => getCategoryBySlug(slug))
  .filter((relatedCategory): relatedCategory is Category =>
    Boolean(relatedCategory)
  );

  return (
    <PublicPageShell market={market}>
      <main className="page">
        <section className="section-sm">
          <div className="container">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </section>

        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Garage services</p>

            <h1>
              Garage Services in {market.city}, {market.state}
            </h1>

            <p className="hero-text">
              Find local garage pros for garage door repair, garage door opener
              repair, spring replacement, cable replacement, door installation,
              garage storage, shelving, cabinets, overhead racks, and urgent
              garage door issues in {market.city}.
            </p>

            <div className="flex gap-sm">
              <Link href={getBookHref(market)} className="button button-primary">
                Request garage service
              </Link>

              <a href="#garage-services" className="button button-secondary">
                Browse garage services
              </a>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Quick request</p>
                <h2>Need garage help in {market.city}?</h2>
                <p>
                  Describe the problem, door condition, opener behavior,
                  urgency, and photos if available. Fixly turns the request into
                  a clear local job so garage pros can respond with relevant
                  next steps.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Start request
              </Link>
            </div>
          </div>
        </section>

        <section id="garage-services" className="section">
          <div className="container">
            <p className="eyebrow">All garage services</p>
            <h2>Garage repair, installation, and storage services</h2>
            <p>
              Garage requests often start with one issue, but the right pro may
              need to check the door, opener, springs, cables, tracks, sensors,
              and storage layout together. Choose the closest service below.
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
                  <span className="badge badge-primary">
                    From ${subcategory.priceMin}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <p className="eyebrow">Popular searches</p>
            <h2>High-intent garage searches in {market.city}</h2>

            <ul className="service-seo-list">
              {popularSearches.map((phrase) => (
                <li key={phrase}>{phrase.replace("{city}", market.city)}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">What pros can help with</p>
                <h2>Garage pros handle repair, replacement, and setup</h2>

                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Common problems</p>
                <h2>Garage issues homeowners request most</h2>

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
              <h2>Garage service cost guidance in {market.city}</h2>

              <p>
                Garage pricing depends on parts, door size, urgency, access,
                safety risk, and whether the job is a repair, replacement,
                installation, or storage upgrade.
              </p>

              <div className="grid-3">
                <div className="card-flat">
                  <h3>Small jobs</h3>
                  <p>
                    Sensor alignment, remote troubleshooting, small adjustments,
                    minor opener issues, and simple shelf installation.
                  </p>
                </div>

                <div className="card-flat">
                  <h3>Medium jobs</h3>
                  <p>
                    Spring replacement, cable replacement, opener installation,
                    track repair, roller repair, and panel replacement.
                  </p>
                </div>

                <div className="card-flat">
                  <h3>Larger jobs</h3>
                  <p>
                    Full garage door replacement, new door installation,
                    insulated door upgrades, cabinet systems, and large overhead
                    storage installs.
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
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">When to hire a pro</p>
                <h2>Do not force a damaged garage door</h2>

                <ul className="service-list">
                  {hireProSituations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>High-risk garage door problems</h2>

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
              <h2>How to get better garage pro responses</h2>

              <ul className="service-list">
                {betterResponseTips.map((item) => (
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
              <h2>Garage services near {market.city}</h2>

              <div className="grid-3">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    href={`${getMarketUrlPath(nearbyMarket)}/garage`}
                    className="card card-hover"
                  >
                    <h3>
                      Garage services in {nearbyMarket.city},{" "}
                      {nearbyMarket.state}
                    </h3>
                    <p>
                      Find garage door repair, opener installation, spring
                      replacement, and storage installation near{" "}
                      {nearbyMarket.city}.
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
              <p className="eyebrow">Related categories</p>
              <h2>Other services often requested with garage work</h2>

              <div className="grid-3">
                {relatedCategories.map((relatedCategory) => (
                  <Link
                    key={relatedCategory.slug}
                    href={`${getMarketUrlPath(market)}/${relatedCategory.slug}`}
                    className="card card-hover"
                  >
                    <h3>{relatedCategory.title}</h3>
                    {relatedCategory.description && (
                      <p>{relatedCategory.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <p className="eyebrow">FAQ</p>
            <h2>Garage service questions</h2>

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

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Get matched</p>
                <h2>Request garage service in {market.city}</h2>
                <p>
                  Submit one clear request for garage door repair, opener
                  service, spring replacement, installation, or garage storage.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Request garage service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}