import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import PublicPageShell from "@/components/PublicPageShell";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "My Requests | Fixly",
};

type CustomerRequest = {
  id: string;
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  city: string;
  state: string;
  public_description: string;
  status: string;
  lead_status: string | null;
  purchase_count: number | null;
  max_responses: number | null;
  archive_after: string | null;
  created_at: string;
};

async function getCurrentUser() {
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

  return user;
}

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?intent=customer&next=/customer");
  }

  const admin = createSupabaseAdminClient();

  const { data: requests, error } = await admin
    .from("service_requests")
    .select(
      `
      id,
      public_slug,
      category_slug,
      subcategory_slug,
      city,
      state,
      public_description,
      status,
      lead_status,
      purchase_count,
      max_responses,
      archive_after,
      created_at
    `
    )
    .eq("customer_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const customerRequests = (requests ?? []) as CustomerRequest[];

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container">
          <div className="flex flex-between gap-md">
            <div>
              <p className="eyebrow">Customer dashboard</p>
              <h1>My requests</h1>
              <p className="hero-text">
                Track your service requests, view public pages, and manage open
                jobs.
              </p>
            </div>

            <Link href="/book" className="button button-primary">
              New request
            </Link>
          </div>

          {customerRequests.length === 0 ? (
            <div className="card">
              <h2>No requests yet</h2>
              <p>
                Create your first service request and local pros will be able to
                review it.
              </p>

              <Link href="/book" className="button button-primary">
                Request service
              </Link>
            </div>
          ) : (
            <div className="grid-1 customer-request-list">
              {customerRequests.map((request) => (
                <article key={request.id} className="card">
                  <div className="flex flex-between gap-md">
                    <div>
                      <p className="eyebrow">
                        {request.city}, {request.state}
                      </p>

                      <h2>
                        {request.subcategory_slug ?? request.category_slug}
                      </h2>

                      <p>{request.public_description}</p>

                      <div className="flex gap-sm">
                        <span className="badge badge-primary">
                          {request.status}
                        </span>

                        <span className="badge badge-success">
                          {request.purchase_count ?? 0} /{" "}
                          {request.max_responses ?? 5} responses
                        </span>
                      </div>
                    </div>

                    <div className="customer-request-actions">
                      <Link
                        href={`/requests/${request.public_slug}`}
                        className="button button-secondary"
                      >
                        View
                      </Link>

                      <Link
                        href={`/customer/requests/${request.id}/manage`}
                        className="button button-outline"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </PublicPageShell>
  );
}