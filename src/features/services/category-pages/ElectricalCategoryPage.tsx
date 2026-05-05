import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { electricalSubcategories } from "@/lib/services/subcategories/electrical";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=electrical&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/electrical/${subcategorySlug}`;
}

const popularSearches = [
  "electrician near me",
  "electrical repair near me",
  "same day electrician",
  "emergency electrician",
  "electrical troubleshooting",
  "outlet repair near me",
  "breaker panel repair",
  "EV charger installation near me",
  "light fixture installation",
  "ceiling fan installation electrician",
  "GFCI outlet installation",
  "electrical safety inspection",
  "licensed electrician",
  "affordable electrician",
  "residential electrical services",
  "commercial electrical maintenance",
];

const proHelpItems = [
  "Troubleshoot dead outlets, flickering lights, partial power loss, and tripping breakers.",
  "Install outlets, switches, dimmers, fixtures, ceiling fans, GFCI devices, and dedicated circuits.",
  "Inspect electrical panels, wiring, smoke detectors, surge protection, and safety concerns.",
  "Prepare wiring for EV chargers, appliances, home offices, garages, remodels, and backup power.",
  "Handle urgent electrical issues where safety, heat, burning smells, or repeated breaker trips are involved.",
];

const commonUseCases = [
  "A breaker keeps tripping after using an appliance or tool.",
  "A room, outlet, switch, fixture, or exterior light stopped working.",
  "You are replacing old fixtures, upgrading lighting, or adding dimmers.",
  "You need a new circuit for an EV charger, appliance, garage, office, or remodel.",
  "An inspection, insurance request, buyer report, or landlord correction requires electrical work.",
  "You smell burning, see sparks, notice warm outlets, or hear buzzing near a panel.",
];

const priceFactors = [
  "Type of electrical work and whether troubleshooting is required",
  "Number of devices, fixtures, outlets, circuits, or rooms involved",
  "Panel condition, available capacity, and distance from the panel",
  "Wall, attic, crawlspace, ceiling, or exterior access",
  "Fixture weight, ceiling height, wiring condition, and mounting requirements",
  "Permit, inspection, urgency, after-hours timing, and commercial access needs",
];

const betterResponseTips = [
  "Describe the issue clearly, including when it started and what stopped working.",
  "Add photos of the panel, breaker labels, outlet, fixture, switch, charger, or affected area.",
  "Mention whether the breaker trips, lights flicker, outlets feel warm, or there is any smell or sound.",
  "Include the property type, ceiling height, panel location, and whether parts or fixtures are already purchased.",
  "For EV chargers or dedicated circuits, include charger model, equipment specs, and distance from the panel.",
];

const faq = [
  {
    question: "How much do electrical services cost?",
    answer:
      "Electrical pricing depends on the job type, troubleshooting time, parts, access, panel condition, and urgency. Small outlet or switch jobs may be simple, while new circuits, panel work, EV chargers, or wiring repairs usually cost more.",
  },
  {
    question: "Can I get same-day electrical help?",
    answer:
      "Many electrical requests can be handled the same day depending on pro availability, job complexity, parts, and safety level. Urgent issues should include photos and a clear description so pros can respond faster.",
  },
  {
    question: "When is an electrical issue urgent?",
    answer:
      "Burning smells, sparks, buzzing panels, warm outlets, repeated breaker trips, partial power loss, or exposed wiring should be treated as high priority. If there is immediate danger, shut off the affected circuit if safe and contact emergency help.",
  },
  {
    question: "Do I need a licensed electrician?",
    answer:
      "For electrical repairs, panel work, new circuits, EV chargers, safety inspections, and wiring changes, a licensed electrician is usually the right choice. Simple fixture replacement may still require a qualified pro when wiring or mounting is uncertain.",
  },
  {
    question: "Can Fixly help with both residential and commercial electrical work?",
    answer:
      "Yes. Fixly can route requests for homes, rentals, offices, retail spaces, small businesses, restaurants, and light commercial properties depending on local pro availability.",
  },
  {
    question: "What should I include in my electrical request?",
    answer:
      "Include what is not working, how long it has been happening, whether breakers trip, photos of the affected area and panel, property type, urgency, and any parts or fixtures already purchased.",
  },
];

export default function ElectricalCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(electricalSubcategories);

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((nearbyMarket): nearbyMarket is Market => Boolean(nearbyMarket));

  const relatedCategories = ["handyman", "plumbing", "appliances", "remodeling"]
    .map((slug) => getCategoryBySlug(slug))
    .filter((relatedCategory): relatedCategory is Category => Boolean(relatedCategory));

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="service-hero">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">Electrical services</p>
                <h1>Electrical Services in {market.city}, {market.state}</h1>
                <p className="hero-text">
                  Find local electrical pros for outlet repairs, lighting upgrades, breaker
                  issues, wiring troubleshooting, EV charger installation, safety inspections,
                  smoke detectors, dedicated circuits, and urgent electrical problems in{" "}
                  {market.city}.
                </p>
                <div className="flex gap-sm">
                  <Link className="button button-primary" href={getBookHref(market)}>
                    Request electrical help
                  </Link>
                  <a className="button button-secondary" href="#electrical-services">
                    View services
                  </a>
                </div>
              </div>

              <div className="card">
                <p className="badge badge-primary">Local electrical request</p>
                <h2>Need electrical help in {market.city}?</h2>
                <p>
                  Tell Fixly what is happening, add photos, and submit one clear request.
                  Local pros can review the issue and respond with availability, next steps,
                  and price guidance.
                </p>
                <Link className="button button-primary" href={getBookHref(market)}>
                  Start a request
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="electrical-services" className="section">
          <div className="container">
            <p className="eyebrow">All electrical services</p>
            <h2>Electrical repair, installation, inspection, and troubleshooting</h2>
            <p>
              Use this electrical hub to route high-intent requests into the right service page.
              Each service page is built for local search, clear scope, price factors, and
              conversion into a request.
            </p>

            <div className="grid-3 gap-md">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  className="card card-hover"
                  href={getServiceHref(market, subcategory.slug)}
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
              <h2>Common electrical searches in {market.city}</h2>
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
                <h2>Practical electrical work</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Common problems</p>
                <h2>Electrical use cases</h2>
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
              <h2>What affects electrical service cost?</h2>
              <p>
                Electrical cost depends on safety, access, troubleshooting time, materials,
                panel condition, and whether new wiring or permits are required. Fixly should
                avoid fake exact pricing and instead help users describe the job clearly so
                pros can price it faster.
              </p>

              <div className="grid-3 gap-md">
                <div className="card-flat">
                  <h3>Small jobs</h3>
                  <p>
                    Outlet replacement, switch repair, basic fixture replacement, detector
                    replacement, or simple troubleshooting.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Medium jobs</h3>
                  <p>
                    Multiple fixtures, ceiling fans, GFCI upgrades, wiring diagnosis, breaker
                    repairs, or room-level lighting improvements.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Larger jobs</h3>
                  <p>
                    Dedicated circuits, EV chargers, transfer switches, panel-related work,
                    commercial maintenance, or complex wiring repairs.
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
                <h2>Do not guess with electrical issues</h2>
                <p>
                  Hire an electrical pro when the issue involves wiring, breaker panels,
                  repeated tripping, heat, sparks, burning smells, new circuits, exterior
                  power, EV charging, inspection corrections, or anything behind a wall or
                  inside a panel.
                </p>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>High-risk electrical warning signs</h2>
                <p>
                  Burning smells, buzzing panels, sparks, warm outlets, exposed wiring,
                  repeated breaker trips, or partial power loss should be treated seriously.
                  If there is immediate danger, turn off the affected circuit if safe and
                  contact emergency help.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">Better requests</p>
              <h2>How to get better responses from electrical pros</h2>
              <ul className="service-list">
                {betterResponseTips.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="button button-primary" href={getBookHref(market)}>
                Create an electrical request
              </Link>
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 ? (
          <section className="section">
            <div className="container">
              <p className="eyebrow">Nearby cities</p>
              <h2>Electrical services near {market.city}</h2>
              <div className="grid-3 gap-md">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/electrical`}
                  >
                    <h3>
                      Electrical services in {nearbyMarket.city}, {nearbyMarket.state}
                    </h3>
                    <p>
                      Find local electrical repair, installation, inspection, and
                      troubleshooting help near {nearbyMarket.city}.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="section-sm">
          <div className="container">
            <p className="eyebrow">Related categories</p>
            <h2>Related home service categories</h2>
            <div className="grid-4 gap-md">
              {relatedCategories.map((relatedCategory) => (
                <Link
                  key={relatedCategory.slug}
                  className="card card-hover"
                  href={`${getMarketUrlPath(market)}/${relatedCategory.slug}`}
                >
                  <h3>{relatedCategory.title}</h3>
                  {relatedCategory.description ? (
                    <p>{relatedCategory.description}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container-narrow">
            <p className="eyebrow">FAQ</p>
            <h2>Electrical services FAQ</h2>
            <div className="service-list">
              {faq.map((item) => (
                <div key={item.question} className="card-flat">
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
              <p className="eyebrow">Get matched</p>
              <h2>Need an electrician in {market.city}?</h2>
              <p>
                Submit one request with the electrical issue, photos, timing, and location.
                Fixly turns the problem into a clear local lead for available pros.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Request electrical service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}