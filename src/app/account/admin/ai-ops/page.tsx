import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth/admin";
import { runGscUrlIssueAuditAgent } from "@/lib/ai-agents/gsc-url-issue-audit-agent";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import PublicPageShell from "@/components/PublicPageShell";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

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

type GscUrlIssue = {
  id: string;
  url: string;
  normalized_url: string;
  gsc_reason: string | null;
  normalized_reason: string | null;
  issue_type: string | null;
  root_cause: string | null;
  severity: string | null;
  status: string | null;
  http_status: number | null;
  proposed_action: string | null;
  last_seen_at: string | null;
};

async function reauditGscIssues(formData: FormData) {
  "use server";

  await requireAdminUser();

  const mode = formData.get("mode");
  const issueIds = formData
    .getAll("issueId")
    .filter((value): value is string => typeof value === "string" && Boolean(value));
  const selectedMode = mode === "selected";

  if (selectedMode && issueIds.length === 0) {
    return;
  }

  const batchSize = selectedMode ? issueIds.length : 25;

  await runGscUrlIssueAuditAgent({
    issueIds: selectedMode ? issueIds : undefined,
    candidateLimit: batchSize,
    openIssueLimit: selectedMode ? 0 : batchSize,
    searchAnalyticsLimit: 0,
    generatedPageLimit: 0,
    inspectLimit: Math.min(batchSize, 5),
    createOpportunities: false,
  });

  revalidatePath("/account/admin/ai-ops");
}

