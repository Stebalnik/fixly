import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";
import {
  formatMaterialCategory,
  formatMaterialCondition,
  formatMaterialPrice,
} from "@/lib/materials/listings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type MaterialListing = {
  id: string;
  public_slug: string;
  title: string;
  category: string;
  condition: string;
  price_cents: number | null;
  city: string;
  state: string;
  description: string;
  seller_name: string;
  seller_email: string;
  seller_phone: string | null;
  created_at: string;
};

type MaterialListingPageProps = {
  params: Promise<{
    listingSlug: string;
  }>;
};

async function getListing(listingSlug: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("material_listings")
    .select(
      "id, public_slug, title, category, condition, price_cents, city, state, description, seller_name, seller_email, seller_phone, created_at"
    )
    .eq("public_slug", listingSlug)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    console.error("Failed to load material listing", error);
    return null;
  }

  return data as MaterialListing | null;
}

export async function generateMetadata({
  params,
}: MaterialListingPageProps): Promise<Metadata> {
  const { listingSlug } = await params;
  const listing = await getListing(listingSlug);

  if (!listing) {
    return {
      title: "Material Listing Not Found | Fixly Materials",
    };
  }

  return {
    title: `${listing.title} for Sale in ${listing.city}, ${listing.state} | Fixly Materials`,
    description: `${listing.title} available in ${listing.city}, ${listing.state}. ${listing.description.slice(
      0,
      140
    )}`,
    alternates: {
      canonical: `/marketplace/${listing.public_slug}`,
    },
  };
}

export default async function MaterialListingPage({
  params,
}: MaterialListingPageProps) {
  const { listingSlug } = await params;
  const listing = await getListing(listingSlug);

  if (!listing) {
    notFound();
  }

  const phoneHref = listing.seller_phone
    ? `tel:${listing.seller_phone.replace(/[^\d+]/g, "")}`
    : null;
  const mailHref = `mailto:${listing.seller_email}?subject=${encodeURIComponent(
    `Fixly Materials: ${listing.title}`
  )}`;

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">
                {formatMaterialCategory(listing.category)} ·{" "}
                {listing.city}, {listing.state}
              </p>
              <h1>{listing.title}</h1>
              <p className="hero-text">{listing.description}</p>
              <div className="flex gap-sm">
                <a href={mailHref} className="button button-primary">
                  Email seller
                </a>
                {phoneHref ? (
                  <a href={phoneHref} className="button button-secondary">
                    Call seller
                  </a>
                ) : null}
              </div>
            </div>

            <div className="card-flat">
              <p className="eyebrow">Listing details</p>
              <h2>{formatMaterialPrice(listing.price_cents)}</h2>
              <div className="service-list">
                <p>
                  <strong>Condition:</strong>{" "}
                  {formatMaterialCondition(listing.condition)}
                </p>
                <p>
                  <strong>Location:</strong> {listing.city}, {listing.state}
                </p>
                <p>
                  <strong>Posted:</strong>{" "}
                  {new Date(listing.created_at).toLocaleDateString("en-US")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2 gap-lg">
            <article className="card-flat">
              <p className="eyebrow">Description</p>
              <h2>About these materials</h2>
              <p>{listing.description}</p>
            </article>

            <aside className="card-flat">
              <p className="eyebrow">Seller contact</p>
              <h2>{listing.seller_name}</h2>
              <div className="service-list">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href={mailHref}>{listing.seller_email}</a>
                </p>
                {listing.seller_phone ? (
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a href={phoneHref ?? undefined}>{listing.seller_phone}</a>
                  </p>
                ) : (
                  <p className="text-muted">
                    Seller did not add a phone number. Use email to reach out.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <Link href="/marketplace" className="button button-secondary">
              Back to marketplace
            </Link>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
