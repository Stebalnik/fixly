import Link from "next/link";
import { redirect } from "next/navigation";
import PublicPageShell from "@/components/PublicPageShell";
import { getCurrentUser } from "@/lib/auth/account";
import {
  formatMaterialCategory,
  formatMaterialPrice,
  getMaterialListingPath,
} from "@/lib/materials/listings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Materials Listings | Fixly Materials",
  description: "Manage your Fixly Materials listings.",
};

type MaterialListing = {
  id: string;
  public_slug: string;
  title: string;
  category: string;
  condition: string;
  price_cents: number | null;
  city: string;
  state: string;
  status: string;
  description: string;
  created_at: string;
};

export default async function MaterialsAccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/marketplace");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("material_listings")
    .select(
      "id, public_slug, title, category, condition, price_cents, city, state, status, description, created_at"
    )
    .eq("seller_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const listings = (data ?? []) as MaterialListing[];

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Materials account</p>
            <h1>My materials listings</h1>
            <p className="hero-text">
              Track listings you posted on Fixly Materials. Approved listings
              are visible to marketplace visitors.
            </p>
            <Link href="/marketplace#post-listing" className="button button-primary">
              Post another listing
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {listings.length === 0 ? (
              <div className="card-flat">
                <h2>No material listings yet</h2>
                <p>
                  Post leftover construction supplies, used building materials,
                  extra PVC conduit, tile, lumber, paint, or fixtures to create
                  your first listing.
                </p>
                <Link
                  href="/marketplace#post-listing"
                  className="button button-primary"
                >
                  Post a listing
                </Link>
              </div>
            ) : (
              <div className="grid-2 gap-md">
                {listings.map((listing) => (
                  <article key={listing.id} className="card-flat lead-card">
                    <div className="lead-card-meta">
                      <span>{formatMaterialCategory(listing.category)}</span>
                      <span>
                        {listing.city}, {listing.state}
                      </span>
                    </div>
                    <h2>{listing.title}</h2>
                    <p>{listing.description}</p>
                    <div className="lead-card-meta">
                      <strong>{formatMaterialPrice(listing.price_cents)}</strong>
                      <span className="badge badge-warning">{listing.status}</span>
                      <span>
                        Posted{" "}
                        {new Date(listing.created_at).toLocaleDateString(
                          "en-US"
                        )}
                      </span>
                    </div>
                    <Link
                      href={getMaterialListingPath(listing.public_slug)}
                      className="button button-secondary lead-card-button"
                    >
                      Public listing
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
