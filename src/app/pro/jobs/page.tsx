import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { getProJobIntentPath, proJobIntents } from "@/lib/pro/jobIntents";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cheap Home Service Leads and Side Jobs | Fixly Pro",
  description:
    "Fixly Pro helps contractors, handymen, cleaners, plumbers, electricians, movers, and local service pros find affordable leads, side jobs, and temporary work.",
};

const workTypes = [
  "handyman jobs",
  "plumbing leads",
  "electrical work",
  "cleaning jobs",
  "moving help",
  "junk removal gigs",
  "painting leads",
  "lawn care work",
  "HVAC requests",
  "roofing jobs",
  "fence repair",
  "remodeling projects",
];

const competitorTerms = [
  "Thumbtack alternatives",
  "Angi leads alternatives",
  "HomeAdvisor leads alternatives",
  "TaskRabbit-style local gigs",
  "Handy pro work alternatives",
  "Porch contractor lead alternatives",
];

export default function ProJobsPage() {
  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro jobs</p>
            <h1>Affordable home service leads, side jobs, and local gigs</h1>
            <p className="hero-text">
              Fixly Pro is built for independent contractors, handymen,
              plumbers, electricians, cleaners, movers, painters, landscapers,
              remodelers, and small crews who want more work without paying
              heavy lead fees before they know whether a job is worth pursuing.
            </p>
            <div className="flex gap-md">
              <Link href="/jobs/browse" className="button button-primary">
                Browse open jobs
              </Link>
              <Link href="/signup" className="button button-secondary">
                Join as a pro
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-3">
            <div className="card-flat">
              <p className="eyebrow">Cheap leads</p>
              <h2>Review the job before unlocking contact details</h2>
              <p>
                Public job pages show the service type, city, customer message,
                and posting date first. Customer phone, email, address, lead
                price, and response activity stay private until a registered pro
                decides to unlock the opportunity.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">Built with pros</p>
              <h2>We grow with professionals, not at their expense</h2>
              <p>
                Fixly is designed around low-cost access, almost free discovery,
                and transparent local demand. The goal is not to squeeze pros
                with expensive lead packages, but to help pros find jobs and
                keep the platform useful when the work is real.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">Flexible work</p>
              <h2>Side jobs, weekend work, and short-term service calls</h2>
              <p>
                Use Fixly Pro to find small jobs between larger projects,
                emergency calls, after-hours work, weekend gigs, seasonal help,
                one-day tasks, and temporary local work from homeowners.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2 gap-lg">
            <article className="card-flat">
              <p className="eyebrow">Marketplace alternatives</p>
              <h2>For pros comparing Thumbtack, Angi, HomeAdvisor, and more</h2>
              <p>
                Many pros search for Thumbtack alternatives, Angi leads
                alternatives, HomeAdvisor alternatives, TaskRabbit gigs, Handy
                pro work, Porch leads, contractor lead sites, cheap handyman
                leads, and local service job boards. Fixly Pro is a simpler
                option for finding homeowner requests while keeping the public
                job preview open and the private lead details protected.
              </p>
              <div className="lead-row-meta">
                {competitorTerms.map((term) => (
                  <span key={term}>{term}</span>
                ))}
              </div>
            </article>

            <article className="card-flat">
              <p className="eyebrow">Work categories</p>
              <h2>Home service jobs that can turn into paid local work</h2>
              <p>
                Fixly Pro indexes real homeowner requests across repair,
                maintenance, installation, cleanup, moving, outdoor work, and
                remodeling categories so pros can find nearby opportunities.
              </p>
              <div className="lead-row-meta">
                {workTypes.map((type) => (
                  <span key={type}>{type}</span>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="materials-section-heading">
              <p className="eyebrow">Find work by intent</p>
              <h2>SEO pages for pros looking for specific kinds of work</h2>
            </div>

            <div className="grid-3 gap-md">
              {proJobIntents.map((intent) => (
                <Link
                  key={intent.slug}
                  href={getProJobIntentPath(intent.slug)}
                  className="card-flat card-hover"
                >
                  <p className="eyebrow">Pro work</p>
                  <h3>{intent.h1}</h3>
                  <p>{intent.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">Open jobs</p>
              <h2>Browse current side jobs with filters</h2>
              <p>
                Search open opportunities by location, service type, keyword,
                and date posted. The list is public for SEO and discovery, while
                private customer contact details stay gated behind the pro
                unlock flow.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">Next step</p>
              <h2>See available work near you</h2>
              <p>
                Filter by city or state, choose the service categories you
                handle, and open each job page to review the public request.
              </p>
              <Link href="/jobs/browse" className="button button-primary">
                Browse open jobs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
