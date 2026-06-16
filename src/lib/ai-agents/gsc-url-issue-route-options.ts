import type {
  GscPageIndexingImportOptions,
  GscPageIndexingImportRow,
  GscUrlIssueAuditOptions,
} from "@/lib/ai-agents/gsc-url-issue-audit-agent";

export const DEFAULT_GSC_AUDIT_BATCH_LIMIT = 100;
export const MAX_GSC_AUDIT_BATCH_LIMIT = 500;

export async function readGscPageIndexingImportOptions(
  request: Request
): Promise<GscPageIndexingImportOptions> {
  const url = new URL(request.url);
  const contentType = request.headers.get("content-type") ?? "";
  const queryReason = url.searchParams.get("reason") ?? undefined;
  const queryLimit = getNumber(url.searchParams.get("limit"));
  const queryAllowExternal = getBoolean(url.searchParams.get("allowExternal"));

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;
    const reason =
      typeof body.reason === "string" ? body.reason : queryReason;

    return {
      reason,
      rows: readJsonRows(body, reason),
      limit: getNumber(body.limit) ?? queryLimit,
      createOpportunities: false,
      checkHttp: false,
      allowExternal:
        typeof body.allowExternal === "boolean"
          ? body.allowExternal
          : queryAllowExternal,
    };
  }

  const text = await request.text();
  const reason = queryReason ?? inferReasonFromText(text);

  return {
    reason,
    rows: parseDelimitedRows(text, reason),
    limit: queryLimit,
    createOpportunities: false,
    checkHttp: false,
    allowExternal: queryAllowExternal,
  };
}

export async function readGscUrlIssueAuditOptions(
  request: Request
): Promise<GscUrlIssueAuditOptions> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return defaultAuditOptions();
  }

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const limit = clampAuditLimit(getNumber(body.limit));

  return {
    urls: Array.isArray(body.urls)
      ? body.urls.filter((url): url is string => typeof url === "string")
      : undefined,
    issueIds: Array.isArray(body.issueIds)
      ? body.issueIds.filter((id): id is string => typeof id === "string")
      : undefined,
    candidateLimit: clampAuditLimit(getNumber(body.candidateLimit), limit),
    openIssueLimit: clampAuditLimit(getNumber(body.openIssueLimit), limit),
    searchAnalyticsLimit: clampAuditLimit(
      getNumber(body.searchAnalyticsLimit),
      0
    ),
    generatedPageLimit: clampAuditLimit(getNumber(body.generatedPageLimit), 0),
    inspectLimit: clampAuditLimit(getNumber(body.inspectLimit), 20),
    createOpportunities:
      typeof body.createOpportunities === "boolean"
        ? body.createOpportunities
        : undefined,
    allowExternal:
      typeof body.allowExternal === "boolean" ? body.allowExternal : undefined,
  };
}

function defaultAuditOptions(): GscUrlIssueAuditOptions {
  return {
    candidateLimit: DEFAULT_GSC_AUDIT_BATCH_LIMIT,
    openIssueLimit: DEFAULT_GSC_AUDIT_BATCH_LIMIT,
    searchAnalyticsLimit: 0,
    generatedPageLimit: 0,
    inspectLimit: 20,
  };
}

function clampAuditLimit(
  value: number | undefined,
  fallback = DEFAULT_GSC_AUDIT_BATCH_LIMIT
) {
  return Math.min(
    MAX_GSC_AUDIT_BATCH_LIMIT,
    Math.max(0, value ?? fallback)
  );
}

function readJsonRows(body: Record<string, unknown>, defaultReason?: string) {
  if (Array.isArray(body.urls)) {
    return body.urls
      .filter((url): url is string => typeof url === "string")
      .map((url) => ({
        url,
        reason: defaultReason,
        source: "gsc_page_indexing_json_urls",
      }));
  }

  if (!Array.isArray(body.rows)) {
    return [];
  }

  const rows: GscPageIndexingImportRow[] = [];

  for (const item of body.rows) {
    if (typeof item === "string") {
      rows.push({
        url: item,
        reason: defaultReason,
        source: "gsc_page_indexing_json_rows",
      });
      continue;
    }

    if (!item || typeof item !== "object") continue;

    const row = item as Record<string, unknown>;
    const url = getFirstFieldValue(row, [
      "url",
      "URL",
      "page",
      "Page",
      "Страница",
      "страница",
      "Адрес",
      "адрес",
    ]);

    if (!url) continue;

    rows.push({
      url,
      reason:
        getFirstFieldValue(row, [
          "reason",
          "Reason",
          "status",
          "Status",
          "причина",
          "Причина",
          "статус",
          "Статус",
        ]) ?? defaultReason,
      source:
        getFirstFieldValue(row, ["source", "Source", "источник", "Источник"]) ??
        "gsc_page_indexing_json_rows",
      metadata: row,
    });
  }

  return rows;
}

function parseDelimitedRows(text: string, defaultReason?: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseDelimitedLine(lines[0], delimiter).map(normalizeHeader);
  const hasHeader = headers.some((header) => isUrlHeader(header));
  const rows: GscPageIndexingImportRow[] = [];

  for (const line of hasHeader ? lines.slice(1) : lines) {
    const values = parseDelimitedLine(line, delimiter);

    if (values.length === 0) continue;

    if (!hasHeader) {
      rows.push({
        url: values[0],
        reason: defaultReason,
        source: "gsc_page_indexing_text_import",
      });
      continue;
    }

    const row = Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""])
    );
    const url = getFirstHeaderValue(row, [
      "url",
      "page",
      "address",
      "адрес",
      "страница",
      "url страницы",
    ]);

    if (!url) continue;

    rows.push({
      url,
      reason:
        getFirstHeaderValue(row, [
          "reason",
          "status",
          "причина",
          "статус",
          "issue",
          "проблема",
        ]) ?? defaultReason,
      source: "gsc_page_indexing_csv_export",
      metadata: row,
    });
  }

  return rows;
}

function detectDelimiter(line: string) {
  const candidates = ["\t", ",", ";"];

  return (
    candidates
      .map((delimiter) => ({
        delimiter,
        count: parseDelimitedLine(line, delimiter).length,
      }))
      .sort((a, b) => b.count - a.count)[0]?.delimiter ?? ","
  );
}

function parseDelimitedLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function inferReasonFromText(text: string) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim());

  if (!firstLine) return undefined;

  if (
    firstLine.toLowerCase().includes("not found") ||
    firstLine.toLowerCase().includes("не найдено")
  ) {
    return firstLine.trim();
  }

  return undefined;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function isUrlHeader(header: string) {
  return (
    header === "url" ||
    header === "page" ||
    header === "address" ||
    header === "адрес" ||
    header === "страница" ||
    header.includes("url")
  );
}

function getFirstFieldValue(row: Record<string, unknown>, keys: string[]) {
  const normalizedMap = new Map(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])
  );

  for (const key of keys) {
    const value = row[key] ?? normalizedMap.get(normalizeHeader(key));

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function getFirstHeaderValue(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const normalizedKey = normalizeHeader(key);
    const value = row[normalizedKey];

    if (value?.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value === "string" && value.trim()) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return Math.max(0, Math.floor(number));
    }
  }

  return undefined;
}

function getBoolean(value: string | null) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}
