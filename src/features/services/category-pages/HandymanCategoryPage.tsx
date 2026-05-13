import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketUrlPath, getSeoRelationMarkets } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { handymanSubcategories } from "@/lib/services/subcategories/handyman";
import { getServiceBreadcrumbs } from "@/lib/seo";

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

const popularSearches = [
  "handyman near me",
  "same day handyman",
  "emergency handyman",
  "affordable handyman",
  "best handyman service",
  "licensed handyman",
  "local handyman pro",
  "residential handyman",
  "commercial handyman",
  "furniture assembly near me",
  "TV mounting handyman",
  "drywall repair handyman",
  "door repair handyman",
  "window repair handyman",
  "home repair handyman",
  "handyman price",
  "handyman cost",
  "urgent handyman repair",
];

const proHelpItems = [
  "Assemble furniture, beds, desks, shelves, cabinets, and storage systems.",
  "Mount TVs, shelves, mirrors, pictures, hooks, rails, and wall accessories.",
  "Patch small drywall holes, dents, nail pops, and paint-ready wall damage.",
  "Repair doors, windows, latches, hinges, knobs, handles, and simple hardware.",
  "Install curtain rods, blinds, shades, grab bars, closet systems, and fixtures.",
  "Handle caulking, sealing, weatherstripping, door sweeps, and draft reduction.",
  "Complete move-in, move-out, rental turnover, inspection, and home punch-list work.",
];

const commonUseCases = [
  "You moved in and need furniture, shelves, curtains, and TVs installed.",
  "You are preparing a rental or listing and need small repairs completed quickly.",
  "A door, window, latch, hinge, fixture, or piece of hardware stopped working.",
  "There are small wall holes, trim damage, loose boards, or cosmetic defects.",
  "You have several small tasks that are not large enough for separate contractors.",
  "You need help finishing a project that became harder than expected.",
  "You want safe mounting for heavy items instead of guessing with anchors.",
];

const priceFactors = [
  "Number of tasks and whether they can be completed in one visit.",
  "Wall type, mounting surface, item weight, and access conditions.",
  "Whether materials, hardware, brackets, anchors, or replacement parts are ready.",
  "Urgency, same-day availability, parking, travel time, and work area access.",
  "Repair complexity, hidden damage, cleanup needs, and finish quality expectations.",
  "Whether the job requires a licensed trade instead of a general handyman.",
];

const whenToHire = [
  "The task requires tools, measuring, mounting, drilling, patching, or alignment.",
  "You need several small repairs completed together in one efficient visit.",
  "The repair affects safety, access, rental readiness, or daily use.",
  "You are not sure what materials, anchors, fasteners, or hardware are needed.",
  "A simple issue may become worse if installed or repaired incorrectly.",
  "You want clear photos, scope, timing, and pricing before work begins.",
];

const urgentCases = [
  "A door will not close, lock, latch, or secure properly.",
  "A window, gate, latch, railing, or loose fixture creates a safety concern.",
  "A mounted item, shelf, mirror, TV, cabinet, or grab bar is loose or unstable.",
  "A rental, inspection, sale, or move-in deadline requires fast punch-list work.",
  "Water-damaged drywall, failing caulk, or gaps need quick attention before damage spreads.",
];

const betterResponses = [
  "List every task you want completed, even if some are small.",
  "Upload photos of the repair area, wall type, item, hardware, and any damage.",
  "Share measurements, item count, product links, model numbers, or assembly instructions.",
  "Mention whether materials, brackets, anchors, paint, caulk, or replacement parts are ready.",
  "Explain timing, parking, access, pets, stairs, ceiling height, and work-area constraints.",
  "Separate urgent must-do work from optional tasks so pros can quote clearly.",
];

const faq = [
  {
    question: "How much does handyman service cost?",
    answer:
      "Handyman pricing depends on the number of tasks, time required, materials, wall type, access, urgency, and whether the work can be completed in one visit. Small jobs may be simple, while multi-task punch lists or repairs can cost more.",
  },
  {
    question: "Can I request same-day handyman help?",
    answer:
      "Yes, you can submit a same-day request. Availability depends on your location, the task, the time of day, and local pro schedules. Clear photos and a complete task list usually help pros respond faster.",
  },
  {
    question: "What can a handyman usually help with?",
    answer:
      "Common handyman work includes furniture assembly, TV mounting, shelf installation, drywall patching, door repair, window repair, fixture installation, caulking, weatherstripping, minor carpentry, and general home repairs.",
  },
  {
    question: "Can I combine multiple small tasks in one request?",
    answer:
      "Yes. Combining small tasks into one request is often more efficient because the pro can review the full scope, bring the right tools, and plan the visit around everything you need done.",
  },
  {
    question: "When do I need a licensed specialist instead of a handyman?",
    answer:
      "Major electrical, plumbing, HVAC, roofing, structural, gas, waterproofing, or permit-related work may require a licensed specialist. A handyman is best for small repairs, installation, mounting, assembly, and general maintenance.",
  },
  {
    question: "Should I provide materials before the handyman arrives?",
    answer:
      "If you already have the product, hardware, brackets, paint, caulk, or replacement parts, include that in the request. If not, describe what you need so pros can tell you whether they can supply materials or recommend what to buy.",
  },
  {
    question: "Do handyman pros work on rental and commercial properties?",
    answer:
      "Many handyman pros can help with rental turnovers, office punch lists, small commercial repairs, maintenance tasks, and property-prep work. Include property type and access details in the request.",
  },
];

