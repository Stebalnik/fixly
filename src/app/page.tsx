export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CategoryIcon from "@/components/CategoryIcon";
import PublicPageShell from "@/components/PublicPageShell";
import {
  getRequestPublicPath,
  getRequestsPath,
} from "@/lib/routes/marketplace";
import {
  categories,
  getCategoryBySlug,
  getSubcategoryBySlug,
} from "@/lib/services";

type PublicRequest = {
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  city: string;
  state: string;
  country_code: string | null;
  public_description: string;
  status: string;
  lead_status: string;
  lead_price_credits: number;
  lead_price_fixas: number | null;
  purchase_count: number;
  created_at: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const metadata = {
  title: "Fixly — Find Local Home Service Pros",
  description:
    "Request home services, browse local service categories, and view open home service requests from homeowners near you.",
};

const topCategorySlugs = [
  "handyman",
  "plumbing",
  "electrical",
  "hvac",
  "cleaning",
  "painting",
  "lawn-care",
  "roofing",
  "remodeling",
  "flooring",
  "appliance-repair-installation",
  "junk-removal",
];

function trimText(value: string, maxLength = 140) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function getLeadPriceFixas(request: PublicRequest) {
  return request.lead_price_fixas ?? request.lead_price_credits ?? 0;
}

async function getLatestRequests(): Promise<PublicRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select(
      "public_slug, category_slug, subcategory_slug, city, state, country_code, public_description, status, lead_status, lead_price_credits, lead_price_fixas, purchase_count, created_at"
    )
    .eq("status", "open")
    .eq("lead_status", "available")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return [];
  }

  return data ?? [];
}

export default async function HomePage() {
  const latestRequests = await getLatestRequests();

  const topCategories = topCategorySlugs
    .map((slug) => categories[slug])
    .filter(Boolean);

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Fixly Marketplace</p>
              <h1>Find trusted home service pros near you</h1>
              <p className="hero-text">
                Request handyman, plumbing, electrical, cleaning, remodeling,
                lawn care, roofing, HVAC, and other home services from local
                pros.
              </p>

              <div className="flex gap-sm">
                <Link href="/book" className="button button-primary">
                  Request service
                </Link>
                <Link
                  href={getRequestsPath("us")}
                  className="button button-secondary"
                >
                  View open requests
                </Link>
              </div>
            </div>

            <div className="card service-cta-card">
              <p className="eyebrow">For homeowners</p>
              <h2>Post a request in minutes</h2>
              <p>
                Tell Fixly what you need, choose your city and service category,
                and create a public request local pros can review.
              </p>
              <Link href="/book" className="button button-primary">
                Start request
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="flex-between gap-md">
              <div>
                <p className="eyebrow">Popular service directions</p>
                <h2>Browse home service categories</h2>
              </div>
              <Link href="/services" className="button button-outline">
                All services
              </Link>
            </div>

            <div className="grid-4 gap-md">
              {topCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="card card-hover"
                >
                  <CategoryIcon
                    icon={category.icon}
                    title={category.shortTitle}
                  />
                  <h3>{category.shortTitle}</h3>
                  <p>{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="flex-between gap-md">
              <div>
                <p className="eyebrow">Live marketplace</p>
                <h2>Latest service requests</h2>
                <p className="text-muted">
                  Showing the 5 latest open requests at page load.
                </p>
              </div>
              <Link
                href={getRequestsPath("us")}
                className="button button-outline"
              >
                View all leads
              </Link>
            </div>

            {latestRequests.length > 0 ? (
              <div className="grid-3 gap-md">
                {latestRequests.map((request) => {
                  const category = getCategoryBySlug(request.category_slug);
                  const subcategory = request.subcategory_slug
                    ? getSubcategoryBySlug(request.subcategory_slug)
                    : null;

                  const title =
                    subcategory?.title ??
                    category?.title ??
                    "Home Service Request";

                  const requestCountry = request.country_code || "us";
                  const leadPriceFixas = getLeadPriceFixas(request);

                  return (
                    <Link
                      key={request.public_slug}
                      href={getRequestPublicPath(
                        request.public_slug,
                        requestCountry
                      )}
                      className="card card-hover lead-card"
                    >
                      <div className="flex-between gap-sm">
                        <p className="eyebrow">
                          {request.city}, {request.state}
                        </p>
                        <span className="badge badge-success">Open</span>
                      </div>

                      <h3>{title}</h3>

                      <p>{trimText(request.public_description)}</p>

                      <div className="lead-card-meta">
                        <span>{leadPriceFixas.toLocaleString()} FIXAs</span>
                        <span>{request.purchase_count} pros purchased</span>
                      </div>

                      <span className="button button-secondary lead-card-button">
                        View job
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="card">
                <h3>No open requests yet</h3>
                <p>
                  New public requests will appear here after homeowners submit
                  them.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="container">
            <p className="eyebrow">How Fixly works</p>
            <h2>One request, local pros, clear next step</h2>

            <div className="grid-3 gap-md">
              <div className="card-flat">
                <h3>1. Post your request</h3>
                <p>Choose a service, city, and describe what needs to be done.</p>
              </div>

              <div className="card-flat">
                <h3>2. Pros review the lead</h3>
                <p>
                  Local pros can browse public requests and unlock qualified
                  leads.
                </p>
              </div>

              <div className="card-flat">
                <h3>3. Get the job done</h3>
                <p>Homeowners connect with pros and choose the right fit.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <div className="service-cta-card">
              <p className="eyebrow">Need help today?</p>
              <h2>Request a home service now</h2>
              <p>
                Submit your request and create a public lead for local home
                service pros.
              </p>
              <Link href="/book" className="button button-primary">
                Book service
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}