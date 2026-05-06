import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { maintenanceSubcategories } from "@/lib/services/subcategories/maintenance";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=maintenance&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/maintenance/${subcategorySlug}`;
}

const popularSearches = [
  "home maintenance services in",
  "same day home maintenance in",
  "property maintenance near",
  "rental property maintenance in",
  "seasonal home maintenance in",
  "preventive home maintenance near",
  "home maintenance cost in",
  "affordable home maintenance in",
  "best home maintenance company in",
  "local maintenance pro in",
  "minor home repairs in",
  "move out maintenance in",
  "gutter maintenance in",
  "commercial property maintenance in",
  "urgent property maintenance in",
  "residential maintenance services in",
];

const proHelpItems = [
  "General home maintenance and small repair punch lists",
  "Seasonal maintenance before heat, rain, storms, or cold weather",
  "Preventive checks for doors, fixtures, hardware, gutters, and exterior areas",
  "Rental property maintenance, tenant repair requests, and turnover repairs",
  "Move-in and move-out repairs before deadlines",
  "Exterior maintenance, curb appeal preparation, and entry area repairs",
  "Gutter cleaning, downspout checks, and drainage-related maintenance",
  "Commercial maintenance for offices, retail spaces, and small business properties",
];

const commonUseCases = [
  "Several small repairs have built up around the home.",
  "A rental property needs repairs before the next tenant.",
  "A home needs seasonal maintenance before weather changes.",
  "A move-out punch list needs to be completed quickly.",
  "A vacant or managed property needs a maintenance walk-through.",
  "Gutters, downspouts, doors, trim, or exterior fixtures need attention.",
  "A business space has maintenance issues that affect customers or staff.",
  "A homeowner wants preventive maintenance before small issues become expensive.",
];

const priceTiers = [
  {
    title: "Small maintenance visit",
    description:
      "Good for one or two minor items, quick fixture checks, small adjustments, or simple punch list repairs.",
  },
  {
    title: "Medium punch list",
    description:
      "Best for several tasks across the home, seasonal upkeep, move-out repairs, or rental turnover maintenance.",
  },
  {
    title: "Larger maintenance project",
    description:
      "Used when the property needs exterior work, multiple visits, commercial support, materials, access coordination, or urgent readiness work.",
  },
];

const hireProItems = [
  "You have multiple small tasks and want them handled in one request.",
  "The property is being prepared for sale, rent, move-in, move-out, or inspection.",
  "The issue may affect safety, water control, access, curb appeal, or tenant satisfaction.",
  "You need photos, notes, or a prioritized maintenance plan before repairs.",
  "The work requires ladders, tools, materials, or experienced repair judgment.",
];

const urgentItems = [
  "Water is entering the property or draining toward the foundation.",
  "A door, lock, entry, stair, or walkway issue affects safe access.",
  "A tenant repair request affects habitability or business operations.",
  "A move-in, move-out, sale, inspection, or turnover deadline is close.",
  "Storm, rain, or exterior damage needs quick review before it gets worse.",
];

const betterResponseItems = [
  "List each task separately instead of writing one vague sentence.",
  "Add photos of every issue, including close-up and wider context shots.",
  "Mention property type, access details, parking, pets, gates, and preferred timing.",
  "State whether materials are already on site or need to be supplied.",
  "Mark what is urgent and what can wait.",
  "Include deadline details for rentals, move-outs, listings, inspections, or business spaces.",
];

const faq = [
  {
    question: "How much does maintenance service cost?",
    answer:
      "Maintenance cost depends on the number of tasks, property condition, materials, access, urgency, and whether the work is a small visit, a punch list, or a larger maintenance project.",
  },
  {
    question: "Can I request same-day maintenance?",
    answer:
      "Same-day maintenance may be available depending on local pro availability, job size, materials, access, weather, and urgency. Clear photos help pros respond faster.",
  },
  {
    question: "What maintenance services can I request?",
    answer:
      "You can request home maintenance, seasonal upkeep, preventive maintenance, rental property repairs, move-in and move-out punch lists, exterior maintenance, gutter maintenance, inspection-related maintenance, and commercial property maintenance.",
  },
  {
    question: "Is maintenance different from handyman work?",
    answer:
      "Maintenance can include handyman-style repairs, but it is broader. It may include preventive checks, seasonal upkeep, rental turnover tasks, exterior care, and property readiness work.",
  },
  {
    question: "Can landlords use Fixly for rental maintenance?",
    answer:
      "Yes. Landlords and property managers can request tenant repairs, turnover maintenance, vacant property checks, move-out repairs, and recurring maintenance support.",
  },
  {
    question: "Should I request maintenance or a licensed trade?",
    answer:
      "Use maintenance for general upkeep and small repairs. Use a licensed trade for major electrical, plumbing, HVAC, roofing, structural, or code-sensitive work.",
  },
  {
    question: "What should I include in my request?",
    answer:
      "Include a task list, photos, property type, access details, materials, timing, urgency, and any deadlines related to rent, sale, inspection, or move-out.",
  },
];

export default function MaintenanceCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(maintenanceSubcategories);

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((nearbyMarket): nearbyMarket is Market => Boolean(nearbyMarket));

  const relatedCategories = [
    "handyman",
    "cleaning",
    "lawn-care",
    "pressure-washing",
    "plumbing",
    "electrical",
    "roofing",
    "remodeling",
  ]
    .map((slug) => getCategoryBySlug(slug))
    .filter((relatedCategory): relatedCategory is Category =>
      Boolean(relatedCategory)
    );

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="service-hero">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">Maintenance services</p>
                <h1>
                  Maintenance Services in {market.city}, {market.state}
                </h1>
                <p className="hero-text">
                  Find local maintenance pros for home upkeep, rental property
                  repairs, seasonal maintenance, preventive checks, move-in and
                  move-out punch lists, exterior maintenance, gutter
                  maintenance, and small commercial property needs in{" "}
                  {market.city}.
                </p>
                <div className="flex gap-sm">
                  <Link className="button button-primary" href={getBookHref(market)}>
                    Request maintenance
                  </Link>
                  <a className="button button-secondary" href="#maintenance-services">
                    View services
                  </a>
                </div>
              </div>

              <div className="card">
                <p className="eyebrow">Built for high-intent requests</p>
                <h2>One request. Clear scope. Local responses.</h2>
                <p>
                  Maintenance jobs often include several small issues. Fixly
                  helps you turn a task list, photos, timing, and access notes
                  into a clear request that local pros can review quickly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <p className="eyebrow">Quick request</p>
              <h2>Need maintenance help in {market.city}?</h2>
              <p>
                Describe the property, list the tasks, add photos, and choose
                your preferred timing. Fixly creates a clear maintenance request
                so local pros can respond with next steps.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Start maintenance request
              </Link>
            </div>
          </div>
        </section>

        <section className="section" id="maintenance-services">
          <div className="container">
            <p className="eyebrow">All maintenance services</p>
            <h2>Maintenance services you can request in {market.city}</h2>
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
            <h2>Popular maintenance searches in {market.city}</h2>
            <ul className="service-seo-list">
              {popularSearches.map((search) => (
                <li key={search}>
                  {search} {market.city}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">What pros can help with</p>
                <h2>Practical maintenance support</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow">Common use cases</p>
                <h2>When maintenance requests happen</h2>
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
            <h2>How maintenance pricing usually works</h2>
            <p>
              Maintenance pricing depends on scope, number of tasks, property
              condition, materials, access, timing, documentation needs, and
              urgency. A simple task may be handled as a small visit, while
              rental turnovers, exterior maintenance, and commercial punch
              lists may require more planning.
            </p>
            <div className="grid-3 gap-md">
              {priceTiers.map((tier) => (
                <div className="card-flat" key={tier.title}>
                  <h3>{tier.title}</h3>
                  <p>{tier.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">When to hire a pro</p>
                <h2>Do not let small maintenance become bigger repairs</h2>
                <ul className="service-list">
                  {hireProItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow">Urgent cases</p>
                <h2>Maintenance issues that should move faster</h2>
                <ul className="service-list">
                  {urgentItems.map((item) => (
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
            <h2>How to get better maintenance responses</h2>
            <ul className="service-list">
              {betterResponseItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {nearbyMarkets.length > 0 ? (
          <section className="section-sm">
            <div className="container">
              <p className="eyebrow">Nearby cities</p>
              <h2>Maintenance services near {market.city}</h2>
              <div className="grid-3 gap-md">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/maintenance`}
                    key={nearbyMarket.slug}
                  >
                    <h3>{nearbyMarket.city}</h3>
                    <p>
                      Request maintenance services in {nearbyMarket.city},{" "}
                      {nearbyMarket.state}.
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {relatedCategories.length > 0 ? (
          <section className="section-sm">
            <div className="container">
              <p className="eyebrow">Related categories</p>
              <h2>Other services often requested with maintenance</h2>
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
        ) : null}

        <section className="section-sm">
          <div className="container">
            <p className="eyebrow">FAQ</p>
            <h2>Maintenance services FAQ</h2>
            <div className="grid-2 gap-md">
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
            <div className="service-cta-card">
              <p className="eyebrow">Request maintenance</p>
              <h2>Get maintenance help in {market.city}</h2>
              <p>
                Send one clear request with your task list, photos, access
                notes, timing, and urgency. Local maintenance pros can review
                the scope and respond with next steps.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Book maintenance service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}