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

export async function generateMetadata({
  params,
}: ProJobPageProps): Promise<Metadata> {
  const { requestSlug } = await params;
  const job = await getJob(requestSlug);

  if (!job) {
    return {
      title: "Job Not Found | Fixly Pro",
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
    notFound();
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