export default async function AdminAiOpsPage({ searchParams }: PageProps) {
  await requireAdminUser();

  const admin = createSupabaseAdminClient();
  const params = (await searchParams) ?? {};
  const gscFilters = {
    status: getSearchParam(params.status),
    normalizedReason: getSearchParam(params.normalized_reason),
    rootCause: getSearchParam(params.root_cause),
    severity: getSearchParam(params.severity),
  };

  let gscIssuesQuery = admin
    .from("gsc_url_issues")
    .select(
      "id, url, normalized_url, gsc_reason, normalized_reason, issue_type, root_cause, severity, status, http_status, proposed_action, last_seen_at"
    )
    .order("last_seen_at", { ascending: false })
    .limit(50);

  if (gscFilters.status) {
    gscIssuesQuery = gscIssuesQuery.eq("status", gscFilters.status);
  }

  if (gscFilters.normalizedReason) {
    gscIssuesQuery = gscIssuesQuery.eq(
      "normalized_reason",
      gscFilters.normalizedReason
    );
  }

  if (gscFilters.rootCause) {
    gscIssuesQuery = gscIssuesQuery.eq("root_cause", gscFilters.rootCause);
  }

  if (gscFilters.severity) {
    gscIssuesQuery = gscIssuesQuery.eq("severity", gscFilters.severity);
  }

  const [
    runsResult,
    publishedResult,
    rejectedResult,
    generatedStatusResult,
    opportunitiesStatusResult,
    gscIssuesResult,
    gscIssueStatusResult,
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

    gscIssuesQuery,

    admin
      .from("gsc_url_issues")
      .select("status, normalized_reason, root_cause, severity"),
  ]);

  const runs = (runsResult.data ?? []) as AgentRun[];
  const publishedPages = (publishedResult.data ?? []) as GeneratedPage[];
  const rejectedPages = (rejectedResult.data ?? []) as GeneratedPage[];
  const gscIssues = (gscIssuesResult.data ?? []) as GscUrlIssue[];

  const generatedStats = countByStatus(
    (generatedStatusResult.data ?? []).map((item) => item.status)
  );

  const opportunityStats = countByStatus(
    (opportunitiesStatusResult.data ?? []).map((item) => item.status)
  );

  const gscIssueStats = countByStatus(
    (gscIssueStatusResult.data ?? []).map((item) => item.status)
  );
  const gscReasonOptions = uniqueValues(
    (gscIssueStatusResult.data ?? []).map((item) => item.normalized_reason)
  );
  const gscRootCauseOptions = uniqueValues(
    (gscIssueStatusResult.data ?? []).map((item) => item.root_cause)
  );
  const gscSeverityOptions = uniqueValues(
    (gscIssueStatusResult.data ?? []).map((item) => item.severity)
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
            <div className="flex flex-between">
              <div>
                <p className="eyebrow">Google Search Console</p>
                <h2>Page Indexing Recovery</h2>
              </div>
              <div className="flex gap-sm">
                <StatPill label="Open" value={gscIssueStats.open ?? 0} />
                <StatPill
                  label="Resolved"
                  value={gscIssueStats.resolved ?? 0}
                />
              </div>
            </div>

            <form className="grid-4" method="get">
              <label>
                Status
                <select name="status" defaultValue={gscFilters.status ?? ""}>
                  <option value="">Any</option>
                  {["open", "opportunity_created", "resolved", "ignored"].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Reason
                <select
                  name="normalized_reason"
                  defaultValue={gscFilters.normalizedReason ?? ""}
                >
                  <option value="">Any</option>
                  {gscReasonOptions.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Root cause
                <select
                  name="root_cause"
                  defaultValue={gscFilters.rootCause ?? ""}
                >
                  <option value="">Any</option>
                  {gscRootCauseOptions.map((rootCause) => (
                    <option key={rootCause} value={rootCause}>
                      {rootCause}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Severity
                <select
                  name="severity"
                  defaultValue={gscFilters.severity ?? ""}
                >
                  <option value="">Any</option>
                  {gscSeverityOptions.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </label>

              <button className="button button-secondary" type="submit">
                Filter
              </button>
            </form>

            <form action={reauditGscIssues}>
              <div className="service-seo-list">
                {gscIssues.length === 0 ? (
                  <p>No GSC page indexing issues match these filters.</p>
                ) : (
                  gscIssues.map((issue) => (
                    <article key={issue.id} className="card-flat">
                      <div className="flex flex-between">
                        <label className="flex gap-sm">
                          <input
                            type="checkbox"
                            name="issueId"
                            value={issue.id}
                          />
                          <span>{issue.normalized_reason ?? "unknown"}</span>
                        </label>
                        <span>{issue.status}</span>
                      </div>

                      <h3>{issue.root_cause ?? issue.issue_type ?? "unknown"}</h3>
                      <p>{issue.url}</p>
                      <small>
                        HTTP {issue.http_status ?? "n/a"} ·{" "}
                        {issue.severity ?? "medium"} ·{" "}
                        {issue.proposed_action ?? "manual_review"} · Last seen{" "}
                        {formatDate(issue.last_seen_at)}
                      </small>
                    </article>
                  ))
                )}
              </div>

              <div className="flex gap-md">
                <button
                  className="button button-primary"
                  type="submit"
                  name="mode"
                  value="selected"
                >
                  Re-audit selected
                </button>
                <button
                  className="button button-secondary"
                  type="submit"
                  name="mode"
                  value="open"
                >
                  Re-audit latest open
                </button>
              </div>
            </form>

            <div className="card-flat">
              <h3>Import GSC exports</h3>
              <p>
                Copy URLs from a Page Indexing reason detail screen, or export
                CSV/TSV with URL/Page and Reason/Status columns.
              </p>
              <pre>{`curl -X POST "https://fixly.work/api/internal/ai-agents/gsc-page-indexing-import?reason=Not%20found%20(404)" \\
  -H "Authorization: Bearer $INTERNAL_AI_AGENT_TOKEN" \\
  -H "Content-Type: text/plain" \\
  --data-binary $'https://fixly.work/us/ky/blandville/plumbing\\n'`}</pre>
            </div>
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

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="button button-secondary">
      {label}: {value}
    </span>
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

function uniqueValues(items: Array<string | null | undefined>) {
  return Array.from(
    new Set(items.filter((item): item is string => Boolean(item)))
  ).sort();
}

function getSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
