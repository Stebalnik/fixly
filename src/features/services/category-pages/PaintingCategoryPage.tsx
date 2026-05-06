import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";

import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";

import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";

import { paintingSubcategories } from "@/lib/services/subcategories/painting";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

const relatedCategorySlugs = [
  "handyman",
  "remodeling",
  "flooring",
  "cleaning",
];

function getBookHref(market: Market) {
  return `/book?category=painting&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/painting/${subcategorySlug}`;
}

export default function PaintingCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(paintingSubcategories);

  const relatedCategories = relatedCategorySlugs
    .map((slug) => getCategoryBySlug(slug))
    .filter(
      (relatedCategory): relatedCategory is Category =>
        Boolean(relatedCategory)
    );

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="section">
          <div className="container">
            <div className="service-hero">
              <div className="hero-text">
                <div className="eyebrow">
                  Painting Services in {market.city}
                </div>

                <h1>
                  Painting Services in {market.city}, {market.state}
                </h1>

                <p>
                  Professional painting services for homes and businesses in{" "}
                  {market.city}. From interior and exterior painting to
                  cabinets, ceilings, drywall finishing, and full surface
                  preparation, Fixly helps you request local painting help
                  without calling multiple companies one by one.
                </p>

                <div className="flex gap-md">
                  <Link
                    href={getBookHref(market)}
                    className="button button-primary"
                  >
                    Get Painting Quotes
                  </Link>

                  <a href="#services" className="button button-outline">
                    Browse Services
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <h3>Need painting help in {market.city}?</h3>
              <p>
                Submit one request for your painting project and let local pros
                understand the scope, timing, surface condition, and type of
                finish you need.
              </p>

              <Link
                href={getBookHref(market)}
                className="button button-primary"
              >
                Request Painting Service
              </Link>
            </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="container">
            <h2>Painting Services</h2>

            <div className="grid-3">
              {subcategories.map((service) => (
                <Link
                  key={service.slug}
                  href={getServiceHref(market, service.slug)}
                  className="card card-hover"
                >
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <h2>Popular painting searches in {market.city}</h2>

            <div className="service-seo-list">
              <span>painting services near me</span>
              <span>interior painters {market.city}</span>
              <span>exterior house painting {market.city}</span>
              <span>same day painting service</span>
              <span>affordable painters {market.city}</span>
              <span>cabinet painting near me</span>
              <span>ceiling painting service</span>
              <span>deck staining and painting</span>
              <span>drywall painting and finishing</span>
              <span>commercial painters {market.city}</span>
              <span>wall painting touch ups</span>
              <span>popcorn ceiling removal near me</span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>What painting pros can help with</h2>

            <ul className="service-list">
              <li>Interior wall and ceiling painting</li>
              <li>Exterior house painting and trim painting</li>
              <li>Cabinet painting and refinishing</li>
              <li>Drywall painting, texture blending, and touch-ups</li>
              <li>Deck, fence, porch, and outdoor wood staining</li>
              <li>Commercial repainting for offices and retail spaces</li>
              <li>Surface preparation, priming, masking, and cleanup</li>
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Common painting projects</h2>

            <ul className="service-list">
              <li>Preparing a home for sale, rent, or move-in</li>
              <li>Updating outdated colors in bedrooms or living areas</li>
              <li>Fixing wall marks, scratches, stains, and patch areas</li>
              <li>Refreshing cabinets without replacing them</li>
              <li>Repairing peeling, faded, or weathered exterior paint</li>
              <li>Improving curb appeal before listing a property</li>
              <li>Repainting rental units between tenants</li>
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Painting cost in {market.city}</h2>

            <p>
              Painting prices depend on the size of the project, surface
              condition, preparation work, number of coats, paint type,
              accessibility, and whether repairs are needed before painting.
            </p>

            <ul className="service-list">
              <li>
                Small jobs: touch-ups, one wall, one small room, doors, or trim
              </li>
              <li>
                Medium jobs: multiple rooms, cabinets, ceilings, or rental
                repainting
              </li>
              <li>
                Larger jobs: full interiors, full exteriors, stucco, decks, or
                commercial spaces
              </li>
            </ul>

            <p>
              To get a better estimate, include photos, room count, approximate
              square footage, surface condition, and whether paint is already
              selected or needs to be supplied.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>When to hire a painting professional</h2>

            <ul className="service-list">
              <li>You want a cleaner finish than a basic DIY repaint</li>
              <li>The surface needs patching, sanding, priming, or texture work</li>
              <li>The project involves high ceilings, ladders, or exterior work</li>
              <li>You need fast turnaround before moving, selling, or renting</li>
              <li>You need cabinets, trim, or detailed surfaces painted evenly</li>
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Urgent painting situations</h2>

            <ul className="service-list">
              <li>Move-in or move-out repainting with a short deadline</li>
              <li>Water stains or wall repairs that need repainting</li>
              <li>Commercial spaces that must reopen quickly</li>
              <li>Exterior peeling that may expose surfaces to weather damage</li>
              <li>Last-minute touch-ups before listing photos or inspections</li>
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>How to get better responses from painters</h2>

            <ul className="service-list">
              <li>Describe what needs to be painted</li>
              <li>Include the number of rooms or surfaces</li>
              <li>Share the approximate square footage if you know it</li>
              <li>Mention wall damage, stains, peeling, or texture issues</li>
              <li>Say whether paint and materials are already selected</li>
              <li>Add photos when possible</li>
              <li>Include your preferred timeline</li>
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Painting services near {market.city}</h2>

            <div className="flex gap-md">
              {market.nearby?.map((city) => {
                const nearbyMarket = getMarketByCity(city);

                if (!nearbyMarket) {
                  return null;
                }

                return (
                  <Link
                    key={city}
                    href={`${getMarketUrlPath(nearbyMarket)}/painting`}
                    className="button button-secondary"
                  >
                    {city}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Related services</h2>

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

        <section className="section">
          <div className="container">
            <h2>Painting FAQ</h2>

            <div className="service-list">
              <div>
                <strong>How much does painting cost?</strong>
                <p>
                  Painting cost depends on the number of rooms or surfaces,
                  preparation work, paint type, number of coats, and project
                  timing. Small touch-ups cost less than full interior or
                  exterior repainting.
                </p>
              </div>

              <div>
                <strong>Can I get same-day painting service?</strong>
                <p>
                  Same-day help may be possible for small touch-ups, single-room
                  jobs, move-out repainting, or urgent repairs, depending on
                  local availability.
                </p>
              </div>

              <div>
                <strong>Do painters bring paint and materials?</strong>
                <p>
                  Many painters can provide paint, primer, rollers, tape,
                  coverings, and basic materials. You can also provide your own
                  paint if you already selected a color and finish.
                </p>
              </div>

              <div>
                <strong>Do walls need to be repaired before painting?</strong>
                <p>
                  Small nail holes, dents, cracks, stains, and drywall patches
                  should usually be repaired or primed before painting for a
                  smoother finish.
                </p>
              </div>

              <div>
                <strong>Can painters help with exterior surfaces?</strong>
                <p>
                  Yes. Exterior painters can handle siding, stucco, trim,
                  shutters, doors, decks, fences, and other outdoor surfaces
                  depending on condition and access.
                </p>
              </div>

              <div>
                <strong>How do I get better painting quotes?</strong>
                <p>
                  Include photos, room count, approximate square footage, paint
                  preferences, surface condition, and your deadline. Clear
                  details help pros respond with more accurate pricing.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="service-cta-card">
              <h3>Start your painting project in {market.city}</h3>
              <p>
                Tell Fixly what needs to be painted and get connected with local
                painting pros for your home or business.
              </p>

              <Link
                href={getBookHref(market)}
                className="button button-primary"
              >
                Get Painting Quotes
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}