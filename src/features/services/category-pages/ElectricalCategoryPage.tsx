import Link from "next/link";
import type { Category } from "@/lib/services/categories";
import type { Market } from "@/lib/geo";
import { categories, getSubcategoriesByParent } from "@/lib/services";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";

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

function getNearbyHref(city: string) {
  const nearbyMarket = getMarketByCity(city);
  if (!nearbyMarket) return null;
  return `${getMarketUrlPath(nearbyMarket)}/electrical`;
}

const electricalFaq = [
  {
    question: "How much does electrical service cost?",
    answer:
      "Electrical pricing depends on the type of job, access, parts, wiring condition, urgency, and whether licensed electrical work is required.",
  },
  {
    question: "Can I request same-day electrical help?",
    answer:
      "Same-day availability depends on the issue and local pro schedules. Urgent issues like sparking outlets, breaker problems, or power loss should be described clearly.",
  },
  {
    question: "What electrical jobs are most common?",
    answer:
      "Common requests include outlet repair, switch replacement, light fixture installation, ceiling fan installation, breaker issues, wiring repair, safety inspections, and EV charger installation.",
  },
  {
    question: "When should I hire a licensed electrician?",
    answer:
      "Panel work, new circuits, major wiring, code-required work, EV chargers, generators, and safety-related issues usually require a licensed electrician.",
  },
  {
    question: "What should I include in my electrical request?",
    answer:
      "Include the issue, location, photos if safe, whether power is affected, fixture or device type, and how urgent the problem is.",
  },
];

export default function ElectricalCategoryPage({ category, market }: Props) {
  const subcategories = getSubcategoriesByParent("electrical");

  const relatedCategories = Object.values(categories).filter((item) =>
    ["handyman", "plumbing", "appliance-repair", "remodeling", "property-maintenance"].includes(
      item.slug
    )
  );

  return (
    <main className="page">
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Electrical Services</p>

          <h1>
            Electrical Services in {market.city}, {market.state}
          </h1>

          <p className="hero-text">
            Find local electrical pros for outlet repair, switch replacement,
            light fixture installation, ceiling fans, breaker issues, wiring
            repair, inspections, EV chargers, and urgent electrical problems.
          </p>

          <div className="flex gap-md">
            <Link href={getBookHref(market)} className="button button-primary">
              Request electrical help
            </Link>

            <Link href="#electrical-services" className="button button-secondary">
              Browse electrical services
            </Link>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="card service-cta-card">
            <h2>Need an electrician in {market.city}?</h2>

            <p>
              Describe the electrical issue once and get responses from local
              pros based on the scope, urgency, and location.
            </p>

            <Link href={getBookHref(market)} className="button button-primary">
              Start a request
            </Link>
          </div>
        </div>
      </section>

      <section id="electrical-services" className="section">
        <div className="container">
          <h2>All Electrical Services in {market.city}</h2>

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

      <section className="section">
        <div className="container">
          <div className="card">
            <h2>Popular Electrical Searches in {market.city}</h2>

            <div className="service-seo-list">
              <p>electrician near me</p>
              <p>electrical repair in {market.city}</p>
              <p>emergency electrician near me</p>
              <p>outlet repair near me</p>
              <p>light fixture installation</p>
              <p>ceiling fan installation electrician</p>
              <p>breaker keeps tripping</p>
              <p>electrical panel repair</p>
              <p>EV charger installation near me</p>
              <p>same-day electrician in {market.city}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <h2>What an Electrical Pro Can Help With</h2>

            <ul className="service-list">
              <li>Outlet and switch repair or replacement</li>
              <li>Light fixture and chandelier installation</li>
              <li>Ceiling fan installation and replacement</li>
              <li>Breaker, panel, and circuit troubleshooting</li>
              <li>Wiring repair and electrical troubleshooting</li>
              <li>EV charger installation</li>
              <li>Electrical safety inspections</li>
            </ul>
          </div>

          <div className="card">
            <h2>Best for Safety-Critical Problems</h2>

            <p>
              Electrical work should be handled carefully because small issues
              can create safety risks, power problems, or damage to fixtures and
              devices.
            </p>

            <p>
              If you notice burning smells, sparks, flickering lights, hot
              outlets, or breakers that keep tripping, describe the issue clearly
              and request help quickly.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card">
            <h2>Electrical Price Guidance in {market.city}</h2>

            <p>
              Electrical pricing depends on the task, access, parts, fixture
              type, wiring condition, urgency, and whether licensed electrical
              work is required.
            </p>

            <ul className="service-list">
              <li>Small jobs: outlet covers, switches, minor fixture replacements</li>
              <li>Medium jobs: ceiling fans, lighting, troubleshooting, small repairs</li>
              <li>Larger jobs: panels, circuits, EV chargers, generators, wiring work</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid-3">
          <div className="card">
            <h2>When to Call an Electrician</h2>

            <ul className="service-list">
              <li>Outlets, switches, or fixtures stop working.</li>
              <li>Breakers trip repeatedly.</li>
              <li>Lights flicker or dim unexpectedly.</li>
              <li>You need a new fixture, fan, circuit, or charger installed.</li>
            </ul>
          </div>

          <div className="card">
            <h2>Urgent Electrical Issues</h2>

            <ul className="service-list">
              <li>Sparks, smoke, or burning smell</li>
              <li>Hot outlets or buzzing switches</li>
              <li>Partial power loss</li>
              <li>Breaker panel problems</li>
            </ul>
          </div>

          <div className="card">
            <h2>How to Get Better Responses</h2>

            <ul className="service-list">
              <li>Describe what stopped working.</li>
              <li>Mention if power is out in one room or the whole home.</li>
              <li>Add fixture, panel, or outlet photos if safe.</li>
              <li>Include urgency and access details.</li>
            </ul>
          </div>
        </div>
      </section>

      {market.nearby?.length > 0 && (
        <section className="section">
          <div className="container">
            <h2>Electrical Services Near {market.city}</h2>

            <div className="grid-3">
              {market.nearby.map((city) => {
                const href = getNearbyHref(city);
                if (!href) return null;

                return (
                  <Link key={city} href={href} className="card card-hover">
                    <h3>Electrician in {city}</h3>
                    <p>
                      Find local electrical help near {city} for repairs,
                      installations, troubleshooting, and safety issues.
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <h2>Related Home Services</h2>

          <div className="grid-3">
            {relatedCategories.map((item) => (
              <Link
                key={item.slug}
                href={`${getMarketUrlPath(market)}/${item.slug}`}
                className="card card-hover"
              >
                <div className="card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <h2>Electrical Services FAQ</h2>

          <div className="grid-3">
            {electricalFaq.map((item) => (
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
            <h2>Get Electrical Help in {market.city}</h2>

            <p>
              Post your request and connect with local pros for electrical
              repair, installation, troubleshooting, and safety-related work.
            </p>

            <Link href={getBookHref(market)} className="button button-primary">
              Request electrical service
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}