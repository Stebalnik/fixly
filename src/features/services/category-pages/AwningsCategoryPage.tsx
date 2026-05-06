import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import type { Market } from "@/lib/geo";
import { getMarketByCity, getMarketUrlPath } from "@/lib/geo";
import type { Category } from "@/lib/services";
import { getCategoryBySlug } from "@/lib/services";
import { awningsSubcategories } from "@/lib/services/subcategories/awnings";
import { getServiceBreadcrumbs } from "@/lib/seo";

type Props = {
  category: Category;
  market: Market;
};

function getBookHref(market: Market) {
  return `/book?category=awnings&market=${market.slug}`;
}

function getServiceHref(market: Market, subcategorySlug: string) {
  return `${getMarketUrlPath(market)}/awnings/${subcategorySlug}`;
}

const popularSearches = [
  "awning installation near me",
  "retractable awning installation",
  "patio awning installation",
  "awning repair near me",
  "awning replacement cost",
  "commercial storefront awning repair",
  "fixed awning installation",
  "motorized awning repair",
  "awning fabric replacement",
  "awning frame repair",
  "same day awning repair",
  "emergency awning removal",
  "affordable awning installers",
  "licensed awning contractors",
  "residential awning installation",
  "commercial awning service",
];

const proHelpItems = [
  "Install retractable, fixed, patio, window, door, and storefront awnings.",
  "Repair torn fabric, loose brackets, bent frames, damaged arms, and stuck retractable systems.",
  "Replace old awnings with new manual, motorized, residential, or commercial systems.",
  "Remove unsafe or outdated awnings and dispose of old fabric, frames, and hardware.",
  "Service motorized awnings, remotes, switches, sensors, alignment, and power-related issues.",
  "Prepare seasonal awnings for setup, takedown, storage, storm season, or heavy weather.",
];

const commonUseCases = [
  "A patio, deck, or outdoor seating area gets too much direct sun.",
  "A storefront awning is faded, torn, sagging, or hurting curb appeal.",
  "A retractable awning no longer opens, closes, or aligns correctly.",
  "A fixed canopy is loose, rusted, bent, leaking, or damaged by wind.",
  "An old awning needs replacement during exterior remodeling or property upgrades.",
  "A business needs shade, signage-ready cover, or weather protection at the entrance.",
];

const priceFactors = [
  "Awning size, width, projection, and total coverage area.",
  "Manual, fixed, retractable, motorized, or commercial-grade system type.",
  "Wall, roof, soffit, brick, stucco, wood, or metal mounting conditions.",
  "Fabric, frame, hardware, lighting, sensor, and motor requirements.",
  "Removal of existing awning, disposal, access height, and ladder or lift needs.",
  "Urgency, weather damage, structural concerns, and same-day scheduling.",
];

const hireProCases = [
  "The awning is large, heavy, motorized, or mounted above ground level.",
  "The frame is loose, bent, rusted, or pulling away from the building.",
  "The project involves electrical wiring, lighting, switches, sensors, or motors.",
  "The awning protects a public entrance, storefront, walkway, or commercial seating area.",
  "You need clean removal without damaging siding, stucco, brick, trim, or roofing.",
];

const urgentCases = [
  "Awning frame is loose after wind or storm damage.",
  "A canopy is hanging, sagging, or blocking an entrance or walkway.",
  "Mounting brackets are pulling out of the wall or roofline.",
  "Commercial awning damage creates a safety issue for customers or employees.",
  "A torn awning is collecting water and adding weight to the structure.",
];

const responseTips = [
  "Add photos of the awning, mounting area, fabric, frame, and surrounding wall.",
  "Mention whether it is residential or commercial and whether the awning is fixed, retractable, or motorized.",
  "Include approximate width, projection, height from ground, and access limitations.",
  "Describe the issue clearly: installation, repair, replacement, removal, motor problem, or fabric replacement.",
  "Share timing needs, HOA or landlord requirements, and whether old material must be hauled away.",
];

const faq = [
  {
    question: "How much does awning installation cost?",
    answer:
      "Awning installation cost depends on size, awning type, mounting surface, material, access, and whether the system is manual or motorized. Small fixed awnings usually cost less than large retractable or commercial systems.",
  },
  {
    question: "Can I get same-day awning repair?",
    answer:
      "Same-day awning repair may be available for loose mounts, torn fabric, unsafe frames, stuck retractable systems, and weather-related damage. Availability depends on the issue, parts, and local pro schedules.",
  },
  {
    question: "Do pros install motorized retractable awnings?",
    answer:
      "Yes. You can request installation, troubleshooting, alignment, and repair for motorized retractable awnings, including remote, switch, sensor, and power-related issues.",
  },
  {
    question: "Can an awning be repaired instead of replaced?",
    answer:
      "Often yes. Fabric tears, loose brackets, bent arms, frame issues, and some motor problems can be repaired. Replacement is usually better when the frame, fabric, and hardware are all heavily worn or unsafe.",
  },
  {
    question: "Do commercial storefront awnings need a different type of pro?",
    answer:
      "Commercial storefront awnings often require stronger materials, safer access planning, signage coordination, and work around business hours. A commercial awning pro is usually the better fit.",
  },
  {
    question: "Can pros remove and dispose of old awnings?",
    answer:
      "Yes. Awning removal can include taking down fabric, frames, brackets, hardware, and disposing of old materials when included in the request.",
  },
  {
    question: "What should I include in an awning request?",
    answer:
      "Include photos, approximate size, property type, awning type, installation height, current issue, material preference, and whether you need repair, replacement, removal, or a new installation.",
  },
];

