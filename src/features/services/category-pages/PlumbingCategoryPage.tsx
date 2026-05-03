import Link from "next/link";
import type { Category } from "@/lib/services/categories";
import type { Market } from "@/lib/geo";
import {
  categories,
  getSubcategoriesByParent,
} from "@/lib/services";
import { getMarketUrlPath } from "@/lib/geo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=plumbing&market=${market.slug}`;
}

function getServiceHref(market: Market, subSlug: string) {
  return `${getMarketUrlPath(market)}/plumbing/${subSlug}`;
}

const plumbingFaq = [
  {
    question: "How much does plumbing cost?",
    answer:
      "Plumbing costs depend on the issue, urgency, parts, and access. Small fixes are usually cheaper, while leaks, replacements, or emergency repairs can cost more.",
  },
  {
    question: "Can I get same-day plumbing service?",
    answer:
      "Yes, many plumbing issues can be handled the same day depending on availability and urgency.",
  },
  {
    question: "What plumbing jobs are most common?",
    answer:
      "Common requests include leak repair, faucet replacement, toilet repair, drain issues, garbage disposal fixes, and water heater problems.",
  },
  {
    question: "When do I need a licensed plumber?",
    answer:
      "For major plumbing, pipe replacement, gas lines, or code-required work, a licensed plumber is usually required.",
  },
];

export default function PlumbingCategoryPage({ category, market }: Props) {
  const subcategories = getSubcategoriesByParent("plumbing");

  const relatedCategories = Object.values(categories).filter((item) =>
    ["handyman", "electrical", "cleaning", "remodeling"].includes(item.slug)
  );

  return (
    <main className="page">
      {/* 1. HERO */}
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Plumbing Services</p>

          <h1>
            Plumbing Services in {market.city}, {market.state}
          </h1>

          <p className="hero-text">
            Find local plumbers for leak repair, faucet replacement, drain
            cleaning, toilet repair, water heaters, and emergency plumbing.
          </p>

          <div className="flex gap-md">
            <Link href={getBookHref(market)} className="button button-primary">
              Request plumbing help
            </Link>

            <Link href="#plumbing-services" className="button button-secondary">
              Browse plumbing services
            </Link>
          </div>
        </div>
      </section>

      {/* 2. QUICK REQUEST */}
      <section className="section-sm">
        <div className="container">
          <div className="card service-cta-card">
            <h2>Need a plumber in {market.city}?</h2>

            <p>
              Describe the issue and get responses from local plumbing
              professionals based on urgency and scope.
            </p>

            <Link href={getBookHref(market)} className="button button-primary">
              Start a request
            </Link>
          </div>
        </div>
      </section>

      {/* 3. ALL SERVICES */}
      <section id="plumbing-services" className="section">
        <div className="container">
          <h2>All Plumbing Services in {market.city}</h2>

          <div className="grid-3">
            {subcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={getServiceHref(market, sub.slug)}
                className="card card-hover"
              >
                <h3>{sub.title}</h3>
                <p>{sub.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR SEARCHES */}
      <section className="section">
        <div className="container">
          <div className="card">
            <h2>Popular Plumbing Searches in {market.city}</h2>

            <div className="service-seo-list">
              <p>plumber near me</p>
              <p>emergency plumber {market.city}</p>
              <p>leak repair near me</p>
              <p>toilet repair handyman</p>
              <p>drain cleaning near me</p>
              <p>water heater repair</p>
              <p>same day plumbing service</p>
              <p>affordable plumber near me</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHAT PLUMBER DOES */}
      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <h2>What Plumbing Services Include</h2>

            <ul className="service-list">
              <li>Leak detection and repair</li>
              <li>Faucet and fixture replacement</li>
              <li>Toilet repair and installation</li>
              <li>Drain cleaning and clogs</li>
              <li>Garbage disposal fixes</li>
              <li>Water heater troubleshooting</li>
            </ul>
          </div>

          <div className="card">
            <h2>Common Plumbing Issues</h2>

            <ul className="service-list">
              <li>Water leaks</li>
              <li>Clogged drains</li>
              <li>Low water pressure</li>
              <li>Running toilets</li>
              <li>Broken fixtures</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. PRICE */}
      <section className="section">
        <div className="container">
          <div className="card">
            <h2>Plumbing Price Guidance</h2>

            <p>
              Plumbing pricing depends on urgency, parts, access, and the type
              of issue. Emergency calls and complex repairs usually cost more.
            </p>

            <ul className="service-list">
              <li>Small fixes: minor leaks, adjustments</li>
              <li>Medium jobs: fixture replacement, toilet repair</li>
              <li>Larger jobs: water heaters, major repairs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. WHEN TO HIRE */}
      <section className="section">
        <div className="container grid-3">
          <div className="card">
            <h2>When to Call a Plumber</h2>

            <ul className="service-list">
              <li>Water leaks or damage</li>
              <li>Clogged or slow drains</li>
              <li>Broken fixtures</li>
              <li>Emergency issues</li>
            </ul>
          </div>

          <div className="card">
            <h2>Urgent Plumbing Issues</h2>

            <ul className="service-list">
              <li>Burst pipes</li>
              <li>Overflowing toilet</li>
              <li>No hot water</li>
              <li>Major leaks</li>
            </ul>
          </div>

          <div className="card">
            <h2>How to Get Faster Help</h2>

            <ul className="service-list">
              <li>Describe the issue clearly</li>
              <li>Add photos if possible</li>
              <li>Include urgency</li>
              <li>Specify location</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. NEARBY */}
      {market.nearby?.length > 0 && (
        <section className="section">
          <div className="container">
            <h2>Plumbing Services Near {market.city}</h2>

            <div className="grid-3">
              {market.nearby.map((city) => (
                <Link
                  key={city}
                  href={`/us/ga/${city}/plumbing`}
                  className="card"
                >
                  <h3>Plumber in {city}</h3>
                  <p>Local plumbing help near {city}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. RELATED */}
      <section className="section">
        <div className="container">
          <h2>Related Services</h2>

          <div className="grid-3">
            {relatedCategories.map((item) => (
              <Link
                key={item.slug}
                href={`${getMarketUrlPath(market)}/${item.slug}`}
                className="card"
              >
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
          <h2>Plumbing FAQ</h2>

          <div className="grid-3">
            {plumbingFaq.map((item) => (
              <div key={item.question} className="card">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="section">
        <div className="container flex-center">
          <div className="card service-cta-card">
            <h2>Get Plumbing Help in {market.city}</h2>

            <p>Submit your request and connect with local plumbers.</p>

            <Link href={getBookHref(market)} className="button button-primary">
              Request plumbing service
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}