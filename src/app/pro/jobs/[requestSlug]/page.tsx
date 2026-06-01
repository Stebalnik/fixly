import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PublicPageShell from "@/components/PublicPageShell";
import {
  formatProJobDate,
  getProJobMetaDescription,
  getProJobServiceLabel,
  getProJobTitle,
  getProJobUrl,
  type ProJobRequest,
} from "@/lib/pro/jobs";
import {
  buildProJobSeoPage,
  getProJobSeoUrl,
  parseProJobSeoSlug,
  type ProJobSeoPage,
  type ProJobSeoTarget,
} from "@/lib/pro/jobSeo";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ProJobPageProps = {
  params: Promise<{
    requestSlug: string;
  }>;
};

type ProJobDetail = ProJobRequest & {
  id: string;
  status: string;
  lead_status: string | null;
};

async function getJob(requestSlug: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("service_requests")
    .select(
      "id, public_slug, category_slug, subcategory_slug, city, state, public_description, created_at, updated_at, status, lead_status"
    )
    .eq("public_slug", requestSlug)
    .eq("status", "open")
    .eq("lead_status", "available")
    .maybeSingle();

  if (error) {
    console.error("Unable to load pro job", error);
    return null;
  }

  return data as ProJobDetail | null;
}

async function getSeoJobs(target: ProJobSeoTarget) {
  const admin = createSupabaseAdminClient();

  let query = admin
    .from("service_requests")
    .select(
      "public_slug, category_slug, subcategory_slug, city, state, public_description, created_at, updated_at"
    )
    .eq("status", "open")
    .eq("lead_status", "available")
    .eq("category_slug", target.categorySlug)
    .not("public_slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(48);

  if (target.subcategorySlug) {
    query = query.eq("subcategory_slug", target.subcategorySlug);
  }

  if (target.city) {
    query = query.ilike("city", target.city).eq("state", target.state);
  } else {
    query = query.eq("state", target.state);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Unable to load pro job SEO page", error);
    return [];
  }

  return (data ?? []) as ProJobRequest[];
}

async function getSeoPage(requestSlug: string) {
  const target = parseProJobSeoSlug(requestSlug);

  if (!target) {
    return null;
  }

  const jobs = await getSeoJobs(target);

  if (jobs.length === 0) {
    return null;
  }

  return buildProJobSeoPage(target, jobs);
}

export async function generateMetadata({
  params,
}: ProJobPageProps): Promise<Metadata> {
  const { requestSlug } = await params;
  const job = await getJob(requestSlug);

  if (!job) {
    const seoPage = await getSeoPage(requestSlug);

    if (!seoPage) {
      return {
        title: "Job Not Found | Fixly Pro",
      };
    }

    return {
      title: seoPage.title,
      description: seoPage.description,
      alternates: {
        canonical: getProJobSeoUrl(seoPage.slug),
      },
    };
  }

  return {
    title: `${getProJobTitle(job)} | Temporary Work | Fixly Pro`,
    description: getProJobMetaDescription(job),
    alternates: {
      canonical: getProJobUrl(job.public_slug),
    },
  };
}

export default async function ProJobPage({ params }: ProJobPageProps) {
  const { requestSlug } = await params;
  const job = await getJob(requestSlug);

  if (!job) {
    const seoPage = await getSeoPage(requestSlug);

    if (!seoPage) {
      notFound();
    }

    return <ProJobSeoLandingPage seoPage={seoPage} />;
  }

  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container grid-2 gap-lg">
            <div>
              <p className="eyebrow">
                {getProJobServiceLabel(job)} · {job.city}, {job.state}
              </p>
              <h1>{getProJobTitle(job)}</h1>
              <p className="hero-text">
                This is an open local gig, side job, or temporary work
                opportunity for qualified pros in {job.city}, {job.state}.
              </p>
              <div className="flex gap-md">
                <Link href="/signup" className="button button-primary">
                  Join to contact customer
                </Link>
                <Link href="/jobs/browse" className="button button-secondary">
                  Browse more jobs
                </Link>
              </div>
            </div>

            <div className="card-flat">
              <p className="eyebrow">Opportunity details</p>
              <h2>Contact details unlock after paid access</h2>
              <div className="service-list">
                <p>
                  <strong>Location:</strong> {job.city}, {job.state}
                </p>
                <p>
                  <strong>Posted:</strong> {formatProJobDate(job.created_at)}
                </p>
                <p>
                  <strong>Work type:</strong> Local temporary work, side job,
                  service call, or short-term gig.
                </p>
                <p>
                  <strong>Private contact:</strong> Customer phone, email, and
                  address are hidden until a registered pro unlocks the lead
                  through Fixly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2 gap-lg">
            <article className="card-flat">
              <p className="eyebrow">Customer request</p>
              <h2>Message from the customer</h2>
              <p>{job.public_description}</p>
            </article>

            <aside className="card-flat">
              <p className="eyebrow">How to respond</p>
              <h2>Unlock the lead to contact the customer</h2>
              <p>
                Pros can review the job first. To see the customer phone,
                email, job address, and conversation tools, create a Fixly Pro
                account and unlock the lead with FIXAs.
              </p>
              <Link href="/signup" className="button button-primary">
                Become a Fixly Pro
              </Link>
            </aside>
          </div>
        </section>

        <section className="section-sm">
          <div className="container">
            <Link href="/jobs/browse" className="button button-secondary">
              Back to all side jobs
            </Link>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}

function ProJobSeoLandingPage({ seoPage }: { seoPage: ProJobSeoPage }) {
  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Fixly Pro job search</p>
            <h1>{seoPage.h1}</h1>
            <p className="hero-text">{seoPage.description}</p>
            <div className="flex gap-md">
              <Link href="/jobs/browse" className="button button-primary">
                Browse all open jobs
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
              <h2>Open side jobs built from real homeowner requests</h2>
              <p>{seoPage.intro}</p>
            </article>

            <aside className="card-flat">
              <p className="eyebrow">Search demand</p>
              <h2>Long-tail job searches this page targets</h2>
              <ul className="service-list">
                {seoPage.keywords.map((keyword) => (
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
              <h2>Current jobs and temporary work</h2>
            </div>

            <div className="lead-list">
              {seoPage.jobs.map((job) => (
                <article key={job.public_slug} className="lead-row card">
                  <div className="lead-row-main">
                    <div className="lead-row-top">
                      <div>
                        <p className="eyebrow">
                          {getProJobServiceLabel(job)} · {job.city}, {job.state}
                        </p>
                        <h3>{getProJobTitle(job)}</h3>
                      </div>
                      <span className="badge badge-success">
                        Contact unlock required
                      </span>
                    </div>

                    <p>{trimSeoText(job.public_description)}</p>

                    <div className="lead-row-meta">
                      <span>Side job</span>
                      <span>Temporary work</span>
                      <span>Posted {formatProJobDate(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="lead-row-actions">
                    <Link
                      href={`/jobs/${job.public_slug}`}
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

        <section className="section">
          <div className="container grid-3">
            <div className="card-flat">
              <p className="eyebrow">Affordable leads</p>
              <h2>Preview before unlock</h2>
              <p>
                Pros can review service type, location, timing, and customer
                message before unlocking private contact details.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">SEO coverage</p>
              <h2>Built from live demand</h2>
              <p>
                These pages are generated from open requests, so the site can
                target searches for local gigs, contractor jobs, and side work
                only where real opportunities exist.
              </p>
            </div>
            <div className="card-flat">
              <p className="eyebrow">Alternatives</p>
              <h2>For pros comparing lead platforms</h2>
              <p>
                Fixly Pro can capture searches around Thumbtack alternatives,
                Angi leads alternatives, HomeAdvisor alternatives, and cheaper
                contractor lead sites without exposing lead economics publicly.
              </p>
            </div>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}

function trimSeoText(value: string, maxLength = 190) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}
