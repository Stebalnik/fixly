import Link from "next/link";
import { requireAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PublicPageShell from "@/components/PublicPageShell";

export const dynamic = "force-dynamic";

type AgentRun = {
  id: string;
  agent_name: string;
  status: string;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  started_at: string | null;
  finished_at: string | null;
};

type GeneratedPage = {
  id: string;
  target_url: string;
  status: string;
  quality_status: string | null;
  quality_score: number | null;
  quality_notes: string[] | null;
  title: string;
  created_at: string | null;
  published_at: string | null;
};

export default async function AdminAiOpsPage() {
  await requireAdminUser();

  const admin = createSupabaseAdminClient();

  const [
    runsResult,
    publishedResult,
    rejectedResult,
    generatedStatusResult,
    opportunitiesStatusResult,
  ] = await Promise.all([
    admin
      .from("ai_agent_runs")
      .select("id, agent_name, status, summary, metadata, started_at, finished_at")
      .order("started_at", { ascending: false })
      .limit(20),

    admin
      .from("ai_generated_pages")
      .select("id, target_url, status, quality_status, quality_score, quality_notes, title, created_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(20),

    admin
      .from("ai_generated_pages")
      .select("id, target_url, status, quality_status, quality_score, quality_notes, title, created_at, published_at")
      .in("status", ["needs_review", "rejected"])
      .order("reviewed_at", { ascending: false })
      .limit(20),

    admin
      .from("ai_generated_pages")
      .select("status, quality_status"),

    admin
      .from("ai_seo_opportunities")
      .select("status"),
  ]);

  const runs = (runsResult.data ?? []) as AgentRun[];
  const publishedPages = (publishedResult.data ?? []) as GeneratedPage[];
  const rejectedPages = (rejectedResult.data ?? []) as GeneratedPage[];

  const generatedStats = countByStatus(
    (generatedStatusResult.data ?? []).map((item) => item.status)
  );

  const opportunityStats = countByStatus(
    (opportunitiesStatusResult.data ?? []).map((item) => item.status)
  );

return (
  <PublicPageShell
    breadcrumbs={[
      { label: "Account", href: "/account" },
      { label: "AI Ops" },
    ]}
  >
    <main className="page">
      <section className="section">
        <div className="container">
          <p className="eyebrow">Fixly Admin</p>
          <h1>AI Ops Dashboard</h1>
          <p className="hero-text">
            Monitor Search Console ingestion, SEO opportunities, generated drafts,
            quality review, and auto-published AI pages.
          </p>

          <div className="flex gap-md">
            <Link href="/account/ai-agents" className="button button-secondary">
              Opportunities
            </Link>
            <Link
              href="/account/ai-agents/generated-pages"
              className="button button-secondary"
            >
              Generated pages
            </Link>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container grid-4">
          <StatCard label="Generated pages" value={sumValues(generatedStats)} />
          <StatCard label="Published" value={generatedStats.published ?? 0} />
          <StatCard label="Needs review" value={generatedStats.needs_review ?? 0} />
          <StatCard label="Opportunities" value={sumValues(opportunityStats)} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container grid-2">
          <div className="card">
            <h2>Generated page statuses</h2>
            <StatusList stats={generatedStats} />
          </div>

          <div className="card">
            <h2>Opportunity statuses</h2>
            <StatusList stats={opportunityStats} />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="card">
            <h2>Latest agent runs</h2>

            <div className="service-seo-list">
              {runs.map((run) => (
                <article key={run.id} className="card-flat">
                  <p className="eyebrow">{run.status}</p>
                  <h3>{run.agent_name}</h3>
                  <p>{run.summary ?? "No summary."}</p>
                  <small>
                    Started: {formatDate(run.started_at)} · Finished:{" "}
                    {formatDate(run.finished_at)}
                  </small>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container grid-2">
          <div className="card">
            <h2>Latest published pages</h2>

            <div className="service-seo-list">
              {publishedPages.map((page) => (
                <article key={page.id} className="card-flat">
                  <p className="eyebrow">
                    Score {page.quality_score ?? "—"} · {page.quality_status}
                  </p>
                  <h3>{page.title}</h3>
                  <p>{page.target_url}</p>
                  <Link href={page.target_url} className="button button-secondary">
                    Open
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>Rejected / needs review</h2>

            <div className="service-seo-list">
              {rejectedPages.map((page) => (
                <article key={page.id} className="card-flat">
                  <p className="eyebrow">
                    Score {page.quality_score ?? "—"} · {page.quality_status}
                  </p>
                  <h3>{page.title}</h3>
                  <p>{page.target_url}</p>

                  {Array.isArray(page.quality_notes) &&
                  page.quality_notes.length > 0 ? (
                    <ul>
                      {page.quality_notes.map((note, index) => (
                        <li key={`${page.id}-${index}`}>{note}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No notes.</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
        </main>
  </PublicPageShell>
);
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="eyebrow">{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

function StatusList({ stats }: { stats: Record<string, number> }) {
  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return <p>No data yet.</p>;
  }

  return (
    <div className="service-seo-list">
      {entries.map(([status, count]) => (
        <div key={status} className="flex flex-between">
          <span>{status}</span>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}

function countByStatus(items: Array<string | null | undefined>) {
  return items.reduce<Record<string, number>>((acc, status) => {
    const key = status || "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function sumValues(stats: Record<string, number>) {
  return Object.values(stats).reduce((sum, value) => sum + value, 0);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
}