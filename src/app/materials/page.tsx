import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fixly Materials | Sell Leftover Building Materials Locally",
  description:
    "Fixly Materials helps homeowners and contractors sell leftover renovation supplies, used building materials, surplus construction materials, tile, lumber, paint, fixtures, and tools locally.",
};

const materialCategories = [
  {
    title: "Leftover tile and flooring",
    text: "Extra ceramic tile, porcelain tile, vinyl plank, hardwood flooring, stone, grout, underlayment, and trim pieces left after a remodel.",
  },
  {
    title: "Lumber, plywood, and sheet goods",
    text: "Unused studs, boards, plywood, MDF, OSB, shelving, decking, fence pickets, and other leftover construction wood.",
  },
  {
    title: "Paint, primer, and coatings",
    text: "Sealed paint cans, stains, primers, caulk, patch compound, waterproofing, concrete sealer, and project consumables.",
  },
  {
    title: "Fixtures, hardware, and supplies",
    text: "Extra faucets, sinks, lights, outlets, hinges, knobs, fasteners, plumbing fittings, electrical parts, and cabinet hardware.",
  },
  {
    title: "Doors, windows, and trim",
    text: "Interior doors, exterior doors, windows, baseboards, casing, moulding, stair parts, and finish carpentry material.",
  },
  {
    title: "Tools and jobsite supplies",
    text: "Usable tools, blades, bits, tarps, buckets, safety gear, ladders, screws, anchors, and other jobsite leftovers.",
  },
];

export default function MaterialsOnboardingPage() {
  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Fixly materials</p>
              <h1>Sell leftover building materials after renovation</h1>
              <p className="hero-text">
                After a remodel, repair, move-out, or contractor job, there are
                often usable materials left in the garage: 2 inch PVC conduits,
                tile, flooring, lumber, paint, fixtures, fasteners, trim, tools,
                and supplies. Fixly Materials is a local marketplace for turning
                those project leftovers into cash instead of letting them sit in
                storage.
              </p>

              <div className="flex gap-sm">
                <Link href="/marketplace" className="button button-primary">
                  Post leftover materials
                </Link>
                <Link href="/marketplace" className="button button-secondary">
                  Browse marketplace
                </Link>
              </div>
            </div>

            <div className="materials-onboarding-panel">
              <p className="eyebrow">Why this exists</p>
              <h2>Useful materials should be easy to resell locally</h2>
              <p>
                One box of tile is too small for a supplier return, but perfect
                for a backsplash. Half a bundle of conduit, flooring, or trim
                can finish a small repair. Extra paint, fittings, fixtures, and
                hardware can help someone nearby complete a project for less.
              </p>
              <ul className="materials-checklist">
                <li>Post leftover renovation materials in minutes.</li>
                <li>Reach buyers searching for cheap building supplies nearby.</li>
                <li>Keep usable construction supplies out of the landfill.</li>
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
                hardware, tile, lumber, plumbing parts, electrical supplies, PVC
                conduit, or tools, create a listing and let local buyers find it.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">For buyers</p>
              <h2>Find discounted building materials nearby</h2>
              <p>
                Save money on DIY repairs, rental turns, garage projects, small
                remodels, and handyman jobs by buying unused or gently used
                materials from nearby homeowners and contractors.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">For search</p>
              <h2>Built around real material searches</h2>
              <p>
                Listings can match searches like used building materials,
                leftover tile for sale, cheap lumber near me, discount flooring,
                PVC conduit for sale, reclaimed fixtures, and surplus supplies.
              </p>
            </div>
          </div>
        </section>

        <section className="section materials-category-section">
          <div className="container">
            <div className="materials-section-heading">
              <p className="eyebrow">Popular categories</p>
              <h2>What people can sell on Fixly Materials</h2>
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

        <section className="section">
          <div className="container-narrow card-flat">
            <p className="eyebrow">Ready to list</p>
            <h2>Post materials and create your seller dashboard</h2>
            <p>
              The marketplace form creates your listing and your Fixly Materials
              account in one step, then sends you to your dashboard so you can
              track the listing status.
            </p>
            <Link href="/marketplace" className="button button-primary">
              Go to marketplace
            </Link>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
