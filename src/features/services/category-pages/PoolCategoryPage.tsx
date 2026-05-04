import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { poolSubcategories } from "@/lib/services/subcategories/pool";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=pool&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/pool/${subcategorySlug}`;
}

const popularSearches = [
  "pool service near me",
  "pool cleaning near me",
  "weekly pool service near me",
  "same day pool cleaning",
  "emergency pool repair",
  "pool pump repair near me",
  "pool leak detection near me",
  "green pool cleanup near me",
  "pool heater repair near me",
  "pool filter cleaning service",
  "pool chemical balancing service",
  "affordable pool service",
  "licensed pool repair pro",
  "residential pool service",
  "commercial pool service",
  "pool maintenance cost",
  "pool repair price",
  "best pool service company",
];

const proHelpItems = [
  "One-time pool cleaning before guests, photos, move-in, or home sale",
  "Weekly and recurring pool maintenance for clear, balanced water",
  "Green pool cleanup, algae treatment, brushing, filtration, and recovery",
  "Pool pump, filter, heater, salt system, timer, and automation troubleshooting",
  "Pool leak detection, plumbing repair, valve repair, and equipment pad leaks",
  "Tile, coping, surface, and seasonal pool opening or closing work",
];

const commonUseCases = [
  "The pool is cloudy, green, dirty, or has visible algae",
  "The pump is loud, leaking, losing prime, or not circulating water",
  "The filter pressure is high or water clarity does not improve",
  "The heater will not turn on or shows an error code",
  "Water level is dropping faster than normal evaporation",
  "The pool needs recurring maintenance instead of one-time cleanup",
  "The pool needs inspection before buying, selling, renting, or reopening",
];

const priceFactors = [
  "Pool size, type, depth, and current water condition",
  "One-time service versus weekly or recurring maintenance",
  "Amount of debris, algae, brushing, vacuuming, or chemical treatment needed",
  "Equipment type, age, access, brand, and repair complexity",
  "Whether parts, replacement equipment, plumbing work, or resurfacing is needed",
  "Urgency, same-day availability, seasonality, and local pro capacity",
];

const hireProItems = [
  "Water chemistry is difficult to stabilize or the pool keeps turning cloudy",
  "The pool is green, unsafe to swim in, or needs a full recovery process",
  "The pump, heater, filter, plumbing, or electrical-connected equipment is failing",
  "You suspect a leak or unexplained water loss",
  "You need recurring maintenance and want fewer pool problems during the season",
  "The job affects safety, sanitation, equipment lifespan, or property value",
];

const urgentItems = [
  "Strong chemical smell, eye irritation, or unsafe water conditions",
  "Pump not running during hot weather or after chemical treatment",
  "Fast water loss, visible leak, or flooding around the equipment pad",
  "Heater, pump, or electrical-connected pool equipment behaving unpredictably",
  "Green pool that needs cleanup before guests, renters, inspection, or listing photos",
];

const betterResponses = [
  "Pool type, size, depth, and whether it is residential or commercial",
  "Current water condition: clear, cloudy, green, dark green, or debris-filled",
  "Photos of the pool, equipment pad, pump, filter, heater, and visible damage",
  "Last service date and whether you need one-time or recurring service",
  "Specific equipment brand, model, error code, noise, leak, or pressure issue",
  "Gate access, pets, preferred schedule, urgency, and parking instructions",
];

const faq = [
  {
    question: "How much does pool service cost?",
    answer:
      "Pool service cost depends on pool size, water condition, service frequency, equipment condition, chemicals, parts, access, and urgency. Basic cleaning is usually less expensive than green pool recovery, leak detection, equipment repair, resurfacing, or heater installation.",
  },
  {
    question: "Can I request same-day pool service?",
    answer:
      "Yes, same-day pool help may be possible depending on local pro availability, the type of service needed, and how urgent the issue is. Clear photos and a specific problem description help pros respond faster.",
  },
  {
    question: "What pool services can pros handle?",
    answer:
      "Pool pros can help with cleaning, weekly maintenance, chemical balancing, green pool cleanup, filter cleaning, pump repair, heater repair, leak detection, plumbing repair, equipment installation, tile repair, resurfacing, and seasonal opening or closing.",
  },
  {
    question: "Should I hire a pool pro for green water?",
    answer:
      "Yes. Green pool cleanup often requires testing, chemical treatment, brushing, filtration, filter cleaning, and follow-up. A pro can identify whether the issue is only algae or also poor circulation, filter problems, or equipment failure.",
  },
  {
    question: "What should I include in a pool repair request?",
    answer:
      "Include the pool type, size, water condition, equipment photos, visible leaks, error codes, noises, water loss amount, last service date, and whether the request is urgent.",
  },
  {
    question: "Do pool pros handle both residential and commercial pools?",
    answer:
      "Many pool pros handle residential pools, and some also work on commercial pools, HOA pools, rental properties, hotels, gyms, and managed properties. Include the property type in your request so the right pros can respond.",
  },
];

const relatedCategorySlugs = [
  "cleaning",
  "pressure-washing",
  "plumbing",
  "electrical",
  "landscaping",
  "property-maintenance",
];

export default function PoolCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(poolSubcategories);

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
            <p className="eyebrow">Pool services</p>
            <h1>
              Pool Services in {market.city}, {market.state}
            </h1>
            <p className="hero-text">
              Find local pool pros for cleaning, weekly maintenance, green pool
              cleanup, chemical balancing, pump repair, heater repair, leak
              detection, filter cleaning, equipment installation, tile repair,
              resurfacing, and seasonal pool care.
            </p>

            <div className="flex gap-sm">
              <Link href={getBookHref(market)} className="button button-primary">
                Request pool service
              </Link>
              <Link href="#pool-services" className="button button-secondary">
                Browse pool services
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Quick request</p>
                <h2>Need pool help in {market.city}?</h2>
                <p>
                  Describe the pool issue, upload photos, choose your service
                  type, and let local pool pros understand the job before they
                  respond.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Start a pool request
              </Link>
            </div>
          </div>
        </section>

        <section id="pool-services" className="section">
          <div className="container">
            <p className="eyebrow">Pool service hub</p>
            <h2>Pool cleaning, maintenance, repair, and equipment services</h2>
            <p>
              Pool jobs are high-intent because homeowners often need help fast:
              cloudy water, algae, pump failure, heater problems, leaks, filter
              pressure, chemical imbalance, or recurring maintenance. These
              pages turn pool searches into clear service requests.
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
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">Popular searches</p>
            <h2>High-intent pool searches in {market.city}</h2>

            <div className="service-seo-list">
              {popularSearches.map((phrase) => (
                <span key={phrase}>
                  {phrase.includes("near me") || phrase.includes("cost")
                    ? phrase
                    : `${phrase} in ${market.city}`}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">What pros can help with</p>
            <h2>Pool work local pros can handle</h2>

            <div className="grid-2">
              {proHelpItems.map((item) => (
                <div key={item} className="card">
                  <h3>{item}</h3>
                  <p>
                    Use Fixly to describe the scope, timing, photos, property
                    type, and service goal so the request is clear from the
                    start.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">Common problems</p>
            <h2>Common pool service requests</h2>

            <div className="grid-2">
              {commonUseCases.map((item) => (
                <div key={item} className="card-flat">
                  <h3>{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">Price guidance</p>
            <h2>Pool service cost factors</h2>

            <div className="grid-3">
              <div className="card">
                <h3>Small jobs</h3>
                <p>
                  Basic cleaning, water testing, chemical balancing, basket
                  cleaning, minor troubleshooting, and one-time maintenance are
                  usually simpler when the pool is accessible and in fair
                  condition.
                </p>
              </div>

              <div className="card">
                <h3>Medium jobs</h3>
                <p>
                  Green pool cleanup, filter cleaning, pump diagnostics, heater
                  troubleshooting, leak checks, and recurring maintenance usually
                  depend on condition, access, and follow-up needs.
                </p>
              </div>

              <div className="card">
                <h3>Larger jobs</h3>
                <p>
                  Pump replacement, heater installation, plumbing repair, tile
                  and coping repair, resurfacing, and equipment upgrades can
                  require parts, scheduling, inspections, or multiple visits.
                </p>
              </div>
            </div>

            <div className="grid-2">
              {priceFactors.map((item) => (
                <div key={item} className="card-flat">
                  <h3>{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">When to hire a pro</p>
            <h2>When pool service should not wait</h2>

            <div className="grid-2">
              {hireProItems.map((item) => (
                <div key={item} className="card">
                  <h3>{item}</h3>
                  <p>
                    A detailed request helps a pool pro understand whether the
                    job is cleaning, maintenance, repair, replacement,
                    inspection, or troubleshooting.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">Urgent pool issues</p>
            <h2>Urgent or high-risk pool cases</h2>

            <div className="grid-2">
              {urgentItems.map((item) => (
                <div key={item} className="card">
                  <span className="badge badge-warning">Urgent</span>
                  <h3>{item}</h3>
                  <p>
                    Include photos, equipment details, water condition, and how
                    soon you need help. Do not swim if the water condition is
                    unsafe or unclear.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">Better responses</p>
            <h2>How to get better pool service responses</h2>

            <div className="grid-2">
              {betterResponses.map((item) => (
                <div key={item} className="card-flat">
                  <h3>{item}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {nearbyMarkets.length > 0 && (
          <section className="section">
            <div className="container">
              <p className="eyebrow">Nearby cities</p>
              <h2>Pool services near {market.city}</h2>

              <div className="grid-3">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    href={`${getMarketUrlPath(nearbyMarket)}/pool`}
                    className="card card-hover"
                  >
                    <h3>
                      Pool services in {nearbyMarket.city},{" "}
                      {nearbyMarket.state}
                    </h3>
                    <p>
                      Find pool cleaning, maintenance, repair, leak detection,
                      and equipment pros near {nearbyMarket.city}.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedCategories.length > 0 && (
          <section className="section">
            <div className="container">
              <p className="eyebrow">Related categories</p>
              <h2>Related home services in {market.city}</h2>

              <div className="grid-3">
                {relatedCategories.map((relatedCategory) => (
                  <Link
                    key={relatedCategory.slug}
                    href={`${getMarketUrlPath(market)}/${relatedCategory.slug}`}
                    className="card card-hover"
                  >
                    <h3>{relatedCategory.title}</h3>
                    {relatedCategory.description ? (
                      <p>{relatedCategory.description}</p>
                    ) : (
                      <p>
                        Explore related services in {market.city},{" "}
                        {market.state}.
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <p className="eyebrow">FAQ</p>
            <h2>Pool service questions</h2>

            <div className="grid-2">
              {faq.map((item) => (
                <div key={item.question} className="card">
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
              <div>
                <p className="eyebrow">Get started</p>
                <h2>Request pool service in {market.city}</h2>
                <p>
                  Submit one clear pool request for cleaning, maintenance,
                  repair, equipment troubleshooting, leak detection, or seasonal
                  service.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Request pool service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}