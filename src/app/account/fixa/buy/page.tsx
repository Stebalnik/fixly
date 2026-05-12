export const dynamic = "force-dynamic";

import PublicPageShell from "@/components/PublicPageShell";
import { getAccountContext } from "@/lib/auth/account";
import { FixaBuyForm } from "@/features/account/FixaBuyForm";

export const metadata = {
  title: "Buy FIXAs | Fixly",
};

export default async function BuyFixaPage() {
  const account = await getAccountContext();

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container-narrow">
          <div className="card">
            <p className="eyebrow">FIXA wallet</p>

            <h1>Buy FIXAs</h1>

            <p className="hero-text">
              Add FIXAs to your Fixly account. You can use them to unlock leads,
              pro contacts, and marketplace actions.
            </p>

            <FixaBuyForm currentBalance={account.fixaBalance} />
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}