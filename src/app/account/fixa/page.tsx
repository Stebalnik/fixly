import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import {
  getAccountContext,
  hasRole,
} from "@/lib/auth/account";

export const metadata = {
  title: "FIXA Balance | Fixly",
};

export default async function AccountFixaPage() {
  const account = await getAccountContext();

  const isCustomer = hasRole(account.roles, "customer");
  const isPro = hasRole(account.roles, "pro");

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container">
          <div className="flex flex-between gap-md">
            <div>
              <p className="eyebrow">FIXA wallet</p>

              <h1>FIXA balance</h1>

              <p className="hero-text">
                FIXAs are used to unlock customer leads, pro contacts,
                messaging features, and future marketplace actions across
                Fixly.
              </p>
            </div>

            <Link href="/account" className="button button-secondary">
              Back to account
            </Link>
          </div>

          <div className="grid-2 fixa-page-grid">
            <div className="card fixa-balance-card">
              <p className="eyebrow">Available balance</p>

              <div className="fixa-balance-value">
                {account.fixaBalance.toLocaleString()}
              </div>

              <p className="fixa-balance-label">
                FIXAs available
              </p>

              <div className="fixa-balance-actions">
                <Link
                  href="/account/fixa/buy"
                  className="button button-primary"
                >
                  Buy FIXAs
                </Link>

                <Link
                  href="/account/fixa/history"
                  className="button button-secondary"
                >
                  Transaction history
                </Link>
              </div>
            </div>

            <div className="card">
              <p className="eyebrow">How FIXAs work</p>

              <h2>Marketplace currency</h2>

              <div className="fixa-info-list">
                <div className="fixa-info-item">
                  <span className="fixa-info-dot" />
                  <p>
                    Pros use FIXAs to unlock customer leads and contact details.
                  </p>
                </div>

                <div className="fixa-info-item">
                  <span className="fixa-info-dot" />
                  <p>
                    Customers can use FIXAs to unlock pro contact details and
                    premium actions.
                  </p>
                </div>

                <div className="fixa-info-item">
                  <span className="fixa-info-dot" />
                  <p>
                    Your FIXA wallet works across your entire Fixly account.
                  </p>
                </div>

                <div className="fixa-info-item">
                  <span className="fixa-info-dot" />
                  <p>
                    1 FIXA = $0.01 USD platform value.
                  </p>
                </div>
              </div>

              {!isCustomer && !isPro ? (
                <div className="fixa-role-box">
                  <p>
                    Create a customer request or join as a pro to start using
                    FIXAs across the marketplace.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}