import Link from "next/link";
import type { Category } from "@/lib/services/categories";
import type { Market } from "@/lib/geo";
import {
  categories,
  getSubcategoriesByParent,
} from "@/lib/services";
import {
  getMarketByCity,
  getMarketUrlPath,
} from "@/lib/geo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=handyman&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/handyman/${subcategorySlug}`;
}

function getNearbyHref(city: string) {
  const nearbyMarket = getMarketByCity(city);

  if (!nearbyMarket) return null;

  return `${getMarketUrlPath(nearbyMarket)}/handyman`;
}

const handymanFaq = [
  {
    question: "How much does a handyman cost?",
    answer:
      "Most handyman jobs depend on time, scope, materials, access, and urgency. Small tasks may be simple, while larger repairs or installations can require more time and tools.",
  },
  {
    question: "Can I hire a handyman for multiple small tasks?",
    answer:
      "Yes. Combining several small tasks into one request is often the best way to make a handyman visit more efficient.",
  },
  {
    question: "What handyman jobs are most common?",
    answer:
      "Common requests include furniture assembly, drywall patching, door and window fixes, painting touch-ups, TV mounting, shelf installation, and general home maintenance.",
  },
  {
    question: "Can I request same-day handyman help?",
    answer:
      "Same-day availability depends on the location, the task, and local pro schedules. For urgent work, describe the issue clearly when submitting the request.",
  },
  {
    question: "When should I hire a licensed specialist instead?",
    answer:
      "Major plumbing, electrical, structural, roofing, gas, or permit-related work may require a licensed specialist instead of a general handyman.",
  },
];

export default function HandymanCategoryPage({ category, market }: Props) {
  const subcategories = getSubcategoriesByParent("handyman");

  const relatedCategories = Object.values(categories).filter((item) =>
    ["plumbing", "electrical", "painting", "cleaning", "remodeling"].includes(
      item.slug
    )
  );

  return (
    <main className="page">
      {/* 1. Hero */}
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Handyman Services</p>

          <h1>
            Handyman Services in {market.city}, {market.state}
          </h1>

          <p className="hero-text">
            Find local handyman pros for furniture assembly, drywall repair,
            door and window fixes, painting touch-ups, TV mounting, shelf
            installation, small home fixes, and general maintenance.
          </p>

          <div className="flex gap-md">
            <Link href={getBookHref(market)} className="button button-primary">
              Request handyman help
            </Link>

            <Link href="#handyman-services" className="button button-secondary">
              Browse handyman services
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Quick request */}
      <section className="section-sm">
        <div className="container">
          <div className="card service-cta-card">
            <h2>Need a handyman in {market.city}?</h2>

            <p>
              Describe the task once and let local pros respond based on the
              scope, location, and timing.
            </p>

            <Link href={getBookHref(market)} className="button button-primary">
              Start a request
            </Link>
          </div>
        </div>
      </section>

      {/* 3. All services */}
      <section id="handyman-services" className="section">
        <div className="container">
          <h2>All Handyman Services in {market.city}</h2>

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

      {/* 4. Popular searches */}
      <section className="section">
        <div className="container">
          <div className="card">
            <h2>Popular Handyman Searches in {market.city}</h2>

            <div className="service-seo-list">
              <p>handyman near me</p>
              <p>handyman services in {market.city}, {market.state}</p>
              <p>same-day handyman in {market.city}</p>
              <p>affordable handyman near me</p>
              <p>small home repairs near me</p>
              <p>furniture assembly handyman</p>
              <p>drywall repair handyman</p>
              <p>TV mounting handyman</p>
              <p>door repair handyman</p>
              <p>general home maintenance services</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. What handyman can help with */}
      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <h2>What a Handyman Can Help With</h2>

            <ul className="service-list">
              <li>Furniture assembly and setup</li>
              <li>Drywall repair and patching</li>
              <li>Door and window adjustments</li>
              <li>Painting touch-ups for walls, trim, and doors</li>
              <li>TV mounting and shelf installation</li>
              <li>Minor fixture-level plumbing and electrical fixes</li>
              <li>General home maintenance and seasonal upkeep</li>
            </ul>
          </div>

          <div className="card">
            <h2>Best for Small Home Projects</h2>

            <p>
              A handyman is often the right choice when the job is too small
              for a full contractor but still needs proper tools, experience,
              and careful installation.
            </p>

            <p>
              This includes small repairs, mounting, adjustments, touch-ups,
              assembly, and maintenance tasks around the home.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Price guidance */}
      <section className="section">
        <div className="container">
          <div className="card">
            <h2>Handyman Price Guidance in {market.city}</h2>

            <p>
              Handyman pricing depends on the type of task, number of items,
              materials, tools, access, and urgency. Small tasks usually cost
              less than multi-step repairs or larger installation projects.
            </p>

            <ul className="service-list">
              <li>Small fixes: simple repairs, tightening, touch-ups, or adjustments</li>
              <li>Medium jobs: furniture assembly, TV mounting, drywall patching</li>
              <li>Larger handyman visits: multiple tasks, repairs, or maintenance lists</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. When to hire a pro */}
      <section className="section">
        <div className="container grid-3">
          <div className="card">
            <h2>When to Hire a Handyman</h2>

            <ul className="service-list">
              <li>You have several small tasks that keep getting delayed.</li>
              <li>You need tools, measuring, mounting, patching, or adjustment work.</li>
              <li>You want the job done cleanly and faster than DIY.</li>
              <li>You are preparing a home for guests, rent, sale, or move-in.</li>
            </ul>
          </div>

          <div className="card">
            <h2>When Not to Use a Handyman</h2>

            <ul className="service-list">
              <li>Major electrical wiring or panel work</li>
              <li>Major plumbing or gas work</li>
              <li>Structural repairs</li>
              <li>Permit-heavy remodeling</li>
            </ul>
          </div>

          <div className="card">
            <h2>How to Get Better Responses</h2>

            <ul className="service-list">
              <li>Describe each task clearly.</li>
              <li>Mention materials you already have.</li>
              <li>Add timing and urgency.</li>
              <li>Include city and access details.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. Nearby cities */}
      {market.nearby.length > 0 && (
        <section className="section">
          <div className="container">
            <h2>Handyman Services Near {market.city}</h2>

            <div className="grid-3">
              {market.nearby.map((city) => {
                const href = getNearbyHref(city);

                if (!href) return null;

                return (
                  <Link key={city} href={href} className="card card-hover">
                    <h3>Handyman in {city}</h3>
                    <p>
                      Find local handyman help near {city} for repairs,
                      installations, assembly, and maintenance.
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 9. Related categories */}
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

      {/* 10. FAQ */}
      <section className="section-sm">
        <div className="container">
          <h2>Handyman Services FAQ</h2>

          <div className="grid-3">
            {handymanFaq.map((item) => (
              <div key={item.question} className="card">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Final CTA */}
      <section className="section">
        <div className="container flex-center">
          <div className="card service-cta-card">
            <h2>Get Handyman Help in {market.city}</h2>

            <p>
              Post your request and connect with local pros for small repairs,
              installations, assembly, and home maintenance.
            </p>

            <Link href={getBookHref(market)} className="button button-primary">
              Request handyman service
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}