import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCategoryBySlug, getSubcategoryBySlug } from "@/lib/services";
import {
  getRequestPublicPath,
  getRequestsPath,
} from "@/lib/routes/marketplace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Completed Home Service Jobs | Fixly",
  description:
    "Browse recently completed home service jobs on Fixly. See real public service requests by city, category, and project type.",
};

type CompletedRequest = {
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  market_slug: string | null;
  country_code: string | null;
  city: string;
  state: string;
  public_description: string;
  status: string;
  lead_status: string | null;
  created_at: string;
  archived_at: string | null;
};

export default async function CompletedJobsPage() {
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("service_requests")
    .select(
      "public_slug, category_slug, subcategory_slug, market_slug, country_code, city, state, public_description, status, lead_status, created_at, archived_at"
    )
    .eq("status", "archived")
    .order("archived_at", { ascending: false })
    .limit(48);

  const requests = (data ?? []) as CompletedRequest[];

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Completed jobs</p>

            <h1>Completed Home Service Jobs</h1>

            <p className="hero-text">
              Browse recently completed public service requests on Fixly. These
              jobs are no longer accepting responses, but they help homeowners
              understand real project types, locations, and service needs.
            </p>

            <div className="flex gap-md">
              <Link href="/book" className="button button-primary">
                Post a similar request
              </Link>

              <Link
                href={getRequestsPath("us")}
                className="button button-secondary"
              >
                View active requests
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {requests.length === 0 ? (
              <div className="card">
                <h2>No completed jobs yet</h2>
                <p>
                  Completed jobs will appear here after public requests are
                  archived.
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
                    "Completed Home Service Job";

                  const requestCountry = request.country_code || "us";

                  return (
                    <article
                      key={request.public_slug}
                      className="card card-hover"
                    >
                      <p className="eyebrow">
                        {request.city}, {request.state}
                      </p>

                      <h2>{title}</h2>

                      <p>{request.public_description}</p>

                      <div className="service-seo-list">
                        <p>
                          <strong>Status:</strong>{" "}
                          <span className="badge badge-success">
                            Completed
                          </span>
                        </p>

                        <p>
                          <strong>Posted:</strong>{" "}
                          {new Date(request.created_at).toLocaleDateString(
                            "en-US"
                          )}
                        </p>

                        {request.archived_at ? (
                          <p>
                            <strong>Completed:</strong>{" "}
                            {new Date(request.archived_at).toLocaleDateString(
                              "en-US"
                            )}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex gap-md">
                        <Link
                          href={getRequestPublicPath(
                            request.public_slug,
                            requestCountry
                          )}
                          className="button button-secondary"
                        >
                          View job page
                        </Link>

                        <Link href="/book" className="button button-primary">
                          Post similar request
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