const relatedCategorySlugs = [
  "handyman",
  "painting",
  "roofing",
  "remodeling",
  "electrical",
  "pressure-washing",
];

export default function AwningsCategoryPage({ category, market }: Props) {
  const breadcrumbs = getServiceBreadcrumbs({
    market,
    category,
  });

  const subcategories = Object.values(awningsSubcategories);

  const nearbyMarkets = market.nearby
    .map((city) => getMarketByCity(city))
    .filter((nearbyMarket): nearbyMarket is Market => Boolean(nearbyMarket));

  const relatedCategories = relatedCategorySlugs
    .map((slug) => getCategoryBySlug(slug))
    .filter((relatedCategory): relatedCategory is Category =>
      Boolean(relatedCategory)
    );

  return (
    <PublicPageShell market={market} breadcrumbs={breadcrumbs}>
      <main className="page">
        

        <section className="service-hero">
          <div className="container">
            <div className="hero-text">
              <p className="eyebrow">Awning contractors near you</p>
              <h1>Awning Services in {market.city}, {market.state}</h1>
              <p>
                Find local awning pros for installation, repair, replacement,
                fabric work, motorized systems, storefront canopies, seasonal
                setup, and safe removal. Fixly helps homeowners and businesses
                request the right awning service without calling multiple
                contractors one by one.
              </p>
              <div className="flex gap-sm">
                <Link className="button button-primary" href={getBookHref(market)}>
                  Request awning service
                </Link>
                <Link className="button button-secondary" href="#awning-services">
                  View awning services
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <div>
                <p className="eyebrow">Fast request</p>
                <h2>Need awning help in {market.city}?</h2>
                <p>
                  Tell us what you need, upload photos, and describe the awning
                  type, size, damage, or installation area. Your request can be
                  matched with local pros who handle residential and commercial
                  awning work.
                </p>
              </div>
              <Link className="button button-primary" href={getBookHref(market)}>
                Start request
              </Link>
            </div>
          </div>
        </section>

        <section id="awning-services" className="section">
          <div className="container">
            <p className="eyebrow">All awning services</p>
            <h2>Awning installation, repair, replacement, and removal</h2>
            <div className="grid-3">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  className="card card-hover"
                  href={getServiceHref(market, subcategory.slug)}
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
            <h2>Common awning searches in {market.city}</h2>
            <ul className="service-seo-list">
              {popularSearches.map((phrase) => (
                <li key={phrase}>{phrase} in {market.city}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">What pros can help with</p>
                <h2>Awning projects handled by local contractors</h2>
                <ul className="service-list">
                  {proHelpItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Common problems</p>
                <h2>Awning use cases and repair needs</h2>
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
              <h2>How awning service pricing usually works</h2>
              <p>
                Awning pricing depends on the type of work, system size,
                material, access, mounting conditions, and whether parts,
                fabric, electrical components, or removal are included. Small
                service visits are usually priced differently from full
                installation or commercial replacement projects.
              </p>
              <div className="grid-3">
                <div className="card-flat">
                  <h3>Small jobs</h3>
                  <p>
                    Basic inspection, bracket adjustment, minor fabric repair,
                    remote troubleshooting, or seasonal setup.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Medium jobs</h3>
                  <p>
                    Fabric replacement, frame repair, awning removal, lighting
                    installation, or motor service.
                  </p>
                </div>
                <div className="card-flat">
                  <h3>Larger jobs</h3>
                  <p>
                    New retractable awning installation, storefront canopy work,
                    full replacement, or multi-awning commercial projects.
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
            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">When to hire a pro</p>
                <h2>When awning work should not be DIY</h2>
                <ul className="service-list">
                  {hireProCases.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <p className="eyebrow">Urgent cases</p>
                <h2>High-risk awning issues</h2>
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
              <h2>How to get better awning quotes</h2>
              <ul className="service-list">
                {responseTips.map((item) => (
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
              <h2>Awning services near {market.city}</h2>
              <div className="grid-3">
                {nearbyMarkets.map((nearbyMarket) => (
                  <Link
                    key={nearbyMarket.slug}
                    className="card card-hover"
                    href={`${getMarketUrlPath(nearbyMarket)}/awnings`}
                  >
                    <h3>{nearbyMarket.city}</h3>
                    <p>
                      Find awning installation, repair, replacement, and removal
                      services in {nearbyMarket.city}, {nearbyMarket.state}.
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
            <h2>Other services that pair well with awning work</h2>
            <div className="grid-3">
              {relatedCategories.map((relatedCategory) => (
                <Link
                  key={relatedCategory.slug}
                  className="card card-hover"
                  href={`${getMarketUrlPath(market)}/${relatedCategory.slug}`}
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
          <div className="container">
            <p className="eyebrow">FAQ</p>
            <h2>Awning service questions</h2>
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
                <p className="eyebrow">Get matched</p>
                <h2>Request awning service in {market.city}</h2>
                <p>
                  Submit one clear request for awning installation, repair,
                  replacement, fabric work, motorized service, storefront
                  canopy work, or removal.
                </p>
              </div>
              <Link className="button button-primary" href={getBookHref(market)}>
                Book awning service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}