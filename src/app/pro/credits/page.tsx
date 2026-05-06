import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata = {
  title: "FIXAs | Fixly Pro",
};

const fixaPackages = [
  { amount: 1000, priceUsd: 13 },
  { amount: 2500, priceUsd: 32 },
  { amount: 5000, priceUsd: 60 },
];

async function getProBalance() {
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
    .from("pro_credit_accounts")
    .select("balance")
    .eq("pro_user_id", user.id)
    .maybeSingle();

  return data?.balance ?? 0;
}

export default async function ProCreditsPage() {
  const balance = await getProBalance();

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <div className="flex-between gap-lg">
              <div>
                <p className="eyebrow">Fixly Pro</p>
                <h1>Buy FIXAs</h1>
                <p className="hero-text">
                  1 FIXA = $0.013. Use FIXAs to unlock homeowner leads.
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