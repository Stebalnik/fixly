export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import PublicPageShell from "@/components/PublicPageShell";
import { getCategoryBySlug, getSubcategoryBySlug } from "@/lib/services";

type ServiceRequest = {
  id: string;
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  city: string;
  state: string;
  public_description: string;
  status: string;
  lead_status: string | null;
  purchase_count: number;
  max_purchases: number;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCurrentUser() {
  const cookieStore = await cookies();

  const serverSupabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  return user;
}

export default async function CustomerRequestsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?intent=customer&next=/customer/requests");
  }

  const { data, error } = await supabase
    .from("service_requests")
    .select(
      "id, public_slug, category_slug, subcategory_slug, city, state, public_description, status, lead_status, purchase_count, max_purchases, created_at"
    )
    .eq("customer_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const requests = (data ?? []) as ServiceRequest[];

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Customer account</p>

            <h1>My requests</h1>

            <p className="hero-text">
              View and manage all service requests you have posted on Fixly.
            </p>

            <div className="flex gap-md">
              <Link href="/book" className="button button-primary">
                Post new request
              </Link>

              <Link href="/customer" className="button button-secondary">
                Customer dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {requests.length === 0 ? (
              <div className="card">
                <h2>No requests yet</h2>

                <p>
                  You have not posted any service requests yet. Create your first
                  request and local pros will be able to respond.
                </p>

                <Link href="/book" className="button button-primary">
                  Post a request
                </Link>
              </div>
            ) : (
              <div className="grid-2">
                {requests.map((request) => {
                  const category = getCategoryBySlug(request.category_slug);
                  const subcategory = request.subcategory_slug
                    ? getSubcategoryBySlug(request.subcategory_slug)
                    : null;

                  const title =
                    subcategory?.title ??
                    category?.title ??
                    "Home Service Request";

                  return (
                    <article key={request.id} className="card card-hover">
                      <p className="eyebrow">
                        {request.city}, {request.state}
                      </p>

                      <h2>{title}</h2>

                      <p>{request.public_description}</p>

                      <div className="service-seo-list">
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className="badge badge-success">
                            {request.status}
                          </span>
                        </p>

                        {request.lead_status && (
                          <p>
                            <strong>Lead status:</strong> {request.lead_status}
                          </p>
                        )}

                        <p>
                          <strong>Purchased:</strong>{" "}
                          {request.purchase_count}/{request.max_purchases} pros
                        </p>

                        <p>
                          <strong>Posted:</strong>{" "}
                          {new Date(request.created_at).toLocaleDateString(
                            "en-US"
                          )}
                        </p>
                      </div>

                      <div className="flex gap-md">
                        <Link
                          href={`/customer/requests/${request.id}/manage`}
                          className="button button-primary"
                        >
                          Manage
                        </Link>

                        <Link
                          href={`/requests/${request.public_slug}`}
                          className="button button-secondary"
                        >
                          Public page
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}