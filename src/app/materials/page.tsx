import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Fixly Materials — Discount Leftover Building Materials",
  description:
    "A local marketplace for leftover building materials, fixtures, tools, and project supplies from homeowners and contractors.",
};

const materialCategories = [
  "Lumber and sheet goods",
  "Tile, stone, and flooring",
  "Paint, primer, and coatings",
  "Doors, windows, and trim",
  "Fixtures and hardware",
  "Tools and jobsite supplies",
];

export default function MaterialsPage() {
  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Fixly materials exchange</p>
              <h1>Buy and sell leftover project materials locally</h1>
              <p className="hero-text">
                A separate Fixly portal for discounted construction leftovers:
                extra tile, lumber, fixtures, paint, flooring, hardware, and
                other materials from nearby projects.
              </p>

              <div className="flex gap-sm">
                <Link href="/book" className="button button-primary">
                  Request a service
                </Link>
                <Link href="/services" className="button button-secondary">
                  Browse services
                </Link>
              </div>
            </div>

            <div className="card service-cta-card">
              <p className="eyebrow">Coming next</p>
              <h2>Materials listings</h2>
              <p>
                This portal is being prepared for local materials listings so
                homeowners and pros can move extra supplies instead of throwing
                them away.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="flex-between gap-md">
              <div>
                <p className="eyebrow">Useful for local projects</p>
                <h2>Materials people often have left over</h2>
              </div>
            </div>

            <div className="grid-3 gap-md">
              {materialCategories.map((category) => (
                <div key={category} className="card-flat">
                  <h3>{category}</h3>
                  <p>
                    List extra supplies from a renovation, repair, move-out, or
                    contractor job and help someone nearby finish a project for
                    less.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
