import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { categories } from "@/lib/services/categories";
import { cleaningSubcategories } from "@/lib/services/subcategories/cleaning";
import { getServiceBreadcrumbs } from "@/lib/seo";

type CleaningCategoryPageProps = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=cleaning&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/cleaning/${subcategorySlug}`;
}

export default function CleaningCategoryPage({
  category,
  market,
}: CleaningCategoryPageProps) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(cleaningSubcategories);

  const popularSearches = [
    `house cleaning near me in ${market.city}`,
    `deep cleaning service in ${market.city}`,
    `move out cleaning in ${market.city}`,
    `same day cleaning in ${market.city}`,
    `apartment cleaning near me in ${market.city}`,
    `maid service in ${market.city}`,
    `office cleaning in ${market.city}`,
    `commercial cleaning in ${market.city}`,
    `Airbnb cleaning in ${market.city}`,
    `carpet cleaning near me in ${market.city}`,
    `window cleaning in ${market.city}`,
    `gutter cleaning in ${market.city}`,
    `dryer vent cleaning in ${market.city}`,
    `pet odor cleaning in ${market.city}`,
    `post construction cleaning in ${market.city}`,
    `affordable cleaning service in ${market.city}`,
  ];

  const whatProsCanHelpWith = [
    "Standard house cleaning for kitchens, bathrooms, bedrooms, and living areas",
    "Deep cleaning for buildup, dust, grease, soap scum, and detailed surfaces",
    "Move-in and move-out cleaning before inspections, listings, or new occupants",
    "Apartment, condo, rental, and short-term rental turnover cleaning",
    "Office, commercial, and janitorial cleaning for local businesses",
    "Carpet, upholstery, tile, grout, floor, and window cleaning requests",
    "Gutter cleaning, dryer vent cleaning, and exterior surface cleaning",
    "Pet stain, odor, laundry, bathroom, kitchen, and garage cleaning needs",
  ];

  const commonProblems = [
    "The home needs a full reset before guests arrive.",
    "Bathrooms or kitchens have buildup that routine cleaning does not fix.",
    "A move-out deadline, inspection, or lease handoff is coming soon.",
    "A rental or Airbnb needs cleaning between guests.",
    "Pet hair, stains, or odor are affecting carpets or furniture.",
    "Office restrooms, breakrooms, or floors need recurring upkeep.",
    "Windows, gutters, floors, or exterior surfaces need seasonal cleaning.",
    "Post-renovation dust is still on floors, trim, fixtures, or surfaces.",
  ];

  const priceFactors = [
    "Small jobs: focused bathroom, kitchen, laundry, or single-room cleaning requests.",
    "Medium jobs: standard house cleaning, apartment cleaning, carpet cleaning, window cleaning, or move-in cleaning.",
    "Larger jobs: deep cleaning, move-out cleaning, post-construction cleaning, office cleaning, janitorial service, or multi-surface cleaning.",
    "Final pricing depends on property size, condition, number of bathrooms, pets, access, urgency, and requested extras.",
  ];

  const betterResponses = [
    "Property type: house, apartment, condo, office, rental, or commercial space",
    "Approximate size, bedrooms, bathrooms, or square footage",
    "Cleaning type: standard, deep, move-in, move-out, recurring, or urgent",
    "Priority areas such as kitchen, bathrooms, floors, windows, carpets, or gutters",
    "Photos of buildup, stains, clutter, pet areas, or construction dust",
    "Timing, deadline, parking, building access, pets, and whether supplies are needed",
  ];

  const relatedCategorySlugs = [
    "handyman",
    "plumbing",
    "electrical",
    "painting",
    "appliances",
    "roofing",
    "remodeling",
    "property-maintenance",
  ];

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
            <p className="eyebrow">Cleaning services</p>

            <h1>
              Cleaning Services in {market.city}, {market.state}
            </h1>

            <p className="hero-text">
              Find local cleaning pros for house cleaning, deep cleaning,
              move-out cleaning, apartment cleaning, maid service, office
              cleaning, Airbnb turnover cleaning, carpet cleaning, window
              cleaning, gutter cleaning, and more. Fixly helps you turn a
              cleaning need into a clear request local pros can respond to.
            </p>

            <div className="flex gap-sm">
              <Link href={getBookHref(market)} className="button button-primary">
                Request cleaning help
              </Link>

              <a href="#cleaning-services" className="button button-secondary">
                Browse cleaning services
              </a>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Quick request</p>
                <h2>Need cleaning help in {market.city}?</h2>
                <p>
                  Describe the property, cleaning type, timing, and priority
                  areas. Your request can become a public marketplace listing
                  so local cleaning pros can review the scope and respond.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Start a cleaning request
              </Link>
            </div>
          </div>
        </section>

        <section className="section" id="cleaning-services">
          <div className="container">
            <p className="eyebrow">Cleaning service directory</p>
            <h2>Cleaning services you can request in {market.city}</h2>
            <p>
              Use this cleaning hub to reach high-intent service pages for the
              most common residential, rental, commercial, and specialty
              cleaning needs.
            </p>

            <div className="grid-3">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  href={getServiceHref(market, subcategory.slug)}
                  className="card card-hover"
                >
                  <h3>{subcategory.title}</h3>
                  <p>{subcategory.description}</p>
                  <span className="badge badge-primary">
                    From ${subcategory.priceMin}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">Popular searches</p>
              <h2>Popular cleaning searches in {market.city}</h2>

              <ul className="service-seo-list">
                {popularSearches.map((phrase) => (
                  <li key={phrase}>{phrase}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">What pros can help with</p>
                <h2>Cleaning jobs local pros handle</h2>

                <ul className="service-list">
                  {whatProsCanHelpWith.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Common use cases</p>
                <h2>When people request cleaning help</h2>

                <ul className="service-list">
                  {commonProblems.map((item) => (
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
              <h2>How cleaning prices are usually estimated</h2>

              <p>
                Cleaning prices should be treated as guidance, not a fixed
                promise. A small focused job can be priced very differently from
                a full deep clean, move-out clean, post-construction clean, or
                recurring commercial cleaning plan.
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
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">When to hire a pro</p>
                <h2>When professional cleaning makes sense</h2>

                <ul className="service-list">
                  <li>You need a cleaner result than routine home cleaning.</li>
                  <li>You are working against a move, listing, or guest deadline.</li>
                  <li>The job includes buildup, stains, odor, dust, or heavy-use areas.</li>
                  <li>You need recurring help for a home, office, rental, or business.</li>
                  <li>The cleaning requires equipment, access, or more than one person.</li>
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>Cleaning jobs that may need faster help</h2>

                <ul className="service-list">
                  <li>Move-out cleaning before inspection or key handoff</li>
                  <li>Same-day Airbnb or vacation rental turnover</li>
                  <li>Post-construction dust before move-in or opening</li>
                  <li>Pet odor, carpet stains, or spill cleanup before guests</li>
                  <li>Overflowing gutters or clogged downspouts before rain</li>
                  <li>Dryer vent symptoms such as overheating or burning smell</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <p className="eyebrow">Better request quality</p>
              <h2>How to get better responses from cleaning pros</h2>

              <p>
                Cleaning requests get better responses when the scope is clear.
                Instead of writing only “need cleaning,” explain the property,
                rooms, condition, timing, and special tasks.
              </p>

              <ul className="service-list">
                {betterResponses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {market.nearby.length > 0 && (
          <section className="section">
            <div className="container">
              <p className="eyebrow">Nearby cities</p>
              <h2>Cleaning services near {market.city}</h2>

              <div className="grid-3">
                {market.nearby.map((city) => {
                  const nearbyMarket = getMarketByCity(city);

                  if (!nearbyMarket) {
                    return null;
                  }

                  return (
                    <Link
                      key={nearbyMarket.slug}
                      href={`${getMarketUrlPath(nearbyMarket)}/cleaning`}
                      className="card card-hover"
                    >
                      <h3>
                        Cleaning Services in {nearbyMarket.city},{" "}
                        {nearbyMarket.state}
                      </h3>
                      <p>
                        Request local cleaning help in {nearbyMarket.city} for
                        homes, apartments, rentals, offices, and specialty
                        cleaning jobs.
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="section-sm">
          <div className="container">
            <p className="eyebrow">Related services</p>
            <h2>Related home services in {market.city}</h2>

            <div className="grid-4">
              {relatedCategorySlugs.map((slug) => {
                const relatedCategory = categories[slug];

                if (!relatedCategory) {
                  return null;
                }

                return (
                  <Link
                    key={relatedCategory.slug}
                    href={`${getMarketUrlPath(market)}/${relatedCategory.slug}`}
                    className="card card-hover"
                  >
                    <h3>{relatedCategory.title}</h3>
                    <p>{relatedCategory.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">FAQ</p>
            <h2>Cleaning services FAQ</h2>

            <div className="grid-2">
              <div className="card">
                <h3>How much does cleaning cost in {market.city}?</h3>
                <p>
                  Cost depends on property size, cleaning type, condition,
                  number of bathrooms, pets, access, urgency, and extras such
                  as inside appliances, windows, carpet, or grout.
                </p>
              </div>

              <div className="card">
                <h3>Can I request same-day cleaning?</h3>
                <p>
                  Yes. Same-day cleaning depends on local pro availability, job
                  size, location, and how detailed the cleaning needs to be.
                </p>
              </div>

              <div className="card">
                <h3>What is the difference between standard and deep cleaning?</h3>
                <p>
                  Standard cleaning handles routine upkeep. Deep cleaning
                  usually targets heavier buildup, detailed surfaces, baseboards,
                  kitchens, bathrooms, and harder-to-clean areas.
                </p>
              </div>

              <div className="card">
                <h3>Can I book cleaning for a rental or Airbnb?</h3>
                <p>
                  Yes. Fixly supports cleaning requests for apartments, rental
                  units, Airbnb properties, vacation rentals, and turnover
                  cleaning between guests.
                </p>
              </div>

              <div className="card">
                <h3>Do cleaning pros bring supplies?</h3>
                <p>
                  Many pros bring supplies, but you should mention if you need
                  supplies provided or if you prefer specific products.
                </p>
              </div>

              <div className="card">
                <h3>Can I request recurring cleaning?</h3>
                <p>
                  Yes. You can request weekly, bi-weekly, monthly, office,
                  commercial, janitorial, or custom recurring cleaning schedules.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Start now</p>
                <h2>Request cleaning help in {market.city}</h2>
                <p>
                  Create a cleaning request with the property type, timing,
                  priority areas, and photos. Fixly will turn it into a clear
                  local service request.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Request cleaning service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}