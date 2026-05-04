import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { solarSubcategories } from "@/lib/services/subcategories/solar";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=solar&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/solar/${subcategorySlug}`;
}

const popularSearches = [
  "solar panel installation near me",
  "solar repair near me",
  "solar panel cleaning near me",
  "solar panel replacement cost",
  "solar inverter repair near me",
  "solar battery installation near me",
  "solar system inspection near me",
  "same day solar repair",
  "emergency solar repair",
  "licensed solar installers",
  "affordable solar panel installation",
  "residential solar service",
  "commercial solar service",
  "solar troubleshooting near me",
  "solar maintenance service",
  "best solar installers near me",
];

const proHelpItems = [
  "Solar panel installation planning and system sizing",
  "Solar panel repair, replacement, and storm damage review",
  "Solar inverter installation, replacement, and troubleshooting",
  "Solar battery backup planning and installation",
  "Solar inspections for home purchases, maintenance, and insurance",
  "Solar panel cleaning and seasonal maintenance",
  "Commercial solar maintenance, repair, inspection, and upgrades",
  "Monitoring alerts, production drops, and system shutdown diagnosis",
];

const commonUseCases = [
  "Your electric bill is high and you want to explore solar",
  "Your solar system is not producing as expected",
  "The inverter shows an error code or the monitoring app stopped updating",
  "Panels are dirty, damaged, cracked, or affected by storm debris",
  "You are buying a home with solar and need an inspection",
  "You want battery backup for outages or critical loads",
  "Your business needs solar maintenance, repair, or upgrade support",
];

const priceGuidance = [
  {
    title: "Small solar service calls",
    description:
      "Panel cleaning, visual inspections, monitoring review, and basic troubleshooting are usually smaller jobs. Price depends on roof access, panel count, and issue complexity.",
  },
  {
    title: "Medium repair or equipment jobs",
    description:
      "Inverter troubleshooting, panel replacement, wiring concerns, or production issues can cost more because they may require diagnostics, parts, roof access, and electrical review.",
  },
  {
    title: "Larger installation or upgrade projects",
    description:
      "Full solar installation, battery backup, commercial solar work, and major equipment upgrades depend on system size, equipment, permitting, utility rules, and electrical conditions.",
  },
];

const hireProItems = [
  "The system is offline, underperforming, or showing an error",
  "You see visible panel damage, loose wiring, or storm-related issues",
  "You need roof access, electrical work, or equipment replacement",
  "You want an inspection before buying a property with solar",
  "You are planning a battery backup or larger solar installation",
  "You need commercial solar documentation, scheduling, or maintenance",
];

const urgentItems = [
  "Exposed wiring, burning smell, sparks, or damaged electrical equipment",
  "Repeated breaker trips or a solar system that shuts down unexpectedly",
  "Storm, hail, or falling debris damage to panels or mounting hardware",
  "Inverter alerts that indicate shutdown, grid fault, or equipment failure",
  "Water intrusion near solar equipment, conduit, inverter, or electrical panels",
];

const requestTips = [
  "Property type: home, rental property, office, shop, warehouse, or commercial building",
  "Service needed: installation, repair, replacement, cleaning, inspection, battery, inverter, or troubleshooting",
  "System details: panel count, system age, inverter brand, battery plans, and utility provider",
  "Problem details: error codes, monitoring screenshots, production drop, storm damage, or visible panel issues",
  "Access details: roof height, roof pitch, roof type, electrical panel location, and parking/access limits",
  "Photos: panels, inverter, electrical equipment, damage, roof area, and monitoring alerts",
];

const faq = [
  {
    question: "How much do solar services cost?",
    answer:
      "Solar pricing depends on the job type. Cleaning and inspection are usually smaller service calls, while inverter replacement, panel replacement, battery installation, and full solar installation are larger projects.",
  },
  {
    question: "Can I request solar repair if I do not know what is wrong?",
    answer:
      "Yes. Choose solar troubleshooting or solar panel repair and include the symptoms, system age, inverter brand, app alerts, error codes, and photos if available.",
  },
  {
    question: "Do solar pros handle both residential and commercial solar?",
    answer:
      "Some pros focus on residential solar, while others handle commercial systems. Your request should include the property type so the right pros can respond.",
  },
  {
    question: "Is solar panel cleaning worth requesting?",
    answer:
      "It can be useful when panels have visible dirt, pollen, leaves, bird droppings, or production has dropped after seasonal buildup.",
  },
  {
    question: "When is solar service urgent?",
    answer:
      "Solar service is urgent when there is exposed wiring, electrical smell, sparks, repeated breaker trips, storm damage, water near equipment, or a system shutdown with visible damage.",
  },
  {
    question: "Can I add a battery to an existing solar system?",
    answer:
      "Often yes, but compatibility depends on your inverter, electrical panel, battery type, backup goals, and local utility requirements.",
  },
  {
    question: "What should I include in a solar request?",
    answer:
      "Include the service needed, system age, panel count, inverter brand, utility provider, roof access, photos, error messages, and your preferred timeline.",
  },
];

const relatedCategorySlugs = [
  "electrical",
  "roofing",
  "hvac",
  "garage-door",
  "maintenance",
  "pressure-washing",
];

export default function SolarCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(solarSubcategories);

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
            <p className="eyebrow">Solar services</p>

            <h1>
              Solar Services in {market.city}, {market.state}
            </h1>

            <p className="hero-text">
              Find local solar pros for solar panel installation, repair,
              replacement, inverter service, battery backup, inspections,
              cleaning, maintenance, and commercial solar support in{" "}
              {market.city}. Compare the right service path, describe your
              system, and request help from local professionals.
            </p>

            <div className="flex gap-sm">
              <Link href={getBookHref(market)} className="button button-primary">
                Request solar service
              </Link>
              <Link href="#solar-services" className="button button-secondary">
                Browse solar services
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Quick request</p>
                <h2>Need solar help in {market.city}?</h2>
                <p>
                  Submit one request with your solar issue, system details,
                  photos, timing, and location. Local pros can review whether
                  you need installation, repair, troubleshooting, inspection,
                  cleaning, inverter work, or battery support.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Start solar request
              </Link>
            </div>
          </div>
        </section>

        <section id="solar-services" className="section">
          <div className="container">
            <p className="eyebrow">All solar services</p>
            <h2>Solar installation, repair, battery, and maintenance services</h2>
            <p>
              Solar requests can range from a simple panel cleaning to a full
              installation or battery backup project. Choose the service that
              best matches your goal so the right local pros can respond.
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
                    {subcategory.shortTitle}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <p className="eyebrow">Popular searches</p>
            <h2>High-intent solar searches in {market.city}</h2>

            <ul className="service-seo-list">
              {popularSearches.map((phrase) => (
                <li key={phrase}>
                  {phrase} in {market.city}, {market.state}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">What pros can help with</p>
                <h2>Solar work local pros can review</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Common use cases</p>
                <h2>When homeowners and businesses request solar help</h2>
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
            <h2>What affects solar service cost?</h2>
            <p>
              Solar costs vary because installation, repair, inspection,
              cleaning, inverter service, and battery backup all require
              different tools, equipment, electrical review, access, and
              documentation. Use the request form to describe the job clearly
              instead of guessing the scope.
            </p>

            <div className="grid-3">
              {priceGuidance.map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">When to hire a pro</p>
                <h2>Solar is usually not a DIY category</h2>
                <p>
                  Solar systems involve roof access, electrical equipment,
                  inverters, mounting hardware, utility rules, and sometimes
                  battery storage. A qualified pro can help reduce risk and
                  identify the right scope.
                </p>

                <ul className="service-list">
                  {hireProItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>High-risk solar issues</h2>
                <p>
                  If the issue involves electrical danger, visible damage, or
                  storm impact, avoid touching solar equipment and request
                  qualified help.
                </p>

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
            <p className="eyebrow">Better requests</p>
            <h2>How to get better solar responses</h2>
            <p>
              Solar pros can respond faster when your request includes system
              details, symptoms, access notes, and photos. Add as much practical
              information as possible.
            </p>

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
              <h2>Solar services near {market.city}</h2>

              <div className="grid-3">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    href={`${getMarketUrlPath(nearbyMarket)}/solar`}
                    className="card card-hover"
                  >
                    <h3>
                      Solar Services in {nearbyMarket.city},{" "}
                      {nearbyMarket.state}
                    </h3>
                    <p>
                      Request solar installation, repair, inspection, battery,
                      cleaning, and maintenance help near {nearbyMarket.city}.
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
              <h2>Related home service categories</h2>

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
            <h2>Solar service questions</h2>

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
                <h2>Request solar service in {market.city}</h2>
                <p>
                  Describe your solar installation, repair, inverter, battery,
                  cleaning, inspection, or troubleshooting request and connect
                  with local pros.
                </p>
              </div>

              <Link href={getBookHref(market)} className="button button-primary">
                Request solar help
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}