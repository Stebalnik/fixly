import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import MaterialListingForm from "@/features/materials/MaterialListingForm";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title:
    "Used Building Materials Marketplace | Sell Leftover Renovation Supplies",
  description:
    "Sell leftover building materials after renovation or buy discounted construction supplies nearby: tile, lumber, paint, flooring, fixtures, hardware, tools, and jobsite materials.",
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

const materialCategories = [
  {
    title: "Leftover tile and flooring",
    text: "Sell extra ceramic tile, porcelain tile, vinyl plank, hardwood flooring, stone, grout, underlayment, and trim pieces left after a remodel.",
  },
  {
    title: "Lumber, plywood, and sheet goods",
    text: "List unused studs, boards, plywood, MDF, OSB, shelving, decking, fence pickets, and other leftover construction wood.",
  },
  {
    title: "Paint, primer, and coatings",
    text: "Move sealed paint cans, stains, primers, caulk, patch compound, waterproofing, concrete sealer, and project consumables.",
  },
  {
    title: "Fixtures, hardware, and supplies",
    text: "Post extra faucets, sinks, lights, outlets, hinges, knobs, fasteners, plumbing fittings, electrical parts, and cabinet hardware.",
  },
  {
    title: "Doors, windows, and trim",
    text: "Find buyers for interior doors, exterior doors, windows, baseboards, casing, moulding, stair parts, and finish carpentry material.",
  },
  {
    title: "Tools and jobsite supplies",
    text: "Sell usable tools, blades, bits, tarps, buckets, safety gear, ladders, boxes of screws, anchors, and other jobsite leftovers.",
  },
];

const sampleListings = [
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
  {
    title: "Kitchen cabinet pulls and faucet",
    meta: "Fixtures and hardware · Phoenix, AZ",
    price: "$45",
    text: "Extra hardware from a kitchen update. Useful for rental repairs, small remodels, and budget-friendly home improvement projects.",
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

function formatPrice(priceCents: number | null) {
  if (priceCents === null) return "Make offer";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}

function formatCategory(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function MaterialsPage() {
  const approvedListings = await getApprovedListings();

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero materials-hero">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Fixly materials marketplace</p>
              <h1>Sell leftover building materials after renovation</h1>
              <p className="hero-text">
                After a remodel, repair, or contractor job, people often have
                extra tile, flooring, lumber, paint, fixtures, hardware, tools,
                and supplies sitting in the garage. Fixly Materials helps you
                turn those leftover renovation materials into cash and helps
                nearby homeowners find discounted building supplies for smaller
                projects.
              </p>

              <div className="flex gap-sm">
                <Link href="#sell-materials" className="button button-primary">
                  Sell leftover materials
                </Link>
                <Link href="#marketplace" className="button button-secondary">
                  Browse marketplace
                </Link>
              </div>
            </div>

            <div className="materials-onboarding-panel">
              <p className="eyebrow">Why this exists</p>
              <h2>Useful materials should not end up in the trash</h2>
              <p>
                One box of tile is too small for a supplier return, but perfect
                for a backsplash. Half a bundle of flooring can fix a damaged
                room. Extra lumber, unopened paint, trim, fasteners, and
                fixtures can help another local project finish for less.
              </p>
              <ul className="materials-checklist">
                <li>Post leftover construction materials in minutes.</li>
                <li>Reach people searching for cheap building supplies nearby.</li>
                <li>Keep usable renovation supplies out of storage and landfills.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section materials-intro-section">
          <div className="container grid-3 gap-md">
            <div className="card-flat">
              <p className="eyebrow">For sellers</p>
              <h2>Clean out the garage after a project</h2>
              <p>
                If a renovation left you with extra flooring, trim, paint,
                hardware, tile, lumber, plumbing parts, electrical supplies, or
                tools, create a local listing instead of letting usable
                materials collect dust.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">For buyers</p>
              <h2>Find discounted building materials nearby</h2>
              <p>
                Browse affordable project leftovers from homeowners,
                contractors, property managers, and small businesses. It is a
                practical way to save money on repairs, rentals, DIY jobs, and
                small home improvement projects.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">For local SEO</p>
              <h2>Built around real material searches</h2>
              <p>
                Listings can target searches like used building materials,
                leftover tile for sale, cheap lumber near me, discount flooring,
                reclaimed fixtures, and surplus construction supplies.
              </p>
            </div>
          </div>
        </section>

        <section id="marketplace" className="section">
          <div className="container">
            <div className="flex-between gap-md materials-section-heading">
              <div>
                <p className="eyebrow">Marketplace</p>
                <h2>Discount building materials and project leftovers</h2>
              </div>
              <Link href="#sell-materials" className="button button-secondary">
                Post a listing
              </Link>
            </div>

            <div className="grid-3 gap-md">
              {approvedListings.length > 0
                ? approvedListings.map((listing) => (
                    <article key={listing.id} className="card-flat lead-card">
                      <div className="lead-card-meta">
                        <span>{formatCategory(listing.category)}</span>
                        <span>
                          {listing.city}, {listing.state}
                        </span>
                      </div>
                      <h3>{listing.title}</h3>
                      <p>{listing.description.slice(0, 180)}</p>
                      <strong className="service-price">
                        {formatPrice(listing.price_cents)}
                      </strong>
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

        <section className="section materials-category-section">
          <div className="container">
            <div className="flex-between gap-md">
              <div>
                <p className="eyebrow">Popular categories</p>
                <h2>What people can sell on Fixly Materials</h2>
              </div>
            </div>

            <div className="grid-3 gap-md">
              {materialCategories.map((category) => (
                <div key={category.title} className="card-flat">
                  <h3>{category.title}</h3>
                  <p>{category.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="sell-materials" className="section">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Post materials for sale</p>
              <h2>Create a local listing for leftover renovation supplies</h2>
              <p>
                Add the material type, quantity, condition, city, asking price,
                and pickup details. Clear descriptions help buyers searching for
                surplus building materials, cheap construction supplies, used
                fixtures, reclaimed materials, and home improvement leftovers.
              </p>
              <div className="materials-tips">
                <h3>Good listing details include</h3>
                <ul className="materials-checklist">
                  <li>Quantity, size, color, brand, and model when available.</li>
                  <li>Whether packaging is sealed, open box, partial, or used.</li>
                  <li>Pickup city, timing, and whether delivery is possible.</li>
                  <li>Original price, asking price, or “make offer”.</li>
                </ul>
              </div>
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
