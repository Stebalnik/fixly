import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { junkSubcategories } from "@/lib/services/subcategories/junk";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=junk&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/junk/${subcategorySlug}`;
}

const popularSearches = [
  "junk removal near me",
  "same day junk removal",
  "affordable junk removal",
  "furniture removal near me",
  "mattress disposal near me",
  "garage cleanout service",
  "construction debris removal",
  "yard waste removal",
  "estate cleanout service",
  "commercial junk removal",
  "hot tub removal",
  "local junk haulers",
];

const proHelpItems = [
  "Remove bulky furniture, mattresses, boxes, bags, and household clutter",
  "Clear garages, basements, attics, storage rooms, and rental units",
  "Haul construction debris, renovation waste, and yard waste",
  "Load heavy items safely and handle disposal or donation routing when available",
  "Help with move-out cleanouts, estate cleanouts, and commercial cleanouts",
];

const commonProblems = [
  "Old furniture or mattresses that regular trash pickup will not take",
  "Garage, attic, or basement clutter that has built up over time",
  "Leftover debris after remodeling, repairs, landscaping, or moving",
  "Heavy items that need two-person lifting or special access planning",
  "Urgent cleanouts before moving, listing a property, tenant turnover, or delivery",
];

const priceFactors = [
  "Total volume of junk and how much truck space is needed",
  "Weight of heavy items such as appliances, furniture, tubs, or debris",
  "Stairs, elevators, long carry distance, or difficult parking",
  "Sorting, donation handling, recycling, or special disposal requirements",
  "Same-day, weekend, or urgent scheduling",
];

const requestTips = [
  "List the main items that need to be removed",
  "Estimate the volume, such as a few items, half truck, or full truck",
  "Mention stairs, elevator access, parking, gate codes, or long carry distance",
  "Upload photos so pros can estimate faster",
  "Say whether items are inside, outside, curbside, garage, attic, or basement",
  "Mention whether anything may be donated or recycled",
];

const faq = [
  {
    question: "How much does junk removal cost?",
    answer:
      "Junk removal pricing depends on volume, weight, access, disposal type, stairs, parking, and urgency. Small pickups usually cost less than full cleanouts or heavy debris removal.",
  },
  {
    question: "Can I get same-day junk removal?",
    answer:
      "Same-day junk removal may be available depending on local pro availability, truck capacity, item type, and pickup location.",
  },
  {
    question: "Do I need to move everything outside?",
    answer:
      "Not always. Many pros can remove items from inside the home, garage, apartment, attic, or basement if access details are included.",
  },
  {
    question: "Can junk removal pros take furniture and mattresses?",
    answer:
      "Yes. Furniture, mattresses, box springs, tables, chairs, dressers, and bed frames are common junk removal requests.",
  },
  {
    question: "Can construction debris be removed?",
    answer:
      "Light construction debris, renovation waste, drywall, wood, flooring scraps, cabinets, and packaging may be removed depending on weight and local disposal rules.",
  },
  {
    question: "What should I include in my junk removal request?",
    answer:
      "Include item types, approximate volume, photos, access details, floor level, parking information, and preferred pickup time.",
  },
];

const relatedCategorySlugs = [
  "moving",
  "cleaning",
  "property-maintenance",
  "handyman",
  "lawn",
  "remodeling",
];

export default function JunkCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(junkSubcategories);

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((nearbyMarket): nearbyMarket is Market => Boolean(nearbyMarket));

  const relatedCategories = relatedCategorySlugs
    .map((slug) => getCategoryBySlug(slug))
    .filter(
      (relatedCategory): relatedCategory is Category => Boolean(relatedCategory)
    );

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="service-hero">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Junk removal pros near you</p>
              <h1>Junk Removal Services in {market.city}, {market.state}</h1>
              <p className="hero-text">
                Find local junk removal help in {market.city} for furniture
                removal, mattress disposal, garage cleanouts, construction
                debris, yard waste, estate cleanouts, and same-day hauling
                requests. Fixly helps turn high-intent local searches into
                clear service requests that local pros can review.
              </p>
              <div className="flex gap-sm">
                <Link className="button button-primary" href={getBookHref(market)}>
                  Request junk removal
                </Link>
                <a className="button button-secondary" href="#junk-services">
                  View junk services
                </a>
              </div>
            </div>

            <div className="card service-cta-card">
              <p className="eyebrow">Fast local request</p>
              <h2>Need junk help in {market.city}?</h2>
              <p>
                Describe what needs to be removed, add photos, and include
                access details so local junk removal pros can respond with
                better estimates.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Start a junk request
              </Link>
            </div>
          </div>
        </section>

        <section className="section" id="junk-services">
          <div className="container">
            <div className="flex-between gap-md">
              <div>
                <p className="eyebrow">All junk services</p>
                <h2>Junk removal and hauling services</h2>
              </div>
              <Link className="button button-outline" href={getBookHref(market)}>
                Book now
              </Link>
            </div>

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
              <h2>High-intent junk removal searches in {market.city}</h2>
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
          <div className="container grid-2 gap-lg">
            <div className="card">
              <p className="eyebrow">What pros can help with</p>
              <h2>Practical junk removal help</h2>
              <ul className="service-list">
                {proHelpItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <p className="eyebrow">Common problems</p>
              <h2>When junk removal is useful</h2>
              <ul className="service-list">
                {commonProblems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container grid-2 gap-lg">
            <div className="card">
              <p className="eyebrow">Price guidance</p>
              <h2>What affects junk removal cost?</h2>
              <p>
                Junk removal cost usually depends on how much space the items
                take, how heavy they are, how difficult access is, and whether
                special disposal is required.
              </p>
              <ul className="service-list">
                {priceFactors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <p className="eyebrow">Job size tiers</p>
              <h2>Small, medium, and larger jobs</h2>
              <ul className="service-list">
                <li>
                  Small jobs: a mattress, a few boxes, one furniture item, or
                  light curbside pickup.
                </li>
                <li>
                  Medium jobs: several bulky items, a garage pile, apartment
                  cleanout, or mixed household junk.
                </li>
                <li>
                  Larger jobs: estate cleanouts, construction debris, commercial
                  cleanouts, hot tubs, or full truckload requests.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2 gap-lg">
            <div className="card">
              <p className="eyebrow">When to hire a pro</p>
              <h2>Hire a junk removal pro when</h2>
              <ul className="service-list">
                <li>Items are too large, heavy, or awkward to move safely.</li>
                <li>Regular trash pickup will not accept the items.</li>
                <li>You need loading, hauling, and disposal handled together.</li>
                <li>You are clearing a property before a move, sale, rental, or renovation.</li>
              </ul>
            </div>

            <div className="card">
              <p className="eyebrow">Urgent cases</p>
              <h2>High-priority junk removal requests</h2>
              <ul className="service-list">
                <li>Move-out deadline or tenant turnover cleanup.</li>
                <li>Blocked garage, driveway, hallway, or business space.</li>
                <li>Storm debris, yard debris, or renovation debris that needs fast clearing.</li>
                <li>Heavy items that require safe handling and enough crew capacity.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">Better responses</p>
              <h2>How to get better junk removal estimates</h2>
              <ul className="service-list">
                {requestTips.map((item) => (
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
              <h2>Junk removal near {market.city}</h2>
              <div className="grid-3 gap-md">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/junk`}
                    key={nearbyMarket.slug}
                  >
                    <h3>
                      Junk removal in {nearbyMarket.city}, {nearbyMarket.state}
                    </h3>
                    <p>
                      Find junk removal, furniture hauling, garage cleanouts,
                      and debris removal near {nearbyMarket.city}.
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
            <h2>Related home services</h2>
            <div className="grid-3 gap-md">
              {relatedCategories.map((relatedCategory) => (
                <Link
                  className="card card-hover"
                  href={`${getMarketUrlPath(market)}/${relatedCategory.slug}`}
                  key={relatedCategory.slug}
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
            <h2>Junk removal questions</h2>
            <div className="service-list">
              {faq.map((item) => (
                <div className="card-flat" key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card service-cta-card">
              <p className="eyebrow">Start now</p>
              <h2>Request junk removal in {market.city}</h2>
              <p>
                Tell local pros what needs to be removed, where it is located,
                and when you need it picked up.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Request junk removal
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}