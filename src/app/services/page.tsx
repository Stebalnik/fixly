import Link from "next/link";
import { categories } from "@/lib/services/categories";
import { getMarketBySlug } from "@/lib/geo";

export const metadata = {
  title: "Home Services in Atlanta, GA | Fixly",
  description:
    "Browse Fixly home services in Atlanta, GA. Find local pros for handyman, plumbing, cleaning, painting, roofing, remodeling, and more.",
};

export default function ServicesPage() {
  const market = getMarketBySlug("atlanta-ga");

  return (
    <main className="page">
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Services</p>

          <h1>
            Home services in {market?.city}, {market?.state}
          </h1>

          <p className="hero-text">
            Browse popular home service categories and request help from local
            professionals.
          </p>

          <Link href="/book" className="button button-primary">
            Request service
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Browse services</h2>

          <div className="grid-3">
            {Object.values(categories).map((category) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className="card card-hover"
              >
                <div className="card-icon">{category.icon}</div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}