const relatedCategorySlugs = [
  "plumbing",
  "electrical",
  "painting",
  "cleaning",
  "remodeling",
  "flooring",
];

export default function HandymanCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(handymanSubcategories);

  const relatedCategories = relatedCategorySlugs
    .map((slug) => getCategoryBySlug(slug))
    .filter((item): item is Category => Boolean(item));

  const nearbyMarkets = getSeoRelationMarkets(market.slug).nearbyMarkets;

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Handyman Services</p>

            <h1>
              Handyman Services in {market.city}, {market.state}
            </h1>

            <p className="hero-text">
              Find local handyman pros in {market.city} for furniture assembly,
              TV mounting, drywall patching, door repair, window fixes, shelving,
              caulking, fixture installation, small carpentry, and general home
              repairs. Fixly helps turn broad home repair needs into clear local
              requests that pros can review and respond to.
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

        <section className="section-sm">
          <div className="container">
            <div className="card service-cta-card">
              <h2>Need handyman help in {market.city}?</h2>

              <p>
                Describe the repair, installation, mounting, assembly, or punch-list
                work once. Include photos, timing, and materials so local handyman
                pros can understand the job before they respond.
              </p>

              <Link href={getBookHref(market)} className="button button-primary">
                Start a handyman request
              </Link>
            </div>
          </div>
        </section>

        <section id="handyman-services" className="section">
          <div className="container">
            <p className="eyebrow">All handyman services</p>
            <h2>Handyman services in {market.city}</h2>

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
            <div className="card">
              <p className="eyebrow">Popular searches</p>
              <h2>Popular handyman searches in {market.city}</h2>

              <ul className="service-seo-list">
                {popularSearches.map((phrase) => (
                  <li key={phrase}>
                    {phrase.includes("near me") ||
                    phrase.includes("price") ||
                    phrase.includes("cost")
                      ? phrase
                      : `${phrase} in ${market.city}`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div className="card">
                <h2>What handyman pros can help with</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h2>Common handyman problems and use cases</h2>
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
            <div className="grid-2 gap-lg">
              <div className="card">
                <h2>Handyman price guidance</h2>
                <p>
                  Handyman prices in {market.city} depend on scope, task count,
                  materials, surface type, repair difficulty, travel, urgency, and
                  whether the work is simple maintenance or a more involved repair.
                  Fixly does not force fake exact prices because every home and task
                  list is different.
                </p>

                <ul className="service-list">
                  <li>
                    <strong>Small tasks:</strong> single fixture installs, picture
                    hanging, small hardware fixes, simple assembly, or basic caulking.
                  </li>
                  <li>
                    <strong>Medium jobs:</strong> TV mounting, multiple shelves,
                    drywall patching, door repairs, closet systems, or several tasks
                    in one visit.
                  </li>
                  <li>
                    <strong>Larger handyman work:</strong> punch lists, rental
                    turnovers, minor carpentry, deck or patio fixes, and multi-room
                    repair lists.
                  </li>
                </ul>
              </div>

              <div className="card">
                <h2>Price factors</h2>
                <ul className="service-list">
                  {priceFactors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div className="card">
                <h2>When to hire a handyman pro</h2>
                <ul className="service-list">
                  {whenToHire.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h2>Urgent or higher-risk handyman cases</h2>
                <ul className="service-list">
                  {urgentCases.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>
                  If the issue involves active electrical hazards, major plumbing
                  leaks, structural movement, gas, roof leaks, or permit work, choose
                  the matching licensed service category instead of general handyman.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <h2>How to get better handyman responses</h2>
              <ul className="service-list">
                {betterResponses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 ? (
          <section className="section-sm">
            <div className="container">
              <div className="card">
                <p className="eyebrow">Nearby cities</p>
                <h2>Handyman services near {market.city}</h2>

                <div className="grid-3">
                  {nearbyMarkets.map((nearbyMarket) => (
                    <Link
                      key={nearbyMarket.slug}
                      href={`${getMarketUrlPath(nearbyMarket)}/handyman`}
                      className="card card-hover"
                    >
                      <h3>
                        Handyman in {nearbyMarket.city}, {nearbyMarket.state}
                      </h3>
                      <p>
                        Find local handyman help for repairs, installation,
                        mounting, assembly, and home maintenance.
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="section-sm">
          <div className="container">
            <div className="card">
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
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">FAQ</p>
              <h2>Handyman service FAQ</h2>

              <div className="service-list">
                {faq.map((item) => (
                  <div key={item.question}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="card service-cta-card">
              <h2>Ready to request handyman help in {market.city}?</h2>
              <p>
                Start with a clear task list, photos, timing, and location. Fixly
                turns that into a local service request that handyman pros can review.
              </p>

              <Link href={getBookHref(market)} className="button button-primary">
                Request handyman help
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}