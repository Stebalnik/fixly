import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { fenceSubcategories } from "@/lib/services/subcategories/fence";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=fence&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/fence/${subcategorySlug}`;
}

const popularSearches = [
  "fence repair near me",
  "fence installation near me",
  "privacy fence installation",
  "wood fence repair",
  "vinyl fence repair",
  "chain link fence installation",
  "fence replacement cost",
  "same day fence repair",
  "emergency fence repair",
  "fence post repair",
  "gate repair near me",
  "affordable fence contractor",
  "licensed fence installer",
  "residential fence services",
  "commercial fence installation",
  "best fence company near me",
];

const proHelpItems = [
  "Install new wood, vinyl, chain link, privacy, and commercial fencing",
  "Repair leaning fence sections, loose panels, broken boards, and storm damage",
  "Replace rotten, broken, leaning, or unstable fence posts",
  "Repair and install walk gates, side-yard gates, and access gates",
  "Replace old fencing when repairs are no longer cost-effective",
  "Stain, seal, inspect, and maintain wood fences",
];

const commonUseCases = [
  "Backyard privacy from neighbors, streets, or nearby properties",
  "Pet containment and safer outdoor areas for children",
  "Storm damage, fallen branches, leaning sections, and broken panels",
  "Gate problems, sagging gates, dragging gates, and latch issues",
  "Old fencing with rot, repeated repairs, or unstable posts",
  "Commercial perimeter, utility, storage, or access-control fencing",
];

const priceFactors = [
  "Fence material: wood, vinyl, chain link, privacy, metal, or mixed materials",
  "Linear feet, height, number of corners, and number of gates",
  "Post depth, soil conditions, slope, roots, trees, and access",
  "Removal and disposal of old fencing",
  "Repair complexity, material matching, and replacement parts",
  "Urgency, same-day timing, storm damage, or safety concerns",
];

const hireProReasons = [
  "The fence is leaning, unstable, or no longer secure",
  "A gate will not close, latch, or stay aligned",
  "Posts are rotten, broken, loose, or moving in the ground",
  "You need a straight fence line with durable posts and clean gate alignment",
  "The project affects pets, children, pool safety, privacy, or property access",
];

const urgentCases = [
  "A fence section is down and pets, children, or security are affected",
  "A gate cannot close or lock",
  "Storm damage left sharp, unstable, or exposed sections",
  "A pool, rental, business, or access area is no longer properly enclosed",
];

const requestTips = [
  "Fence material: wood, vinyl, chain link, metal, or unknown",
  "Approximate linear feet or number of damaged sections",
  "Fence height and number of gates",
  "Photos of the full fence line and close-ups of damage",
  "Whether old fence removal, disposal, staining, or sealing is needed",
  "Access notes, pets, HOA requirements, urgency, and preferred timing",
];

const faq = [
  {
    question: "How much does fence service cost?",
    answer:
      "Fence cost depends on material, linear feet, height, gates, post condition, removal, access, and whether the job is repair, replacement, or new installation.",
  },
  {
    question: "Can I get same-day fence repair?",
    answer:
      "Some fence repairs can be handled quickly depending on pro availability, material needs, access, weather, and the type of damage.",
  },
  {
    question: "Should I repair or replace my fence?",
    answer:
      "Repair usually makes sense for isolated damage. Replacement may be better when many posts, panels, rails, or gates are failing.",
  },
  {
    question: "What fence material is best?",
    answer:
      "Wood is flexible and classic, vinyl is lower maintenance, and chain link is often practical and affordable. The best option depends on privacy, budget, maintenance, and use case.",
  },
  {
    question: "Do fence pros install gates?",
    answer:
      "Yes. Many fence pros install and repair walk gates, side-yard gates, driveway gates, double gates, hinges, latches, and posts.",
  },
  {
    question: "Do I need a permit or HOA approval?",
    answer:
      "Rules vary by location, property type, fence height, and HOA. A request should mention any known HOA or permit requirements.",
  },
  {
    question: "What should I include in my fence request?",
    answer:
      "Include material, linear feet, height, gate count, photos, access notes, urgency, and whether the job is repair, replacement, installation, staining, or maintenance.",
  },
];

const relatedCategorySlugs = [
  "handyman",
  "lawn",
  "pressure",
  "painting",
  "remodeling",
  "garage-door",
];

export default function FenceCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(fenceSubcategories);

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((nearbyMarket): nearbyMarket is Market => Boolean(nearbyMarket));

  const relatedCategories = relatedCategorySlugs
    .map((slug) => getCategoryBySlug(slug))
    .filter(
      (relatedCategory): relatedCategory is Category => Boolean(relatedCategory)
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
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">Fence services</p>
                <h1>
                  Fence Services in {market.city}, {market.state}
                </h1>
                <p className="hero-text">
                  Find local fence pros for repair, installation, replacement,
                  privacy fencing, wood fences, vinyl fences, chain link fences,
                  gate repair, post repair, staining, sealing, and commercial
                  fence projects in {market.city}.
                </p>
                <div className="flex gap-sm">
                  <Link className="button button-primary" href={getBookHref(market)}>
                    Request fence service
                  </Link>
                  <Link className="button button-secondary" href="#fence-services">
                    View fence services
                  </Link>
                </div>
              </div>

              <div className="card">
                <p className="eyebrow">Local fence help</p>
                <h2>Need fence help in {market.city}?</h2>
                <p>
                  Describe the fence material, damage, length, gate needs, and
                  timing. Fixly turns your request into a clear local job so
                  fence pros can review the scope and respond.
                </p>
                <Link className="button button-primary" href={getBookHref(market)}>
                  Start a fence request
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <p className="eyebrow">Fast request</p>
              <h2>Need fence help in {market.city}?</h2>
              <p>
                Fence problems are easier to price when the request includes
                photos, material, damaged length, gate count, and access notes.
                Send one request and let local pros review the details.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Request fence help
              </Link>
            </div>
          </div>
        </section>

        <section className="section" id="fence-services">
          <div className="container">
            <p className="eyebrow">All fence services</p>
            <h2>Fence repair, installation, gates, posts, and replacement</h2>
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
            <p className="eyebrow">Popular searches</p>
            <h2>High-intent fence searches in {market.city}</h2>
            <ul className="service-seo-list">
              {popularSearches.map((phrase) => (
                <li key={phrase}>
                  {phrase} in {market.city}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">What pros can help with</p>
                <h2>Fence projects local pros handle</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow">Common problems</p>
                <h2>Fence use cases and repair needs</h2>
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
            <p className="eyebrow">Price guidance</p>
            <h2>Fence cost depends on scope, material, and access</h2>
            <div className="grid-3 gap-md">
              <div className="card">
                <h3>Small repairs</h3>
                <p>
                  Small repairs may include a few boards, simple gate hardware,
                  minor chain link repair, or one isolated damaged section.
                </p>
              </div>
              <div className="card">
                <h3>Medium projects</h3>
                <p>
                  Medium jobs may include several panels, multiple posts, gate
                  rebuilding, vinyl panel replacement, or partial fence
                  replacement.
                </p>
              </div>
              <div className="card">
                <h3>Larger projects</h3>
                <p>
                  Larger jobs may include full fence installation, privacy fence
                  replacement, commercial fencing, removal, disposal, and
                  multiple gates.
                </p>
              </div>
            </div>

            <ul className="service-list">
              {priceFactors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">When to hire a pro</p>
                <h2>Fence work is structural, visible, and access-sensitive</h2>
                <ul className="service-list">
                  {hireProReasons.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow">Urgent cases</p>
                <h2>Fence issues that need faster attention</h2>
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
            <p className="eyebrow">Better responses</p>
            <h2>How to get better fence quotes</h2>
            <ul className="service-list">
              {requestTips.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {nearbyMarkets.length > 0 && (
          <section className="section">
            <div className="container">
              <p className="eyebrow">Nearby cities</p>
              <h2>Fence services near {market.city}</h2>
              <div className="grid-3 gap-md">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/fence`}
                    key={nearbyMarket.slug}
                  >
                    <h3>
                      Fence services in {nearbyMarket.city}, {nearbyMarket.state}
                    </h3>
                    <p>
                      Find fence repair, installation, gates, posts, replacement,
                      and maintenance near {nearbyMarket.city}.
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
              <h2>Related home services in {market.city}</h2>
              <div className="grid-3 gap-md">
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
        )}

        <section className="section">
          <div className="container">
            <p className="eyebrow">FAQ</p>
            <h2>Fence service questions</h2>
            <div className="grid-2 gap-md">
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
              <p className="eyebrow">Get started</p>
              <h2>Request fence service in {market.city}</h2>
              <p>
                Share what you need, add photos, choose your timing, and create
                one clear fence request for local pros to review.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Request fence service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}