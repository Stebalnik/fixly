import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getCategoryBySlug, getSubcategoryBySlug } from "@/lib/services";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata = {
  title: "Open Home Service Requests | Fixly",
  description:
    "Browse open home service requests from homeowners looking for local pros.",
};

export default async function RequestsPage() {
  const { data: requests } = await supabase
    .from("service_requests")
    .select(
      "public_slug, category_slug, subcategory_slug, city, state, public_description, status, created_at"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="page">
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Fixly Marketplace</p>

          <h1>Open home service requests</h1>

          <p className="hero-text">
            Browse public requests from homeowners. Contact details are private
            and only available after paid lead access.
          </p>

          <Link href="/book" className="button button-primary">
            Post a request
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid-3">
            {(requests ?? []).map((request) => {
              const category = getCategoryBySlug(request.category_slug);
              const subcategory = request.subcategory_slug
                ? getSubcategoryBySlug(request.subcategory_slug)
                : null;

              const title =
                subcategory?.title ?? category?.title ?? "Home Service Request";

              return (
                <Link
                  key={request.public_slug}
                  href={`/requests/${request.public_slug}`}
                  className="card card-hover"
                >
                  <p className="eyebrow">
                    {request.city}, {request.state}
                  </p>

                  <h3>{title}</h3>

                  <p>{request.public_description.slice(0, 140)}...</p>

                  <p className="text-muted">
                    Posted{" "}
                    {new Date(request.created_at).toLocaleDateString("en-US")}
                  </p>
                </Link>
              );
            })}
          </div>

          {(!requests || requests.length === 0) && (
            <div className="card">
              <h2>No open requests yet</h2>
              <p>New public requests will appear here after homeowners submit them.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}