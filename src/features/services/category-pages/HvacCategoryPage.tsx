import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { hvacSubcategories } from "@/lib/services/subcategories/hvac";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=hvac&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/hvac/${subcategorySlug}`;
}

const popularSearches = [
  "HVAC repair near me",
  "AC repair near me",
  "same day HVAC repair",
  "emergency HVAC repair",
  "HVAC cost estimate",
  "air conditioning repair cost",
  "furnace repair near me",
  "heat pump repair near me",
  "mini split installation near me",
  "HVAC maintenance near me",
  "thermostat installation near me",
  "ductwork repair near me",
  "licensed HVAC contractor",
  "affordable HVAC service",
  "best HVAC company near me",
  "commercial HVAC service",
];

const proHelpItems = [
  "Diagnose heating and cooling problems",
  "Repair central AC systems, furnaces, heat pumps, and ductless units",
  "Replace old or inefficient HVAC systems",
  "Install thermostats and smart controls",
  "Improve airflow, duct performance, and comfort by room",
  "Perform seasonal maintenance and tune-ups",
  "Inspect HVAC systems before buying or selling a home",
  "Handle urgent no-heat and no-cooling situations",
];

const commonUseCases = [
  "AC blows warm air or cannot keep up",
  "Furnace turns on but does not heat properly",
  "System runs constantly or short cycles",
  "One room is much hotter or colder than the rest",
  "Thermostat does not match the actual temperature",
  "Outdoor unit is noisy, frozen, or not running",
  "Utility bills increased without a clear reason",
  "Home needs a new HVAC system, mini split, or ductwork upgrade",
];

const priceFactors = [
  "Type of system and whether it is gas, electric, heat pump, ductless, or commercial",
  "Whether the job is repair, replacement, inspection, maintenance, or new installation",
  "Parts, refrigerant, controls, motors, boards, coils, or ductwork needed",
  "System age, accessibility, attic or crawlspace access, and equipment location",
  "Urgency, after-hours timing, weather conditions, and same-day availability",
  "Home size, number of zones, number of units, and comfort issues by room",
];

const hireProSituations = [
  "Your system does not turn on or keeps tripping a breaker",
  "AC is blowing warm air during hot weather",
  "Furnace is not heating or has ignition issues",
  "You notice burning smells, unusual noises, leaking water, or frozen lines",
  "Rooms are uneven even after changing filters",
  "You are replacing major equipment or adding a mini split",
];

const urgentCases = [
  "No cooling during extreme heat",
  "No heat during cold weather",
  "Burning smell or repeated breaker trips",
  "Water leaking near HVAC equipment",
  "Gas smell near furnace equipment",
  "System failure affecting children, elderly people, pets, or a business operation",
];

const betterResponseTips = [
  "Include the system type: central AC, furnace, heat pump, mini split, rooftop unit, or unknown",
  "Describe what changed: no air, warm air, no heat, noise, leaking, short cycling, or error code",
  "Add the system age and last maintenance date if known",
  "Mention whether the issue affects one room, one floor, or the whole property",
  "Upload photos of the thermostat, indoor unit, outdoor unit, model label, or error code",
  "State whether this is urgent, same-day, flexible, residential, or commercial",
];

const faq = [
  {
    question: "How much does HVAC service cost?",
    answer:
      "HVAC cost depends on the system type, issue, parts, urgency, access, and whether the job is repair, inspection, maintenance, or replacement. Small diagnostics and tune-ups usually cost less than major part replacement or full system installation.",
  },
  {
    question: "Can I request same-day HVAC service?",
    answer:
      "Yes. Same-day availability depends on local pros, schedule, weather, parts, and the urgency of the issue. No heat, no cooling, water leaks, electrical symptoms, and business downtime should be described clearly in the request.",
  },
  {
    question: "Should I repair or replace my HVAC system?",
    answer:
      "Repair may make sense for newer systems with isolated issues. Replacement may be better when the system is old, inefficient, frequently breaking, undersized, or using expensive parts. A diagnostic visit can help compare both options.",
  },
  {
    question: "Do HVAC pros handle both heating and cooling?",
    answer:
      "Many HVAC pros service both heating and cooling systems, including AC units, furnaces, heat pumps, mini splits, thermostats, ductwork, and indoor air quality equipment.",
  },
  {
    question: "What should I include in my HVAC request?",
    answer:
      "Include the system type, main symptoms, property type, system age, urgency, photos, error codes, and whether the issue affects the whole property or specific rooms.",
  },
  {
    question: "Can HVAC service help with high energy bills?",
    answer:
      "Yes. High energy bills can come from dirty coils, old equipment, leaking ductwork, incorrect thermostat settings, airflow restrictions, low refrigerant, or an inefficient system.",
  },
];

const relatedCategorySlugs = [
  "plumbing",
  "electrical",
  "appliance-repair-installation",
  "cleaning",
];

export default function HvacCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(hvacSubcategories);

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
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Local HVAC pros</p>
              <h1>HVAC Services in {market.city}, {market.state}</h1>
              <p className="hero-text">
                Find local HVAC help for AC repair, furnace repair, system
                replacement, heat pumps, mini splits, ductwork, thermostats,
                maintenance, inspections, emergency HVAC issues, and commercial
                heating and cooling service in {market.city}.
              </p>
              <div className="flex gap-sm">
                <Link className="button button-primary" href={getBookHref(market)}>
                  Request HVAC service
                </Link>
                <a className="button button-secondary" href="#hvac-services">
                  View HVAC services
                </a>
              </div>
            </div>

            <div className="card">
              <p className="eyebrow">Fast request flow</p>
              <h2>Need HVAC help in {market.city}?</h2>
              <p>
                Tell Fixly what is happening, where the property is located,
                how urgent it is, and what type of system you have. Your request
                can be matched to HVAC pros who handle the right type of heating
                or cooling work.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Start a request
              </Link>
            </div>
          </div>
        </section>

        <section id="hvac-services" className="section">
          <div className="container">
            <p className="eyebrow">All HVAC services</p>
            <h2>HVAC repair, installation, maintenance, and diagnostics</h2>
            <div className="grid-3 gap-md">
              {subcategories.map((subcategory) => (
                <Link
                  className="card card-hover"
                  href={getServiceHref(market, subcategory.slug)}
                  key={subcategory.slug}
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
              <h2>High-intent HVAC searches in {market.city}</h2>
              <ul className="service-seo-list">
                {popularSearches.map((phrase) => (
                  <li key={phrase}>
                    {phrase.includes("near me")
                      ? phrase.replace("near me", `in ${market.city}`)
                      : `${phrase} in ${market.city}`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2 gap-lg">
            <div className="card">
              <p className="eyebrow">What pros can help with</p>
              <h2>Common HVAC work</h2>
              <ul className="service-list">
                {proHelpItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <p className="eyebrow">Use cases</p>
              <h2>Common heating and cooling problems</h2>
              <ul className="service-list">
                {commonUseCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">Price guidance</p>
              <h2>How HVAC pricing usually works</h2>
              <p>
                HVAC pricing depends on the system, access, parts, urgency, and
                whether the job is a diagnostic visit, repair, maintenance,
                replacement, or new installation. A small thermostat or tune-up
                job is very different from replacing a central AC system,
                furnace, heat pump, ductwork, or rooftop commercial unit.
              </p>

              <div className="grid-3 gap-md">
                <div className="card-flat">
                  <h3>Small jobs</h3>
                  <p>
                    Diagnostics, thermostat replacement, seasonal tune-ups,
                    filter checks, basic troubleshooting, or minor repair items.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Medium jobs</h3>
                  <p>
                    Part replacement, refrigerant-related service, blower or
                    motor issues, duct repair, airflow correction, or heat pump
                    troubleshooting.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Larger jobs</h3>
                  <p>
                    Full AC replacement, furnace replacement, mini split
                    installation, major ductwork, multi-zone systems, or
                    commercial HVAC service.
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
          <div className="container grid-2 gap-lg">
            <div className="card">
              <p className="eyebrow">When to hire a pro</p>
              <h2>Do not wait when comfort, safety, or equipment risk is high</h2>
              <ul className="service-list">
                {hireProSituations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <p className="eyebrow">Urgent cases</p>
              <h2>High-risk HVAC situations</h2>
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
              <p className="eyebrow">Better responses</p>
              <h2>How to get better HVAC quotes</h2>
              <ul className="service-list">
                {betterResponseTips.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 ? (
          <section className="section">
            <div className="container">
              <p className="eyebrow">Nearby cities</p>
              <h2>HVAC services near {market.city}</h2>
              <div className="grid-3 gap-md">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/hvac`}
                    key={nearbyMarket.slug}
                  >
                    <h3>
                      HVAC services in {nearbyMarket.city}, {nearbyMarket.state}
                    </h3>
                    <p>
                      Find HVAC repair, maintenance, installation, and emergency
                      heating and cooling help near {nearbyMarket.city}.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="section-sm">
          <div className="container">
            <p className="eyebrow">Related services</p>
            <h2>Other home services near {market.city}</h2>
            <div className="grid-4 gap-md">
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

        <section className="section">
          <div className="container-narrow">
            <p className="eyebrow">FAQ</p>
            <h2>HVAC service questions</h2>
            <div className="grid-1 gap-md">
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
              <p className="eyebrow">Request HVAC service</p>
              <h2>Get HVAC help in {market.city}</h2>
              <p>
                Describe the system, the symptoms, the urgency, and your
                location. Fixly turns that into a clear request that local HVAC
                pros can understand quickly.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Book HVAC service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}