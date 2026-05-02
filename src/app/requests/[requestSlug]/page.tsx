import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCategoryBySlug, getSubcategoryBySlug } from "@/lib/services";
import { getMarketBySlug } from "@/lib/geo";

type PageProps = {
  params: Promise<{
    requestSlug: string;
  }>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateMetadata({ params }: PageProps) {
  const { requestSlug } = await params;

  const { data } = await supabase
    .from("service_requests")
    .select("public_slug, city, state, public_description, subcategory_slug, category_slug")
    .eq("public_slug", requestSlug)
    .single();

  if (!data) {
    return {
      title: "Request Not Found | Fixly",
    };
  }

  const subcategory = data.subcategory_slug
    ? getSubcategoryBySlug(data.subcategory_slug)
    : null;

  const category = getCategoryBySlug(data.category_slug);

  const title = subcategory?.title ?? category?.title ?? "Home Service Request";

  return {
    title: `${title} in ${data.city}, ${data.state} | Fixly Request`,
    description: data.public_description.slice(0, 150),
  };
}

export default async function RequestPage({ params }: PageProps) {
  const { requestSlug } = await params;

  const { data: request, error } = await supabase
    .from("service_requests")
    .select(
      "public_slug, category_slug, subcategory_slug, market_slug, city, state, country_code, public_description, status, quality_score, index_status, created_at"
    )
    .eq("public_slug", requestSlug)
    .single();

  if (error || !request) {
    notFound();
  }

  const category = getCategoryBySlug(request.category_slug);
  const subcategory = request.subcategory_slug
    ? getSubcategoryBySlug(request.subcategory_slug)
    : null;
  const market = getMarketBySlug(request.market_slug);

  const title = subcategory?.title ?? category?.title ?? "Home Service Request";
  const serviceLabel =
    subcategory?.shortTitle ?? category?.shortTitle ?? "Home Service";

  return (
    <main className="page">
      <section className="service-hero">
        <div className="container">
          <p className="eyebrow">Public request</p>

          <h1>
            {title} in {request.city}, {request.state}
          </h1>

          <p className="hero-text">{request.public_description}</p>

          <div className="flex gap-md">
            <Link href="/book" className="button button-primary">
              Post another request
            </Link>

            <Link href="/services" className="button button-secondary">
              Browse services
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <h2>Request details</h2>

            <div className="service-seo-list">
              <p>
                <strong>Service:</strong> {serviceLabel}
              </p>

              <p>
                <strong>Location:</strong> {request.city}, {request.state}
              </p>

              {market && (
                <p>
                  <strong>Area:</strong> {market.region}
                </p>
              )}

              <p>
                <strong>Status:</strong>{" "}
                <span className="badge badge-success">{request.status}</span>
              </p>

              <p>
                <strong>Posted:</strong>{" "}
                {new Date(request.created_at).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>

          <div className="card">
            <h2>For pros</h2>

            <p>
              This request is publicly visible. Customer contact details are not
              shown publicly and will only be available after paid lead access.
            </p>

            <div className="flex gap-md">
              <Link href="/pro" className="button button-primary">
                Unlock lead for $1
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="card">
            <h2>Job description</h2>
            <p>{request.public_description}</p>
          </div>
        </div>
      </section>
    </main>
  );
}