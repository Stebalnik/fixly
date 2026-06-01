import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { getProJobIntentPath, proJobIntents } from "@/lib/pro/jobIntents";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Side Jobs, Local Gigs, and Temporary Work | Fixly Pro",
  description:
    "Explore Fixly Pro pages for side jobs, weekend gigs, temporary contractor work, local service calls, and home service opportunities.",
};

export default function ProSideJobsHubPage() {
  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro SEO hub</p>
            <h1>Side jobs, local gigs, and temporary work</h1>
            <p className="hero-text">
              Browse long-tail job opportunity pages for pros looking for
              flexible local work, weekend jobs, home service gigs, and
              short-term contractor jobs.
            </p>
            <Link href="/jobs/browse" className="button button-primary">
              Browse open jobs
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="container grid-3 gap-md">
            {proJobIntents.map((intent) => (
              <Link
                key={intent.slug}
                href={getProJobIntentPath(intent.slug)}
                className="card-flat card-hover"
              >
                <p className="eyebrow">Pro work</p>
                <h2>{intent.h1}</h2>
                <p>{intent.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
