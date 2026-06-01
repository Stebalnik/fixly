import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";
import {
  getProJobIntent,
  getProJobIntentUrl,
  type ProJobIntent,
} from "@/lib/pro/jobIntents";
import { getProJobPath, getProJobServiceLabel, type ProJobRequest } from "@/lib/pro/jobs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ProJobIntentPageProps = {
  params: Promise<{
    intentSlug: string;
  }>;
};

async function getSampleJobs() {
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
    .limit(12);

  if (error) {
    console.error("Unable to load pro intent jobs", error);
    return [];
  }

  return (data ?? []) as ProJobRequest[];
}

function getMetadata(intent: ProJobIntent): Metadata {
  return {
    title: `${intent.title} | Fixly Pro`,
    description: intent.description,
    alternates: {
      canonical: getProJobIntentUrl(intent.slug),
    },
  };
}

export async function generateMetadata({
  params,
}: ProJobIntentPageProps): Promise<Metadata> {
  const { intentSlug } = await params;
  const intent = getProJobIntent(intentSlug);

  if (!intent) {
    return {
      title: "Side Jobs Not Found | Fixly Pro",
    };
  }

  return getMetadata(intent);
}

export default async function ProJobIntentPage({
  params,
}: ProJobIntentPageProps) {
  const { intentSlug } = await params;
  const intent = getProJobIntent(intentSlug);

  if (!intent) {
    notFound();
  }

  const jobs = await getSampleJobs();

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro side jobs</p>
            <h1>{intent.h1}</h1>
            <p className="hero-text">{intent.description}</p>
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
          <div className="container grid-2 gap-lg">
            <article className="card-flat">
              <p className="eyebrow">Local work</p>
              <h2>{intent.title}</h2>
              <p>{intent.body}</p>
            </article>

            <aside className="card-flat">
              <p className="eyebrow">Searches this page targets</p>
              <h2>Relevant long-tail terms</h2>
              <ul className="service-list">
                {intent.keywords.map((keyword) => (
                  <li key={keyword}>{keyword}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="materials-section-heading">
              <p className="eyebrow">Open opportunities</p>
              <h2>Current examples of flexible local work</h2>
            </div>

            <div className="lead-list">
              {jobs.map((job) => (
                <article key={job.public_slug} className="card">
                  <div className="flex-between gap-md">
                    <div>
                      <p className="eyebrow">
                        {getProJobServiceLabel(job)} · {job.city}, {job.state}
                      </p>
                      <h3>{job.public_description.slice(0, 90)}</h3>
                      <div className="lead-row-meta">
                        <span>Side job</span>
                        <span>Temporary work</span>
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
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
