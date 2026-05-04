import Link from "next/link";

export const metadata = {
  title: "Credits | Fixly Pro",
};

export default function ProCreditsPage() {
  return (
    <main className="page">
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Pro</p>
          <h1>Credits</h1>
          <p className="hero-text">
            Credits will be used to unlock homeowner leads on Fixly.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-3 gap-md">
            <div className="card">
              <p className="eyebrow">Balance</p>
              <h2>0 credits</h2>
              <p>Your current test balance.</p>
            </div>

            <div className="card">
              <h2>Starter</h2>
              <p>50 credits</p>
              <Link href="#" className="button button-secondary">
                Coming soon
              </Link>
            </div>

            <div className="card">
              <h2>Growth</h2>
              <p>150 credits</p>
              <Link href="#" className="button button-secondary">
                Coming soon
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}