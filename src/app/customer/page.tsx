export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import PublicPageShell from "@/components/PublicPageShell";
import { getCurrentUser } from "@/lib/auth/account";
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
  max_purchases: number | null;
  max_responses: number | null;
  archive_after: string | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getLeadStatusClass(status: string | null) {
  if (status === "sold_out") return "badge badge-warning";
  if (status === "closed") return "badge";
  return "badge badge-success";
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
      max_purchases,
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

  const activeRequests = customerRequests.filter(
    (request) => request.status === "open"
  );
  const closedRequests = customerRequests.filter(
    (request) => request.status !== "open"
  );

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container">
          <div className="flex flex-between gap-md">
            <div>
              <p className="eyebrow">Customer dashboard</p>

              <h1>My requests</h1>

              <p className="hero-text">
                Track your service requests, view pro responses, manage open
                jobs, and start conversations.
              </p>
            </div>

            <div className="flex gap-sm">
              <Link href="/account" className="button button-secondary">
                Account
              </Link>

              <Link href="/book" className="button button-primary">
                New request
              </Link>
            </div>
          </div>

          <div className="grid-3 account-summary-grid">
            <div className="card">
              <p className="eyebrow">Active requests</p>
              <h2>{activeRequests.length}</h2>
              <p className="text-muted">
                Open requests currently available for pro responses.
              </p>
            </div>

            <div className="card">
              <p className="eyebrow">Total responses</p>
              <h2>
                {customerRequests
                  .reduce(
                    (total, request) => total + (request.purchase_count ?? 0),
                    0
                  )
                  .toLocaleString()}
              </h2>
              <p className="text-muted">
                Pros who have opened your request details.
              </p>
            </div>

            <div className="card">
              <p className="eyebrow">Messages</p>
              <h2>Inbox</h2>
              <p className="text-muted">
                Continue conversations with pros from one place.
              </p>

              <Link href="/account/messages" className="button button-secondary">
                Open messages
              </Link>
            </div>
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
              {customerRequests.map((request) => {
                const maxResponses =
                  request.max_purchases ?? request.max_responses ?? 5;
                const responseCount = request.purchase_count ?? 0;
                const isOpen = request.status === "open";

                return (
                  <article key={request.id} className="card">
                    <div className="flex flex-between gap-md">
                      <div>
                        <p className="eyebrow">
                          {request.city}, {request.state} ·{" "}
                          {formatDate(request.created_at)}
                        </p>

                        <h2>
                          {request.subcategory_slug ?? request.category_slug}
                        </h2>

                        <p>{request.public_description}</p>

                        <div className="flex gap-sm">
                          <span
                            className={
                              isOpen ? "badge badge-primary" : "badge"
                            }
                          >
                            {request.status}
                          </span>

                          <span
                            className={getLeadStatusClass(
                              request.lead_status
                            )}
                          >
                            {request.lead_status ?? "unknown"}
                          </span>

                          <span className="badge badge-success">
                            {responseCount} / {maxResponses} responses
                          </span>
                        </div>

                        {request.archive_after ? (
                          <p className="text-muted">
                            Auto-archive after{" "}
                            {formatDate(request.archive_after)}
                          </p>
                        ) : null}
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
                );
              })}
            </div>
          )}

          {closedRequests.length > 0 ? (
            <div className="section-sm">
              <p className="text-muted">
                Closed, archived, deleted, or sold-out requests remain visible
                here for your records.
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </PublicPageShell>
  );
}