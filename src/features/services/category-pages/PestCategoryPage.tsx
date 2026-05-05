import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { pestSubcategories } from "@/lib/services/subcategories/pest";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=pest&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/pest/${subcategorySlug}`;
}

const popularSearches = [
  "pest control near me",
  "same day pest control",
  "emergency pest control",
  "pest inspection near me",
  "termite inspection cost",
  "roach exterminator near me",
  "ant exterminator near me",
  "rodent control near me",
  "bed bug treatment near me",
  "wasp nest removal near me",
  "affordable pest control",
  "licensed pest control company",
  "residential pest control",
  "commercial pest control",
  "local pest control pro",
  "best pest control service",
];

const proHelpItems = [
  "Inspect visible pest activity and likely entry points",
  "Identify whether the issue is insects, rodents, wildlife, or mixed activity",
  "Recommend treatment, trapping, exclusion, or prevention steps",
  "Handle repeat problems with a clearer plan instead of one-off guesswork",
  "Explain preparation steps for bedrooms, kitchens, yards, or commercial spaces",
  "Help prevent pests from returning through sealing, sanitation, and monitoring",
];

const commonUseCases = [
  "Ants, roaches, spiders, fleas, ticks, mosquitoes, wasps, and hornets",
  "Mice, rats, attic activity, crawlspace activity, and suspected entry points",
  "Termite inspections, swarm concerns, mud tubes, and wood damage checks",
  "Bed bug concerns after travel, rental turnover, or unexplained bites",
  "Seasonal pest prevention for yards, garages, basements, and entry points",
  "Commercial pest prevention for restaurants, offices, warehouses, and rentals",
];

const priceFactors = [
  "Type of pest and severity of activity",
  "Size of the home, yard, attic, crawlspace, or commercial space",
  "Whether the job requires inspection, treatment, removal, exclusion, or follow-up",
  "Accessibility of nests, entry points, wall voids, attic spaces, and crawlspaces",
  "Urgency, same-day timing, repeat visits, and prevention plan requirements",
];

const hireProItems = [
  "You see recurring pests after cleaning or using store-bought products",
  "There are droppings, nests, bites, wood damage, or scratching sounds",
  "The pest may spread quickly, contaminate food areas, or damage the home",
  "The nest, infestation, or entry point is hard to reach safely",
  "You need documentation or recurring prevention for a rental or business",
];

const urgentCases = [
  "Stinging insects near doors, walkways, children, pets, or high-traffic areas",
  "Rodent activity around wiring, insulation, attic spaces, or stored food",
  "Possible bed bugs in bedrooms, rental units, hotels, or shared housing",
  "Termite swarmers, mud tubes, or visible wood damage",
  "Commercial pest activity before an inspection or reopening deadline",
];

const betterResponseTips = [
  "Mention the pest type if you know it, or describe what you saw",
  "Add photos of pests, droppings, nests, bites, damage, or entry points",
  "List the affected rooms, yard areas, attic, garage, crawlspace, or business space",
  "Explain whether this is new, recurring, seasonal, or already treated before",
  "Include pets, children, tenant access, business hours, and timing needs",
];

const faq = [
  {
    question: "How much does pest control cost?",
    answer:
      "Pest control cost depends on the pest type, severity, property size, access, urgency, and whether follow-up visits or exclusion work are needed. A small inspection or basic treatment usually costs less than termite, bed bug, rodent, or wildlife work.",
  },
  {
    question: "Can I request same-day pest control?",
    answer:
      "Yes. Same-day availability depends on local pro schedules and the type of pest issue. For urgent cases, include clear photos, the affected area, and whether people or pets are at risk.",
  },
  {
    question: "Do I need pest inspection before treatment?",
    answer:
      "For unknown activity, termite concerns, rodents, bed bugs, or recurring problems, inspection helps identify the source and the right treatment plan. Simple visible pest issues may be quoted more directly.",
  },
  {
    question: "What pests can local pros help with?",
    answer:
      "Common requests include ants, roaches, rodents, termites, bed bugs, mosquitoes, fleas, ticks, wasps, hornets, and some wildlife exclusion needs.",
  },
  {
    question: "Is pest control safe for homes with pets or children?",
    answer:
      "Tell the pro about pets, children, allergies, and sensitive areas before service. The pro can explain preparation steps, product approach, re-entry timing, and areas to avoid.",
  },
  {
    question: "When is pest control urgent?",
    answer:
      "Urgent situations include stinging insects near people, suspected bed bugs, rodent damage, termite activity, commercial inspection deadlines, or pest activity in food areas.",
  },
  {
    question: "Can pest pros help prevent pests from coming back?",
    answer:
      "Yes. Prevention may include sealing entry points, reducing moisture, treating exterior areas, removing attractants, monitoring activity, and setting a recurring service plan.",
  },
];

const relatedCategorySlugs = [
  "cleaning",
  "lawn-care",
  "property-maintenance",
  "handyman",
];

export default function PestCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(pestSubcategories);

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
          <div className="container">
            <div className="grid-2 gap-lg">
              <div>
                <p className="eyebrow">Local pest control pros</p>
                <h1>
                  Pest Control Services in {market.city}, {market.state}
                </h1>
                <p className="hero-text">
                  Find local pest control help for inspections, ants, roaches,
                  rodents, termites, bed bugs, mosquitoes, wasps, wildlife
                  exclusion, recurring prevention, and commercial pest issues.
                  Submit one clear request and help local pros understand the
                  pest type, affected area, urgency, and service needs.
                </p>
                <div className="flex gap-sm">
                  <Link
                    className="button button-primary"
                    href={getBookHref(market)}
                  >
                    Request pest control
                  </Link>
                  <a className="button button-secondary" href="#pest-services">
                    View pest services
                  </a>
                </div>
              </div>

              <div className="service-cta-card">
                <p className="eyebrow">Quick request</p>
                <h2>Need pest help in {market.city}?</h2>
                <p>
                  Describe what you saw, where it is happening, whether it is
                  urgent, and upload photos so pest control pros can respond
                  with a more relevant next step.
                </p>
                <Link className="button button-primary" href={getBookHref(market)}>
                  Start a pest request
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="pest-services">
          <div className="container">
            <p className="eyebrow">Pest services</p>
            <h2>Browse pest control services in {market.city}</h2>
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
            <h2>High-intent pest control searches</h2>
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
                <h2>Pest control tasks homeowners request</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow">Common problems</p>
                <h2>Pest issues and use cases</h2>
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
              <h2>Pest control cost guidance in {market.city}</h2>
              <p>
                Pest control pricing depends on what pest is involved, how
                severe the activity is, how much space needs service, whether
                the source is easy to access, and whether repeat visits,
                exclusion, or prevention are needed.
              </p>

              <div className="grid-3 gap-md">
                <div className="card-flat">
                  <h3>Small jobs</h3>
                  <p>
                    Basic inspection, single-room issue, small ant trail, minor
                    outdoor treatment, or simple prevention visit.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Medium jobs</h3>
                  <p>
                    Recurring roaches, rodents, mosquitoes, wasps, fleas, ticks,
                    multiple rooms, yard service, or follow-up treatment.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Larger jobs</h3>
                  <p>
                    Termites, bed bugs, wildlife exclusion, commercial pest
                    control, severe infestations, attic access, or multi-visit
                    service plans.
                  </p>
                </div>
              </div>

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
            <div className="grid-2 gap-lg">
              <div className="card">
                <p className="eyebrow">When to hire a pro</p>
                <h2>When pest control is worth it</h2>
                <ul className="service-list">
                  {hireProItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>High-risk pest situations</h2>
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
              <h2>How to get better pest control responses</h2>
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
              <h2>Pest control near {market.city}</h2>
              <div className="grid-3 gap-md">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/pest`}
                    key={nearbyMarket.slug}
                  >
                    <h3>
                      Pest Control in {nearbyMarket.city}, {nearbyMarket.state}
                    </h3>
                    <p>
                      Find pest inspection, extermination, prevention, and
                      urgent pest control help near {nearbyMarket.city}.
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
        )}

        <section className="section">
          <div className="container">
            <p className="eyebrow">FAQ</p>
            <h2>Pest control questions</h2>
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
              <h2>Request pest control in {market.city}</h2>
              <p>
                Share the pest type, location, photos, urgency, and property
                details so local pros can review the job and respond.
              </p>
              <Link className="button button-primary" href={getBookHref(market)}>
                Request pest control
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}