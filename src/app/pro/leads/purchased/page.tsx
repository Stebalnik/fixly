import Link from "next/link";

export const metadata = {
  title: "Purchased Leads | Fixly Pro",
};

export default function PurchasedLeadsPage() {
  return (
    <main className="page">
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Pro</p>
          <h1>Purchased leads</h1>
          <p className="hero-text">
            Leads you unlock will appear here with customer contact access.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card">
            <h2>No purchased leads yet</h2>
            <p>
              After you unlock a lead, it will move into your purchased leads
              list.
            </p>

            <Link href="/requests" className="button button-primary">
              Browse open leads
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}