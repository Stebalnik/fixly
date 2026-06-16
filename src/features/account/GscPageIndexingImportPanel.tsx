"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const GSC_REASONS = [
  "Not found (404)",
  "Server error (5xx)",
  "Page with redirect",
  "Redirect error",
  "Crawled, currently not indexed",
  "Discovered, currently not indexed",
  "Duplicate without user-selected canonical",
  "Duplicate, Google chose different canonical",
  "Excluded by noindex",
  "Alternate page with canonical tag",
] as const;

const IMPORT_ENDPOINT = "/api/account/admin/gsc-page-indexing-import";
const AUDIT_ENDPOINT = "/api/account/admin/gsc-url-issue-audit";

type SummaryExample = {
  url?: string;
  reason?: string;
  normalizedReason?: string;
  issueType?: string;
  rootCause?: string;
  severity?: string;
};

type ImportSummary = {
  ok?: boolean;
  error?: string;
  message?: string;
  imported?: number;
  updated?: number;
  skipped?: number;
  byReason?: Record<string, number>;
  byRootCause?: Record<string, number>;
  examples?: SummaryExample[];
};

type AuditSummary = {
  ok?: boolean;
  error?: string;
  candidatesAudited?: number;
  issuesFound?: number;
  issuesResolved?: number;
  opportunitiesCreated?: number;
  issueTypeCounts?: Record<string, number>;
  rootCauseCounts?: Record<string, number>;
  samples?: SummaryExample[];
};

