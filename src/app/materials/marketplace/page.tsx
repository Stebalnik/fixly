import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import MaterialListingForm from "@/features/materials/MaterialListingForm";
import {
  formatMaterialCategory,
  formatMaterialPrice,
  getMaterialListingPath,
} from "@/lib/materials/listings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Marketplace | Used Building Materials and Renovation Leftovers",
  description:
    "Post and browse leftover building materials, used renovation supplies, surplus construction materials, tile, lumber, paint, fixtures, hardware, tools, and PVC conduit.",
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
  description: string;
};

const sampleListings = [
  {
    title: "Leftover 2 inch PVC conduits",
    meta: "Electrical supplies · Local pickup",
    price: "Make offer",
    text: "Extra conduit sitting in a garage after a project. Useful for repairs, shop wiring, and small electrical runs.",
  },
  {
    title: "Leftover bathroom tile after remodel",
    meta: "Tile and flooring · Austin, TX",
    price: "$90",
    text: "Sealed and open boxes from a shower renovation. Good for a small bathroom repair, backsplash, laundry room, or accent wall.",
  },
  {
    title: "Unused 2x4 lumber and plywood sheets",
    meta: "Lumber · Tampa, FL",
    price: "$140",
    text: "Clean project leftovers from a garage buildout. Better than letting usable lumber sit in the shed or go to waste.",
  },
];

async function getApprovedListings() {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("material_listings")
      .select(
        "id, public_slug, title, category, condition, price_cents, city, state, description"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(9);

    if (error) {
      console.error("Failed to load material listings", error);
      return [];
    }

    return (data ?? []) as MaterialListing[];
  } catch (error) {
    console.error("Unable to load material listings", error);
    return [];
  }
}

export default async function MaterialsMarketplacePage() {
  const approvedListings = await getApprovedListings();

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Materials marketplace</p>
              <h1>Post leftover materials for local buyers</h1>
              <p className="hero-text">
                Create a listing for unused, used, open-box, or leftover
                renovation supplies. The form also creates your seller dashboard
                so you can manage the listing after it is submitted.
              </p>
              <div className="flex gap-sm">
                <Link href="#post-listing" className="button button-primary">
                  Post a listing
                </Link>
                <Link href="/account" className="button button-secondary">
                  My listings
                </Link>
              </div>
            </div>

            <div className="card-flat">
              <p className="eyebrow">Good listings include</p>
              <h2>Quantity, condition, pickup city, and price</h2>
              <ul className="materials-checklist">
                <li>Size, color, brand, model, and quantity.</li>
                <li>Whether it is sealed, open box, leftover, or used.</li>
                <li>Pickup details and whether delivery is possible.</li>
                <li>Asking price or “make offer”.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="materials-section-heading">
              <p className="eyebrow">Marketplace</p>
              <h2>Discount building materials and project leftovers</h2>
            </div>

            <div className="grid-3 gap-md">
              {approvedListings.length > 0
                ? approvedListings.map((listing) => (
                    <article key={listing.id} className="card-flat lead-card">
                      <div className="lead-card-meta">
                        <span>{formatMaterialCategory(listing.category)}</span>
                        <span>
                          {listing.city}, {listing.state}
                        </span>
                      </div>
                      <h3>{listing.title}</h3>
                      <p>{listing.description.slice(0, 180)}</p>
                      <strong className="service-price">
                        {formatMaterialPrice(listing.price_cents)}
                      </strong>
                      <Link
                        href={getMaterialListingPath(listing.public_slug)}
                        className="button button-secondary lead-card-button"
                      >
                        View listing
                      </Link>
                    </article>
                  ))
                : sampleListings.map((listing) => (
                    <article key={listing.title} className="card-flat lead-card">
                      <div className="lead-card-meta">
                        <span>{listing.meta}</span>
                      </div>
                      <h3>{listing.title}</h3>
                      <p>{listing.text}</p>
                      <strong className="service-price">{listing.price}</strong>
                    </article>
                  ))}
            </div>
          </div>
        </section>

        <section id="post-listing" className="section">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Post materials for sale</p>
              <h2>Create a listing and seller account</h2>
              <p>
                Add the material type, condition, city, asking price, and pickup
                details. After submission, Fixly signs you in and opens your
                Materials account dashboard.
              </p>
            </div>

            <div className="card-flat">
              <MaterialListingForm />
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
