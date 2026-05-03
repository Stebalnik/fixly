import Link from "next/link";
import { categories } from "@/lib/services/categories";
import { getMarketBySlug } from "@/lib/geo";

export default function HomePage() {
  const market = getMarketBySlug("atlanta-ga");

  return (
    <main className="page">
      {/* HERO */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Fixly.work</p>

          <h1>
            Find trusted home service pros
            <br />
            in {market?.city}, {market?.state}
          </h1>

          <p className="hero-text">
            Post a request. Get responses from verified professionals. No
            middlemen. Faster results.
          </p>

          <div className="flex gap-md">
            <Link href="/book" className="button button-primary">
              Request service
            </Link>

            <Link href="/services" className="button button-secondary">
              Browse services
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section">
        <div className="container">
          <h2>Popular services</h2>

          <div className="grid-3">
            {Object.values(categories).map((category) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className="card card-hover"
              >
                <div className="card-icon">{category.icon}</div>
                <h3>{category.shortTitle}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <h2>How it works</h2>

          <div className="grid-3">
            <div className="card-flat">
              <h3>1. Post your request</h3>
              <p>Describe what you need. Takes less than 2 minutes.</p>
            </div>

            <div className="card-flat">
              <h3>2. Get responses</h3>
              <p>Qualified pros reach out with offers and timelines.</p>
            </div>

            <div className="card-flat">
              <h3>3. Choose and hire</h3>
              <p>Select the best fit and get the job done.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container flex-center">
          <div className="card">
            <h2>Need help with your home project?</h2>

            <div className="section-sm">
              <Link href="/book" className="button button-primary">
                Request service now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}