export const metadata = {
  title: "FIXAs | Fixly Pro",
};

const fixaPackages = [
  { amount: 25, priceUsd: 25 },
  { amount: 50, priceUsd: 50 },
  { amount: 100, priceUsd: 100 },
];

export default function ProCreditsPage() {
  return (
    <main className="page">
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Pro</p>
          <h1>Buy FIXAs</h1>
          <p className="hero-text">
            FIXA is Fixly’s internal currency. Use FIXAs to unlock homeowner
            leads and access customer contact details.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-3 gap-md">
            {fixaPackages.map((item) => (
              <form
                key={item.amount}
                action="/api/pro/fixa/checkout"
                method="POST"
                className="card"
              >
                <input type="hidden" name="amount" value={item.amount} />

                <p className="eyebrow">FIXA package</p>
                <h2>{item.amount} FIXAs</h2>
                <p>${item.priceUsd}</p>

                <button type="submit" className="button button-primary">
                  Buy {item.amount} FIXAs
                </button>
              </form>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}