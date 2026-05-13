import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { getMarketUrlPath, getSeoRelationMarkets, type Market } from "@/lib/geo";
import { getServiceBreadcrumbs } from "@/lib/seo";
import { getCategoryBySlug } from "@/lib/services";
import { remodelingSubcategories } from "@/lib/services/subcategories/remodeling";
import type { Category } from "@/lib/services/categories";

type RemodelingCategoryPageProps = {
  category: Category;
  market: Market;
};

const CATEGORY_SLUG = "remodeling";

function getBookHref(market: Market) {
  return `/book?category=${CATEGORY_SLUG}&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/${CATEGORY_SLUG}/${subcategorySlug}`;
}

export default function RemodelingCategoryPage({
  category,
  market,
}: RemodelingCategoryPageProps) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(remodelingSubcategories);

  const relatedCategorySlugs = [
    "handyman",
    "plumbing",
    "electrical",
    "painting",
    "flooring",
    "roofing",
    "appliances",
    "cleaning",
  ];

  const relatedCategories = relatedCategorySlugs
    .map((slug) => getCategoryBySlug(slug))
    .filter((item): item is Category => Boolean(item));

  const nearbyMarkets = getSeoRelationMarkets(market.slug).nearbyMarkets;

  const popularSearches = [
    `remodeling contractors in ${market.city}`,
    `home remodeling near me in ${market.city}`,
    `bathroom remodeling ${market.city}`,
    `kitchen remodeling ${market.city}`,
    `basement remodeling ${market.city}`,
    `whole home remodel ${market.city}`,
    `room addition contractor ${market.city}`,
    `garage conversion ${market.city}`,
    `shower remodel ${market.city}`,
    `cabinet installation ${market.city}`,
    `countertop installation ${market.city}`,
    `tile installation ${market.city}`,
    `flooring installation ${market.city}`,
    `drywall installation ${market.city}`,
    `load bearing wall removal ${market.city}`,
    `affordable remodeling contractor ${market.city}`,
  ];

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="section">
          <div className="container">
            <div className="service-hero">
              <div className="hero-text">
                <p className="eyebrow">Remodeling contractors near you</p>
                <h1>Remodeling Services in {market.city}, {market.state}</h1>
                <p>
                  Find local remodeling pros for bathroom remodels, kitchen
                  renovations, basement finishing, room additions, garage
                  conversions, flooring, tile, drywall, cabinets, countertops,
                  and full interior upgrades. Fixly helps homeowners in{" "}
                  {market.city} turn a remodeling idea into a clear request so
                  local pros can respond with relevant estimates.
                </p>

                <div className="flex gap-sm">
                  <Link className="button button-primary" href={getBookHref(market)}>
                    Request remodeling help
                  </Link>
                  <a className="button button-secondary" href="#remodeling-services">
                    View remodeling services
                  </a>
                </div>
              </div>

              <div className="service-cta-card">
                <span className="badge badge-primary">SEO-first marketplace</span>
                <h2>Plan the project. Get local responses.</h2>
                <p>
                  Describe the room, current condition, project scope, timeline,
                  and photos. Your request becomes easier for remodeling pros to
                  price, schedule, and respond to.
                </p>
                <Link className="button button-primary" href={getBookHref(market)}>
                  Start a remodeling request
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card card-flat">
              <div className="flex-between gap-md">
                <div>
                  <h2>Need remodeling help in {market.city}?</h2>
                  <p>
                    Whether you need a small room update or a full renovation,
                    Fixly helps you turn the project into a structured request
                    with the details pros need: scope, room type, materials,
                    access, timeline, and budget range.
                  </p>
                </div>
                <Link className="button button-primary" href={getBookHref(market)}>
                  Request service
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="remodeling-services">
          <div className="container">
            <div className="flex-between gap-md">
              <div>
                <p className="eyebrow">All remodeling services</p>
                <h2>Browse remodeling services in {market.city}</h2>
                <p>
                  Choose the remodeling service that best matches your project.
                  Each page is built for a specific high-intent need so your
                  request can be routed with better context.
                </p>
              </div>
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
                  <span className="badge badge-primary">
                    {subcategory.priceUnit === "sqft"
                      ? "Sq ft pricing factors"
                      : "Project-based pricing"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">Popular searches</p>
                <h2>High-intent remodeling searches we cover</h2>
                <ul className="service-seo-list">
                  {popularSearches.map((phrase) => (
                    <li key={phrase}>{phrase}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h2>What remodeling pros can help with</h2>
                <ul className="service-list">
                  <li>Walk through the current room condition and project goals.</li>
                  <li>Separate must-have work from optional upgrades.</li>
                  <li>Plan demolition, prep, installation, finish work, and cleanup.</li>
                  <li>Identify plumbing, electrical, drywall, flooring, or structural needs.</li>
                  <li>Help compare material choices by durability, maintenance, and budget.</li>
                  <li>Coordinate multi-trade remodeling work when the project requires it.</li>
                  <li>Explain what details may affect permitting, timing, and access.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div className="card">
                <h2>Common remodeling projects</h2>
                <ul className="service-list">
                  <li>Bathroom remodels with tile, shower, tub, vanity, and fixture updates.</li>
                  <li>Kitchen remodels with cabinets, countertops, backsplash, and islands.</li>
                  <li>Basement finishing for family rooms, bedrooms, offices, and gyms.</li>
                  <li>Garage conversions into usable interior space.</li>
                  <li>Interior updates before selling, renting, or moving into a home.</li>
                  <li>Drywall, trim, flooring, paint, and finish upgrades across multiple rooms.</li>
                  <li>Layout changes such as opening walls or improving room flow.</li>
                </ul>
              </div>

              <div className="card">
                <h2>Remodeling price guidance</h2>
                <p>
                  Remodeling costs depend on scope, materials, room size, labor,
                  demolition, hidden damage, trade coordination, permit needs,
                  and how much plumbing, electrical, or structural work is
                  involved.
                </p>
                <ul className="service-list">
                  <li>
                    <strong>Small updates:</strong> fixture swaps, backsplash,
                    trim, drywall repair, paint, small flooring areas.
                  </li>
                  <li>
                    <strong>Medium projects:</strong> bathroom updates, cabinet
                    replacement, shower remodels, flooring across several rooms.
                  </li>
                  <li>
                    <strong>Larger remodels:</strong> kitchens, basements,
                    room additions, wall removal, whole-home upgrades.
                  </li>
                </ul>
                <p>
                  The best way to get useful responses is to include photos,
                  approximate dimensions, current condition, target timeline,
                  and whether you already selected materials.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div className="card">
                <h2>When to hire a remodeling pro</h2>
                <ul className="service-list">
                  <li>The project affects plumbing, electrical, framing, waterproofing, or flooring prep.</li>
                  <li>You need several trades coordinated in the correct order.</li>
                  <li>You want a room redesigned instead of simply repaired.</li>
                  <li>The work may affect resale value, rental value, or inspection issues.</li>
                  <li>You need help avoiding costly mistakes with materials or layout.</li>
                  <li>The project is larger than a simple handyman repair.</li>
                </ul>
              </div>

              <div className="card">
                <h2>Urgent or high-risk remodeling cases</h2>
                <ul className="service-list">
                  <li>Water damage behind walls, under floors, or around showers and tubs.</li>
                  <li>Soft subfloor, mold concerns, or moisture in a basement.</li>
                  <li>Electrical or plumbing work discovered during demolition.</li>
                  <li>Cracked tile, failed waterproofing, or leaking bathroom areas.</li>
                  <li>Load-bearing wall questions before opening a layout.</li>
                  <li>Unsafe stairs, railings, flooring transitions, or unfinished demolition.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card card-flat">
              <h2>How to get better remodeling responses</h2>
              <p>
                A clear request helps pros understand the job faster and respond
                with fewer follow-up questions.
              </p>
              <ul className="service-list">
                <li>List the room or rooms included in the remodel.</li>
                <li>Describe what exists now and what you want changed.</li>
                <li>Add photos of the room, problem areas, fixtures, walls, floors, and access points.</li>
                <li>Include approximate dimensions or square footage.</li>
                <li>Say whether materials are already selected or need recommendations.</li>
                <li>Mention your preferred timeline and any move-in, listing, or rental deadline.</li>
              </ul>
              <Link className="button button-primary" href={getBookHref(market)}>
                Create remodeling request
              </Link>
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 ? (
          <section className="section-sm">
            <div className="container">
              <p className="eyebrow">Nearby cities</p>
              <h2>Remodeling services near {market.city}</h2>
              <div className="grid-3 gap-md">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/${CATEGORY_SLUG}`}
                    key={nearbyMarket.slug}
                  >
                    <h3>{nearbyMarket.city}, {nearbyMarket.state}</h3>
                    <p>
                      Find remodeling contractors for kitchens, bathrooms,
                      basements, interiors, flooring, cabinets, and home upgrades.
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
            <h2>Other home services often needed with remodeling</h2>
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

        <section className="section-sm">
          <div className="container container-narrow">
            <p className="eyebrow">FAQ</p>
            <h2>Remodeling FAQ in {market.city}</h2>

            <div className="service-list">
              <div className="card">
                <h3>How much does remodeling cost in {market.city}?</h3>
                <p>
                  Remodeling cost depends on project size, materials, demolition,
                  repairs, labor, and whether plumbing, electrical, structural,
                  or permit work is involved. Small updates may be simple, while
                  kitchens, basements, additions, and full-home remodels require
                  more planning and coordination.
                </p>
              </div>

              <div className="card">
                <h3>Can I request a same-day remodeling estimate?</h3>
                <p>
                  For many projects, yes. Same-day responses are most realistic
                  when your request includes photos, room size, current
                  condition, project scope, and timeline. Larger remodels may
                  still require an in-person walkthrough before pricing.
                </p>
              </div>

              <div className="card">
                <h3>Do remodeling pros help with materials?</h3>
                <p>
                  Many pros can install homeowner-provided materials or suggest
                  practical options based on durability, budget, lead time, and
                  maintenance. Your request should say whether materials are
                  already purchased or still undecided.
                </p>
              </div>

              <div className="card">
                <h3>Do I need permits for remodeling?</h3>
                <p>
                  Permit needs depend on the project and local rules. Cosmetic
                  updates may not require permits, while structural changes,
                  additions, electrical, plumbing, and major layout changes often
                  need additional review.
                </p>
              </div>

              <div className="card">
                <h3>What remodeling projects are best for resale value?</h3>
                <p>
                  Kitchens, bathrooms, flooring, paint, layout improvements, and
                  clean finish work are common resale-focused upgrades. The right
                  choice depends on the home condition, neighborhood, and budget.
                </p>
              </div>

              <div className="card">
                <h3>Can I remodel one room at a time?</h3>
                <p>
                  Yes. Many homeowners remodel in phases to control cost and
                  reduce disruption. A clear plan helps avoid redoing work later,
                  especially when flooring, paint, electrical, or layout changes
                  affect multiple rooms.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="service-cta-card">
              <p className="eyebrow">Start your project</p>
              <h2>Get remodeling help in {market.city}</h2>
              <p>
                Tell us what you want to remodel, what condition the space is in,
                and when you want the work done. Fixly turns your request into a
                clear lead for local remodeling pros.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Request remodeling service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}