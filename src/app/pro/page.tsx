import Link from "next/link";

export const metadata = {
  title: "Pro Dashboard | Fixly",
  description: "Manage leads, purchased requests, and Fixly credits.",
};

export default function ProDashboardPage() {
  return (
    <main className="page">
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Pro</p>
          <h1>Pro dashboard</h1>
          <p className="hero-text">
            Browse leads, manage purchased requests, and track your credits.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-3 gap-md">
            <Link href="/pro/leads" className="card card-hover">
              <h2>Open leads</h2>
              <p>Browse available homeowner requests and unlock qualified leads.</p>
            </Link>

            <Link href="/pro/leads/purchased" className="card card-hover">
              <h2>Purchased leads</h2>
              <p>View leads you already unlocked and manage follow-ups.</p>
            </Link>

            <Link href="/pro/credits" className="card card-hover">
              <h2>Credits</h2>
              <p>Check your balance and buy credits for lead unlocks.</p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}