export function GscPageIndexingImportPanel() {
  const router = useRouter();
  const [reason, setReason] = useState<(typeof GSC_REASONS)[number]>(
    GSC_REASONS[0]
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  const [auditResult, setAuditResult] = useState<AuditSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  async function importGscExport() {
    if (isImporting) return;

    setErrorMessage("");
    setImportResult(null);

    let body = pastedText.trim();
    let contentType = "text/plain; charset=utf-8";

    try {
      if (selectedFile) {
        body = await readFileAsText(selectedFile);
        contentType = getContentType(selectedFile);
      }

      if (!body.trim()) {
        setErrorMessage("Choose a GSC export file or paste one URL per line.");
        return;
      }

      setIsImporting(true);

      const endpoint = `${IMPORT_ENDPOINT}?${new URLSearchParams({ reason })}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": contentType,
        },
        body,
      });
      const { bodyForDisplay, data: result } =
        await readEndpointResponse<ImportSummary>(response);

      if (!response.ok || result.ok === false) {
        throw new Error(
          formatEndpointError({
            endpoint,
            status: response.status,
            body: bodyForDisplay,
            fallback: result.error,
          })
        );
      }

      setImportResult(result);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to import GSC export."
      );
    } finally {
      setIsImporting(false);
    }
  }

  async function runAudit() {
    if (isAuditing) return;

    setErrorMessage("");
    setAuditResult(null);
    setIsAuditing(true);

    try {
      const endpoint = AUDIT_ENDPOINT;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 100,
          candidateLimit: 100,
          openIssueLimit: 100,
          searchAnalyticsLimit: 0,
          generatedPageLimit: 0,
          inspectLimit: 20,
          createOpportunities: false,
        }),
      });
      const { bodyForDisplay, data: result } =
        await readEndpointResponse<AuditSummary>(response);

      if (!response.ok || result.ok === false) {
        throw new Error(
          formatEndpointError({
            endpoint,
            status: response.status,
            body: bodyForDisplay,
            fallback: result.error,
          })
        );
      }

      setAuditResult(result);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to run GSC audit."
      );
    } finally {
      setIsAuditing(false);
    }
  }

  return (
    <div className="card">
      <p className="eyebrow">Google Search Console</p>
      <h2>GSC Page Indexing Import</h2>
      <p>
        Open Google Search Console → Page indexing → choose a reason → Export
        CSV → upload the exported CSV here. The system will import URL examples
        and classify root causes; run the live audit after import.
      </p>

      <div className="grid-2">
        <label className="form-field">
          Reason
          <select
            className="form-input"
            value={reason}
            disabled={isImporting}
            onChange={(event) =>
              setReason(event.target.value as (typeof GSC_REASONS)[number])
            }
          >
            {GSC_REASONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          Export file
          <input
            className="form-input"
            type="file"
            accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
            disabled={isImporting}
            onChange={(event) =>
              setSelectedFile(event.target.files?.[0] ?? null)
            }
          />
        </label>
      </div>

      <label className="form-field">
        Pasted URLs
        <textarea
          className="form-textarea"
          rows={6}
          value={pastedText}
          disabled={isImporting}
          placeholder="https://fixly.work/us/ky/blandville/plumbing"
          onChange={(event) => setPastedText(event.target.value)}
        />
      </label>

      {errorMessage ? (
        <pre className="form-error" role="alert">
          {errorMessage}
        </pre>
      ) : null}

      <div className="flex gap-md">
        <button
          type="button"
          className="button button-primary"
          disabled={isImporting || isAuditing}
          onClick={importGscExport}
        >
          {isImporting ? "Importing..." : "Import GSC Export"}
        </button>

        <button
          type="button"
          className="button button-secondary"
          disabled={isImporting || isAuditing}
          onClick={runAudit}
        >
          {isAuditing ? "Auditing..." : "Run Audit for Open Issues"}
        </button>
      </div>

      {importResult ? (
        <div className="flex gap-md">
          <button
            type="button"
            className="button button-secondary"
            disabled={isAuditing}
            onClick={runAudit}
          >
            {isAuditing ? "Auditing..." : "Run audit now"}
          </button>
        </div>
      ) : null}

      <ImportSummaryPanel result={importResult} />
      <AuditSummaryPanel result={auditResult} />
    </div>
  );
}

async function readEndpointResponse<T extends { error?: string }>(
  response: Response
) {
  const responseText = await response.text();

  try {
    const data = JSON.parse(responseText) as T;

    return {
      data,
      bodyForDisplay: JSON.stringify(data, null, 2),
    };
  } catch {
    return {
      data: {} as T,
      bodyForDisplay: responseText || "(empty response)",
    };
  }
}

function formatEndpointError(args: {
  endpoint: string;
  status: number;
  body: string;
  fallback?: string;
}) {
  return [
    `Endpoint: ${args.endpoint}`,
    `HTTP status: ${args.status}`,
    `Response: ${args.body || args.fallback || "(empty response)"}`,
  ].join("\n");
}

function ImportSummaryPanel({ result }: { result: ImportSummary | null }) {
  if (!result) return null;

  return (
    <div className="card-flat">
      <h3>Import summary</h3>
      <div className="grid-2">
        {result.message ? (
          <p>
            <strong>{result.message}</strong>
          </p>
        ) : null}
        <SummaryStat label="Imported" value={result.imported ?? 0} />
        <SummaryStat label="Updated" value={result.updated ?? 0} />
        <SummaryStat label="Skipped" value={result.skipped ?? 0} />
      </div>
      <SummaryMap title="By reason" values={result.byReason} />
      <SummaryMap title="By root cause" values={result.byRootCause} />
      <ExamplesList examples={result.examples} />
    </div>
  );
}

function AuditSummaryPanel({ result }: { result: AuditSummary | null }) {
  if (!result) return null;

  return (
    <div className="card-flat">
      <h3>Audit summary</h3>
      <div className="grid-2">
        <SummaryStat label="Audited" value={result.candidatesAudited ?? 0} />
        <SummaryStat label="Issues found" value={result.issuesFound ?? 0} />
        <SummaryStat label="Resolved" value={result.issuesResolved ?? 0} />
        <SummaryStat
          label="Opportunities"
          value={result.opportunitiesCreated ?? 0}
        />
      </div>
      <SummaryMap title="By issue type" values={result.issueTypeCounts} />
      <SummaryMap title="By root cause" values={result.rootCauseCounts} />
      <ExamplesList examples={result.samples} />
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );
}

function SummaryMap({
  title,
  values,
}: {
  title: string;
  values?: Record<string, number>;
}) {
  const entries = Object.entries(values ?? {});

  if (entries.length === 0) return null;

  return (
    <>
      <h4>{title}</h4>
      <div className="service-seo-list">
        {entries.map(([key, value]) => (
          <div key={key} className="flex flex-between">
            <span>{key}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </>
  );
}

function ExamplesList({ examples }: { examples?: SummaryExample[] }) {
  if (!examples || examples.length === 0) return null;

  return (
    <>
      <h4>Examples</h4>
      <div className="service-seo-list">
        {examples.slice(0, 8).map((example, index) => (
          <article key={`${example.url ?? "example"}-${index}`}>
            <p>{example.url ?? "Unknown URL"}</p>
            <small>
              {[
                example.reason,
                example.normalizedReason,
                example.issueType,
                example.rootCause,
                example.severity,
              ]
                .filter(Boolean)
                .join(" · ")}
            </small>
          </article>
        ))}
      </div>
    </>
  );
}

function getContentType(file: File) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) return "text/csv; charset=utf-8";
  if (name.endsWith(".tsv")) {
    return "text/tab-separated-values; charset=utf-8";
  }

  return "text/plain; charset=utf-8";
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read selected file."));
    reader.readAsText(file);
  });
}
