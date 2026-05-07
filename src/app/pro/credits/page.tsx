import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata = {
  title: "FIXAs | Fixly",
};

const fixaPackages = [
  { amount: 1000, priceUsd: 13 },
  { amount: 2500, priceUsd: 32 },
  { amount: 5000, priceUsd: 60 },
];

type ProCreditsPageProps = {
  searchParams?: Promise<{
    payment?: string;
    fixas?: string;
  }>;
};

async function getFixaBalance() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { data } = await supabase
    .from("user_fixa_accounts")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.balance ?? 0;
}

export default async function ProCreditsPage({
  searchParams,
}: ProCreditsPageProps) {
  const params = (await searchParams) ?? {};
  const balance = await getFixaBalance();

  const paymentStatus = params.payment ?? "";
  const purchasedFixas = Number(params.fixas ?? 0);

  const showSuccess =
    paymentStatus === "success" &&
    Number.isInteger(purchasedFixas) &&
    purchasedFixas > 0;

  const showCancelled = paymentStatus === "cancelled";

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <div className="flex-between gap-lg">
              <div>
                <p className="eyebrow">FIXA wallet</p>
                <h1>Buy FIXAs</h1>
                <p className="hero-text">
                  1 FIXA = $0.013. Use FIXAs to unlock customer leads, pro
                  contacts, and marketplace actions.
                </p>
              </div>

              <div className="card">
                <p className="eyebrow">Your balance</p>
                <h2 className="fixa-amount">
                  <Image
                    src="/fixacoin.png"
                    alt="FIXA"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="fixa-icon-inline"
                  />
                  {balance.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {(showSuccess || showCancelled) && (
          <section className="section-sm">
            <div className="container">
              {showSuccess && (
                <div className="card-flat payment-status-card payment-status-success">
                  <p className="eyebrow">Payment successful</p>
                  <h2 className="fixa-amount">
                    <Image
                      src="/fixacoin.png"
                      alt="FIXA"
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="fixa-icon-inline"
                    />
                    +{purchasedFixas.toLocaleString()} added
                  </h2>
                  <p>
                    Your FIXA purchase was completed. If the balance has not
                    updated yet, refresh the page after the Stripe webhook is
                    processed.
                  </p>
                </div>
              )}

              {showCancelled && (
                <div className="card-flat payment-status-card payment-status-warning">
                  <p className="eyebrow">Payment cancelled</p>
                  <h2>No FIXAs were added</h2>
                  <p>You can choose a package below and try again.</p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="section">
          <div className="container">
            <div className="grid-3 gap-md">
              {fixaPackages.map((item) => (
                <form
                  key={item.amount}
                  action="/api/pro/fixa/checkout"
                  method="POST"
                  className="card card-hover"
                >
                  <input type="hidden" name="amount" value={item.amount} />

                  <h2 className="fixa-amount">
                    <Image
                      src="/fixacoin.png"
                      alt="FIXA"
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="fixa-icon-inline"
                    />
                    {item.amount.toLocaleString()}
                  </h2>

                  <p className="fixa-price">${item.priceUsd}</p>

                  <p className="muted">
                    ${(item.priceUsd / item.amount).toFixed(3)} per FIXA
                  </p>

                  <button type="submit" className="button button-primary">
                    Buy
                  </button>
                </form>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}