import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import {
  formatProJobDate,
  getProJobPath,
  getProJobServiceLabel,
  getProJobTitle,
  type ProJobRequest,
} from "@/lib/pro/jobs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Local Side Jobs and Temporary Work | Fixly Pro",
  description:
    "Browse local side jobs, temporary work, short-term gigs, and home service requests for pros on Fixly Pro.",
};

async function getOpenJobs() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("service_requests")
    .select(
      "public_slug, category_slug, subcategory_slug, city, state, public_description, created_at"
    )
    .eq("status", "open")
    .eq("lead_status", "available")
    .not("public_slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(120);

  if (error) {
    console.error("Unable to load pro jobs", error);
    return [];
  }

  return (data ?? []) as ProJobRequest[];
}

export default async function ProJobsPage() {
  const jobs = await getOpenJobs();

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro jobs</p>
            <h1>Local side jobs, gigs, and temporary work for pros</h1>
            <p className="hero-text">
              Browse open homeowner requests that can become short-term work,
              weekend jobs, handyman gigs, local service calls, and flexible
              side jobs for independent pros and small crews.
            </p>
            <div className="flex gap-md">
              <Link href="/signup" className="button button-primary">
                Join as a pro
              </Link>
              <Link href="#open-jobs" className="button button-secondary">
                Browse open jobs
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-3">
            <div className="card-flat">
              <p className="eyebrow">For pros</p>
              <h2>Find paid local work</h2>
              <p>
                See open requests from homeowners looking for help with repairs,
                installations, cleanup, maintenance, remodeling, and other local
                service tasks.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">Flexible jobs</p>
              <h2>Short-term gigs and side work</h2>
              <p>
                Use Fixly Pro to find temporary work, extra jobs between larger
                projects, after-hours gigs, and weekend service calls nearby.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">Lead marketplace</p>
              <h2>Review before unlocking</h2>
              <p>
                Public job pages show the service type, city, and customer
                message. Customer contact details and paid lead information stay
                private until a registered pro unlocks the lead.
              </p>
            </div>
          </div>
        </section>

        <section id="open-jobs" className="section">
          <div className="container">
            <div className="materials-section-heading">
              <p className="eyebrow">Open opportunities</p>
              <h2>Browse current side jobs and temporary work</h2>
            </div>

            {jobs.length === 0 ? (
              <div className="card">
                <h2>No open jobs right now</h2>
                <p>
                  New homeowner requests will appear here as soon as they are
                  available for pros.
                </p>
              </div>
            ) : (
              <div className="lead-list">
                {jobs.map((job) => (
                    <article key={job.public_slug} className="card">
                      <div className="flex-between gap-md">
                        <div>
                          <p className="eyebrow">
                            {getProJobServiceLabel(job)} · {job.city},{" "}
                            {job.state}
                          </p>
                          <h3>{getProJobTitle(job)}</h3>
                          <p>{job.public_description}</p>
                          <div className="lead-row-meta">
                            <span>Temporary work</span>
                            <span>Local gig</span>
                            <span>Posted {formatProJobDate(job.created_at)}</span>
                            <span>Contact unlock required</span>
                          </div>
                        </div>

                        <Link
                          href={getProJobPath(job.public_slug)}
                          className="button button-primary"
                        >
                          View job
                        </Link>
                      </div>
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
