import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PublicPageShell from "@/components/PublicPageShell";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Pro Dashboard | Fixly Pro",
};

type PurchasedLead = {
  id: string;
  purchased_at: string;
  price_fixas: number;
  service_requests: {
    public_slug: string;
    category_slug: string;
    subcategory_slug: string | null;
    city: string;
    state: string;
    public_description: string;
  } | null;
};

async function getCurrentUserId() {
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

  return user?.id ?? null;
}

export default async function ProDashboardPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <PublicPageShell>
        <main className="page">
          <section className="section">
            <div className="container-narrow card">
              <h1>Pro login required</h1>
              <p>Please log in to view your Fixly Pro dashboard.</p>
              <Link href="/pro/login?next=/pro" className="button button-primary">
                Log in
              </Link>
            </div>
          </section>
        </main>
      </PublicPageShell>
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: creditAccount } = await admin
    .from("pro_credit_accounts")
    .select("balance")
    .eq("pro_user_id", userId)
    .maybeSingle();

  const { data: purchasedLeads } = await admin
    .from("pro_lead_access")
    .select(
      `
      id,
      purchased_at,
      price_fixas,
      service_requests (
        public_slug,
        category_slug,
        subcategory_slug,
        city,
        state,
        public_description
      )
    `
    )
    .eq("pro_user_id", userId)
    .order("purchased_at", { ascending: false })
    .limit(20);

  const balance = creditAccount?.balance ?? 0;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro</p>
            <h1>Pro Dashboard</h1>
            <LogoutButton />
            <p className="hero-text">
              Manage your FIXA balance, purchased leads, and future customer
              conversations.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container grid-3">
            <div className="card">
              <p className="eyebrow">Balance</p>
              <h2>{balance.toLocaleString()} FIXAs</h2>
              
              <p>Use FIXAs to unlock homeowner contact details.</p>
              <Link href="/pro/credits" className="button button-primary">
                Buy FIXAs
              </Link>
              
            </div>

            <div className="card">
              <p className="eyebrow">Purchased leads</p>
              <h2>{purchasedLeads?.length ?? 0}</h2>
              <p>Recently unlocked homeowner requests.</p>
              <Link href="/pro/leads/purchased" className="button button-secondary">
                View purchased leads
              </Link>
            </div>

            <div className="card">
              <p className="eyebrow">Coming soon</p>
              <h2>Messages</h2>
              <p>Future customer chats and lead conversations will appear here.</p>
              <button className="button button-secondary" disabled>
                Chats coming soon
              </button>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="card">
              <div className="flex-between gap-md">
                <div>
                  <p className="eyebrow">Recent activity</p>
                  <h2>Purchased leads</h2>
                </div>

                <Link href="/requests" className="button button-secondary">
                  Browse more leads
                </Link>
              </div>

              <div className="lead-list">
                {(purchasedLeads as PurchasedLead[] | null ?? []).map((lead) => {
                  const request = lead.service_requests;

                  if (!request) return null;

                  return (
                    <article key={lead.id} className="card-flat">
                      <div className="flex-between gap-md">
                        <div>
                          <h3>
                            {request.category_slug} lead in {request.city},{" "}
                            {request.state}
                          </h3>
                          <p>{request.public_description}</p>
                          <p className="muted">
                            Purchased for {lead.price_fixas.toLocaleString()} FIXAs
                          </p>
                        </div>

                        <Link
                          href={`/requests/${request.public_slug}`}
                          className="button button-primary"
                        >
                          Open lead
                        </Link>
                      </div>
                    </article>
                  );
                })}

                {(!purchasedLeads || purchasedLeads.length === 0) && (
                  <div className="card-flat">
                    <h3>No purchased leads yet</h3>
                    <p>Browse open requests and unlock your first lead.</p>
                    <Link href="/requests" className="button button-primary">
                      Browse leads
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}