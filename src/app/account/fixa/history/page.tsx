import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { getAccountContext } from "@/lib/auth/account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "FIXA Transaction History | Fixly",
};

type FixaTransaction = {
  id: string;
  amount: number;
  transaction_type: string;
  request_id: string | null;
  related_user_id: string | null;
  balance_after: number | null;
  stripe_session_id: string | null;
  created_at: string;
};

function formatTransactionType(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function FixaTransactionHistoryPage() {
  const account = await getAccountContext();
  const admin = createSupabaseAdminClient();

  const { data: transactions, error } = await admin
    .from("fixa_transactions")
    .select(
      `
      id,
      amount,
      transaction_type,
      request_id,
      related_user_id,
      balance_after,
      stripe_session_id,
      created_at
    `
    )
    .eq("user_id", account.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const items = (transactions ?? []) as FixaTransaction[];

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container">
          <div className="flex flex-between gap-md">
            <div>
              <p className="eyebrow">FIXA wallet</p>
              <h1>Transaction history</h1>
              <p className="hero-text">
                Review your FIXA purchases, lead unlocks, contact unlocks, and
                marketplace activity.
              </p>
            </div>

            <Link href="/account/fixa" className="button button-secondary">
              Back to FIXA wallet
            </Link>
          </div>

          <div className="card fixa-history-card">
            {items.length === 0 ? (
              <div className="fixa-empty-state">
                <h2>No transactions yet</h2>
                <p>
                  Your FIXA transaction history will appear here after you buy
                  FIXAs or use them on Fixly.
                </p>

                <Link href="/account/fixa/buy" className="button button-primary">
                  Buy FIXAs
                </Link>
              </div>
            ) : (
              <div className="fixa-history-list">
                {items.map((transaction) => {
                  const isPositive = transaction.amount > 0;

                  return (
                    <div key={transaction.id} className="fixa-history-item">
                      <div>
                        <p className="fixa-history-title">
                          {formatTransactionType(transaction.transaction_type)}
                        </p>

                        <p className="fixa-history-meta">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>

                        {transaction.request_id ? (
                          <p className="fixa-history-meta">
                            Request: {transaction.request_id}
                          </p>
                        ) : null}
                      </div>

                      <div className="fixa-history-values">
                        <p
                          className={
                            isPositive
                              ? "fixa-history-amount fixa-history-amount-positive"
                              : "fixa-history-amount fixa-history-amount-negative"
                          }
                        >
                          {isPositive ? "+" : ""}
                          {transaction.amount.toLocaleString()} FIXAs
                        </p>

                        <p className="fixa-history-meta">
                          Balance:{" "}
                          {(transaction.balance_after ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}