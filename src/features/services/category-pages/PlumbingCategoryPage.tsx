import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketUrlPath, getSeoRelationMarkets } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { plumbingSubcategories } from "@/lib/services/subcategories/plumbing";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=plumbing&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/plumbing/${subcategorySlug}`;
}

const popularSearches = [
  "plumber near me",
  "same day plumber",
  "emergency plumber",
  "leak repair near me",
  "drain cleaning near me",
  "toilet repair plumber",
  "water heater repair",
  "faucet installation plumber",
  "affordable plumber",
  "licensed plumber",
  "residential plumber",
  "commercial plumber",
];

const whatProsHelpWith = [
  "Leak detection and plumbing repair",
  "Drain cleaning and clogged drain service",
  "Toilet repair and toilet installation",
  "Faucet, sink, shower, and fixture work",
  "Water heater repair and replacement",
  "Pipe repair, pipe replacement, and shutoff valves",
  "Garbage disposal repair and installation",
  "Urgent plumbing problems and water damage prevention",
];

const commonProblems = [
  "Water stains, ceiling leaks, or hidden moisture",
  "Slow drains, standing water, or recurring clogs",
  "Running toilets, weak flushes, or leaking toilet bases",
  "No hot water, leaking water heaters, or strange noises",
  "Low water pressure or inconsistent water flow",
  "Bad drain odors or sewer-like smells",
  "Loose, dripping, or outdated plumbing fixtures",
  "Burst pipes, active leaks, or overflowing fixtures",
];

const whenToHire = [
  "You see active water leaking or signs of water damage",
  "A drain keeps clogging after basic cleaning",
  "A toilet, faucet, shower, or sink needs replacement",
  "Your water heater is leaking, noisy, or not heating",
  "You need pipe, gas line, sewer, or code-related plumbing work",
  "You want the job diagnosed before it becomes more expensive",
];

const urgentCases = [
  "Burst pipe or active water leak",
  "Overflowing toilet or sewage backup",
  "No hot water in a home or rental property",
  "Water near electrical areas",
  "Major leak under a sink, behind a wall, or near a water heater",
  "Gas line concern or suspected gas smell",
];

const betterResponses = [
  "Describe where the problem is located",
  "Explain when the issue started",
  "Mention whether water is actively leaking",
  "Add photos of the fixture, leak, pipe, or water damage",
  "Share whether the water is shut off",
  "Include urgency and preferred timing",
];

const plumbingFaq = [
  {
    question: "How much does plumbing cost in my area?",
    answer:
      "Plumbing cost depends on the problem, access, parts, urgency, and whether the work is repair, replacement, inspection, or installation. Small fixture repairs usually cost less than leak tracing, water heater work, sewer issues, or emergency repairs.",
  },
  {
    question: "Can I request same-day plumbing help?",
    answer:
      "Yes. Many plumbing requests can be handled the same day when local pros are available. Active leaks, backups, overflowing toilets, and no-hot-water issues should be marked as urgent in the request.",
  },
  {
    question: "What plumbing problems should not wait?",
    answer:
      "Do not wait on active leaks, burst pipes, sewer backups, overflowing toilets, water heater leaks, water near electrical areas, or suspected gas line issues.",
  },
  {
    question: "Should I hire a licensed plumber?",
    answer:
      "For major plumbing work, pipe replacement, gas lines, water heaters, sewer work, and code-required jobs, hiring a licensed plumber is usually the safest option.",
  },
  {
    question: "What should I include in my plumbing request?",
    answer:
      "Include the issue, location, urgency, photos, fixture type, whether water is still leaking, and any previous repair attempts. Better details usually help pros respond faster and more accurately.",
  },
  {
    question: "Can plumbers help with both residential and commercial work?",
    answer:
      "Yes. Plumbing pros can handle homes, rentals, small businesses, offices, restaurants, retail spaces, and property maintenance requests depending on licensing and scope.",
  },
];

export default function PlumbingCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(plumbingSubcategories);

  const nearbyMarkets = getSeoRelationMarkets(market.slug).nearbyMarkets;

  const relatedCategories = [
    getCategoryBySlug("handyman"),
    getCategoryBySlug("electrical"),
    getCategoryBySlug("cleaning"),
    getCategoryBySlug("remodeling"),
  ].filter((item): item is Category => Boolean(item));

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Plumbing Services</p>

            <h1>
              {category.title} Services in {market.city}, {market.state}
            </h1>

            <p className="hero-text">
              Find local plumbing pros for leaks, drain cleaning, toilet repair,
              water heaters, faucet replacement, garbage disposals, pipe repair,
              and urgent plumbing problems in {market.city}.
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

        <section className="section-sm">
          <div className="container">
            <div className="card service-cta-card">
              <h2>Need plumbing help in {market.city}?</h2>

              <p>
                Describe the issue once and let local plumbing pros understand
                the scope, urgency, and location before responding.
              </p>

              <Link href={getBookHref(market)} className="button button-primary">
                Start a plumbing request
              </Link>
            </div>
          </div>
        </section>

        <section id="plumbing-services" className="section">
          <div className="container">
            <h2>All Plumbing Services in {market.city}</h2>

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
              <h2>Popular Plumbing Searches in {market.city}</h2>

              <div className="service-seo-list">
                {popularSearches.map((phrase) => (
                  <p key={phrase}>
                    {phrase} {market.city}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2">
            <div className="card">
              <h2>What Plumbing Pros Can Help With</h2>

              <ul className="service-list">
                {whatProsHelpWith.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>Common Plumbing Problems</h2>

              <ul className="service-list">
                {commonProblems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="card">
              <h2>Plumbing Price Guidance</h2>

              <p>
                Plumbing prices depend on the type of issue, urgency, access,
                parts, fixture type, pipe location, diagnostic time, and whether
                the job requires repair, replacement, inspection, or installation.
              </p>

              <ul className="service-list">
                <li>
                  Small jobs: faucet drips, toilet parts, minor leaks, fixture
                  adjustments, and simple drain issues.
                </li>
                <li>
                  Medium jobs: toilet replacement, fixture installation, garbage
                  disposal work, leak tracing, and water heater troubleshooting.
                </li>
                <li>
                  Larger jobs: water heater replacement, pipe repair, sewer line
                  problems, gas line work, and emergency plumbing repairs.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-3">
            <div className="card">
              <h2>When to Hire a Plumber</h2>

              <ul className="service-list">
                {whenToHire.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>Urgent Plumbing Cases</h2>

              <ul className="service-list">
                {urgentCases.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <h2>How to Get Better Responses</h2>

              <ul className="service-list">
                {betterResponses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 && (
          <section className="section">
            <div className="container">
              <h2>Plumbing Services Near {market.city}</h2>

              <div className="grid-3">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    href={`${getMarketUrlPath(nearbyMarket)}/plumbing`}
                    className="card card-hover"
                  >
                    <h3>Plumbing in {nearbyMarket.city}</h3>
                    <p>
                      Find plumbing help near {nearbyMarket.city},{" "}
                      {nearbyMarket.state}.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <h2>Related Services</h2>

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

        <section className="section">
          <div className="container flex-center">
            <div className="card service-cta-card">
              <h2>Get Plumbing Help in {market.city}</h2>

              <p>
                Submit your plumbing request and connect with local pros for
                repair, installation, replacement, inspection, or urgent help.
              </p>

              <Link href={getBookHref(market)} className="button button-primary">
                Request plumbing service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}