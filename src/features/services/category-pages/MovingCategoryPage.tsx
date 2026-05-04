import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { movingSubcategories } from "@/lib/services/subcategories/moving";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=moving&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/moving/${subcategorySlug}`;
}

const popularSearches = [
  "moving company near me",
  "local movers near me",
  "same day movers",
  "affordable movers near me",
  "best movers near me",
  "licensed movers near me",
  "apartment movers near me",
  "furniture movers near me",
  "packing and moving service",
  "labor only movers near me",
  "loading and unloading help",
  "long distance movers",
  "office movers near me",
  "piano movers near me",
  "moving cost estimate",
  "moving help today",
  "residential movers",
  "commercial moving service",
];

const proHelpItems = [
  "Move boxes, furniture, appliances, and household items",
  "Handle local moves, apartment moves, and small moves",
  "Load and unload rental trucks, trailers, pods, and storage units",
  "Pack kitchens, bedrooms, closets, fragile items, and office spaces",
  "Disassemble and reassemble basic furniture when included in the scope",
  "Protect floors, walls, doors, and large items during the move",
  "Coordinate office moves, senior moves, and specialty item moves",
  "Remove unwanted items before or after a move when requested",
];

const commonUseCases = [
  "Moving from one home to another nearby",
  "Apartment move with stairs, elevator rules, or limited parking",
  "Need help loading a rental truck or moving container",
  "Furniture pickup, delivery, or rearranging",
  "Packing before a move or unpacking after delivery",
  "Moving a small office, retail space, or home workspace",
  "Downsizing, senior move, or assisted living relocation",
  "Clearing unwanted items before move-out inspection",
];

const priceFactors = [
  "Move size, number of rooms, and total inventory",
  "Distance between pickup and drop-off locations",
  "Stairs, elevator access, long carries, parking limits, and building rules",
  "Number of movers needed and estimated labor hours",
  "Packing, unpacking, furniture disassembly, or specialty handling",
  "Truck, equipment, blankets, straps, dollies, and material requirements",
  "Urgency, weekend timing, same-day availability, and scheduling flexibility",
  "Heavy or fragile items such as pianos, safes, glass, antiques, or large cabinets",
];

const hireProSituations = [
  "You have heavy furniture or multiple large items",
  "The move involves stairs, elevators, long hallways, or tight access",
  "You need loading done safely so items do not shift during transport",
  "You are short on time before a lease, closing, or move-out deadline",
  "You need packing help for fragile or high-volume rooms",
  "You want fewer delays, fewer injuries, and clearer coordination on moving day",
];

const urgentCases = [
  "Same-day move after a lease, closing, or scheduling issue",
  "Move-out deadline with property access ending soon",
  "Truck or container is already rented and needs loading today",
  "Unloading help is needed after arrival in bad weather or late timing",
  "Business move where downtime affects operations",
  "Senior or family-supported move with limited time and extra coordination needs",
];

const betterResponseTips = [
  "Include pickup and drop-off property types: house, apartment, condo, office, storage, or container",
  "List the number of rooms and large items such as beds, couches, dressers, tables, appliances, and pianos",
  "Mention stairs, elevator access, parking distance, gate codes, building rules, and move time restrictions",
  "Say whether you need truck service, labor only, packing, unpacking, loading, unloading, or junk removal",
  "Upload photos of large items, tight staircases, elevators, hallways, and the main inventory",
  "Give your preferred date, backup date, and whether the job is urgent, same-day, or flexible",
];

const faq = [
  {
    question: "How much do movers cost?",
    answer:
      "Moving cost depends on the move size, distance, number of movers, truck needs, stairs, elevators, packing, heavy items, and timing. A small labor-only move usually costs less than a full-service home or long-distance move.",
  },
  {
    question: "Can I request same-day moving help?",
    answer:
      "Yes. Same-day moving help may be available depending on local pro schedules, truck availability, job size, and access details. Include the exact timing, item list, and whether you already have a truck.",
  },
  {
    question: "Can movers help if I already rented a truck?",
    answer:
      "Yes. Labor-only movers can help load or unload a rental truck, trailer, pod, container, or storage unit when transportation is already handled.",
  },
  {
    question: "Do moving pros bring packing supplies?",
    answer:
      "Some pros can bring boxes, tape, wrap, blankets, and other supplies, while others expect supplies to be provided. Mention what you already have and what you need included.",
  },
  {
    question: "Should I book movers before or after packing?",
    answer:
      "For most moves, book movers after you know your move date, rough inventory, access details, and whether packing is needed. If you need packing help, include it in the request from the start.",
  },
  {
    question: "Can movers handle apartments with stairs or elevators?",
    answer:
      "Yes, but access matters. Include floor level, elevator availability, elevator reservation rules, parking distance, hallway distance, and any building move-in or move-out requirements.",
  },
  {
    question: "Do moving pros handle fragile or specialty items?",
    answer:
      "Many movers can handle fragile or heavy items, but specialty items such as pianos, antiques, safes, glass, or oversized furniture should be listed clearly with photos.",
  },
];

const relatedCategorySlugs = [
  "junk-removal",
  "cleaning",
  "handyman",
  "furniture-assembly",
];

export default function MovingCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(movingSubcategories);

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((nearbyMarket): nearbyMarket is Market => Boolean(nearbyMarket));

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
            <p className="eyebrow">Moving services</p>
            <h1>
              Moving Services in {market.city}, {market.state}
            </h1>
            <p className="hero-text">
              Find local moving help in {market.city} for apartment moves, home
              moves, furniture moving, packing, loading, unloading, storage
              moves, office moves, and urgent moving labor. Submit one clear
              request and let local moving pros review the job.
            </p>
            <div className="flex gap-sm">
              <Link className="button button-primary" href={getBookHref(market)}>
                Request moving help
              </Link>
              <Link className="button button-secondary" href="#moving-services">
                Browse moving services
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <p className="eyebrow">Quick request</p>
              <h2>Need moving help in {market.city}?</h2>
              <p>
                Describe the move, pickup and drop-off details, item list, stairs,
                elevator access, truck needs, and preferred timing. Fixly turns
                that into a local request moving pros can evaluate.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Start moving request
              </Link>
            </div>
          </div>
        </section>

        <section className="section" id="moving-services">
          <div className="container">
            <p className="eyebrow">All moving services</p>
            <h2>Moving help for homes, apartments, offices, and storage</h2>
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
              <h2>High-intent moving searches in {market.city}</h2>
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
          <div className="container">
            <div className="grid-2 gap-md">
              <div className="card">
                <p className="eyebrow">What pros can help with</p>
                <h2>Moving tasks local pros handle</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Common use cases</p>
                <h2>When people request moving help</h2>
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
              <h2>Moving cost depends on scope, access, and timing</h2>
              <p>
                Small moving jobs may include a few furniture items, a studio
                apartment, or labor-only loading for a rental truck. Medium jobs
                often include one to three bedrooms, stairs, packing, or both
                pickup and delivery. Larger jobs can include full homes, office
                moves, long-distance moves, storage coordination, specialty
                items, or multiple movers for a full day.
              </p>
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
            <div className="grid-2 gap-md">
              <div className="card">
                <p className="eyebrow">When to hire a pro</p>
                <h2>Moving is worth hiring out when risk or time is high</h2>
                <ul className="service-list">
                  {hireProSituations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>Moving requests that need fast responses</h2>
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
              <h2>How to get better moving quotes</h2>
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
              <h2>Moving services near {market.city}</h2>
              <div className="grid-3 gap-md">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/moving`}
                    key={nearbyMarket.slug}
                  >
                    <h3>
                      Moving services in {nearbyMarket.city},{" "}
                      {nearbyMarket.state}
                    </h3>
                    <p>
                      Request local movers, packing help, loading help, and
                      furniture moving near {nearbyMarket.city}.
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
              <h2>Other services people book around a move</h2>
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
            <h2>Moving service questions</h2>
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
              <h2>Request moving help in {market.city}</h2>
              <p>
                Add your move date, item list, access details, photos, and
                timing. Fixly helps local moving pros understand the job before
                they respond.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Request moving help
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}