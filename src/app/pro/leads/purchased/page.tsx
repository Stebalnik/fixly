export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PublicPageShell from "@/components/PublicPageShell";

export const metadata = {
  title: "Purchased Leads | Fixly Pro",
};

type PurchasedLead = {
  id: string;
  request_id: string;
  purchased_at: string;
  price_fixas: number;
};

type ServiceRequest = {
  id: string;
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  city: string;
  state: string;
  public_description: string;
  created_at: string;
};

type Contact = {
  request_id: string;
  customer_name: string | null;
  street_address: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  full_phone: string | null;
  email: string | null;
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PurchasedLeadsPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <PublicPageShell>
        <main className="page">
          <section className="section">
            <div className="container-narrow card">
              <h1>Pro login required</h1>
              <p>Please log in to view your purchased leads.</p>
              <Link
                href="/pro/login?next=/pro/leads/purchased"
                className="button button-primary"
              >
                Log in
              </Link>
            </div>
          </section>
        </main>
      </PublicPageShell>
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: accessData } = await admin
    .from("pro_lead_access")
    .select("id, request_id, purchased_at, price_fixas")
    .eq("pro_user_id", userId)
    .order("purchased_at", { ascending: false });

  const purchasedLeads = (accessData ?? []) as PurchasedLead[];
  const requestIds = purchasedLeads.map((lead) => lead.request_id);

  const { data: requestsData } =
    requestIds.length > 0
      ? await admin
          .from("service_requests")
          .select(
            "id, public_slug, category_slug, subcategory_slug, city, state, public_description, created_at"
          )
          .in("id", requestIds)
      : { data: [] };

  const { data: contactsData } =
    requestIds.length > 0
      ? await admin
          .from("request_contacts")
          .select(
            "request_id, customer_name, street_address, phone_country_code, phone_number, full_phone, email"
          )
          .in("request_id", requestIds)
      : { data: [] };

  const requestsById = new Map(
    ((requestsData ?? []) as ServiceRequest[]).map((request) => [
      request.id,
      request,
    ])
  );

  const contactsByRequestId = new Map(
    ((contactsData ?? []) as Contact[]).map((contact) => [
      contact.request_id,
      contact,
    ])
  );

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro</p>
            <h1>Purchased leads</h1>
            <p className="hero-text">
              View homeowner contact details for leads you have already unlocked.
            </p>

            <div className="flex gap-sm">
              <Link href="/requests" className="button button-primary">
                Browse more leads
              </Link>
              <Link href="/account/fixa" className="button button-secondary">
                Buy FIXAs
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="lead-list">
              {purchasedLeads.map((lead) => {
                const request = requestsById.get(lead.request_id);
                const contact = contactsByRequestId.get(lead.request_id);

                if (!request) return null;

                return (
                  <article key={lead.id} className="card">
                    <div className="flex-between gap-md">
                      <div>
                        <p className="eyebrow">
                          {request.category_slug} · {request.city},{" "}
                          {request.state}
                        </p>

                        <h2>Unlocked lead</h2>

                        <p>{request.public_description}</p>

                        <div className="lead-row-meta">
                          <span>Purchased {formatDate(lead.purchased_at)}</span>
                          <span>{lead.price_fixas.toLocaleString()} FIXAs</span>
                          <span>
                            Request posted {formatDate(request.created_at)}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/requests/${request.public_slug}`}
                        className="button button-secondary"
                      >
                        View unlocked lead
                      </Link>
                    </div>

                    <div className="card-flat">
                      <p className="eyebrow">Customer contact</p>

                      {contact ? (
                        <div className="service-seo-list">
                          <p>
                            <strong>Name:</strong>{" "}
                            {contact.customer_name || "Not provided"}
                          </p>
                          <p>
                            <strong>Phone:</strong>{" "}
                            {contact.full_phone ||
                              `${contact.phone_country_code ?? ""} ${
                                contact.phone_number ?? ""
                              }`.trim() ||
                              "Not provided"}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {contact.email || "Not provided"}
                          </p>
                          <p>
                            <strong>Address:</strong>{" "}
                            {contact.street_address || "Not provided"}
                          </p>
                        </div>
                      ) : (
                        <p className="form-error">
                          Contact details are missing for this request.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}

              {purchasedLeads.length === 0 && (
                <div className="card">
                  <h2>No purchased leads yet</h2>
                  <p>
                    Browse open requests and unlock a homeowner contact to see it
                    here.
                  </p>
                  <Link href="/requests" className="button button-primary">
                    Browse leads
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}