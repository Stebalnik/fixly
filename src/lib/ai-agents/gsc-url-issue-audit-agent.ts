import { google } from "googleapis";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getMarketByGlobalPath,
  getMarketUrlPath,
  type Market,
} from "@/lib/geo";
import {
  categories,
  getCategoryBySlug,
  getLegacyServiceRoute,
  getSubcategoryBySlug,
} from "@/lib/services";
import {
  isIntentAllowedForService,
  parseServiceIntentPath,
} from "@/lib/seo/intents";

type SearchConsoleClient = ReturnType<typeof google.searchconsole>;

type SearchConsoleRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type CandidateUrl = {
  url: string;
  source: string;
  metadata: Record<string, unknown>;
  gscReason?: string;
  normalizedReason?: NormalizedGscReason;
  issueId?: string;
};

type HttpSnapshot = {
  ok: boolean;
  status?: number;
  finalUrl?: string;
  redirected?: boolean;
  error?: string;
};

type InspectionSnapshot = {
  verdict?: string;
  coverageState?: string;
  pageFetchState?: string;
  indexingState?: string;
  robotsTxtState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  inspectionResultLink?: string;
  error?: string;
};

type RouteAnalysis = {
  path: string;
  countryCode?: string;
  regionSlug?: string;
  routeMarketSlug?: string;
  market?: Market;
  categorySlug?: string;
  subcategorySlug?: string;
  intentSlug?: string;
  routePath?: string;
  routeProblem?:
    | "missing_market"
    | "missing_service_route"
    | "missing_ai_generated_page"
    | "invalid_intent"
    | "should_410";
  routeProblemReason?: string;
  canCreateOpportunity: boolean;
};

type IssueDraft = {
  url: string;
  normalizedUrl: string;
  path: string;
  source: string;
  issueType: string;
  rootCause: string;
  gscReason?: string;
  normalizedReason: NormalizedGscReason;
  severity: "low" | "medium" | "high" | "critical";
  httpStatus?: number;
  finalUrl?: string;
  gscVerdict?: string;
  gscCoverageState?: string;
  gscPageFetchState?: string;
  inspectionIndexStatus?: string;
  inspectionCoverageState?: string;
  canonicalUser?: string;
  canonicalGoogle?: string;
  countryCode?: string;
  regionSlug?: string;
  marketSlug?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  intentSlug?: string;
  recommendation: string;
  proposedAction: string;
  actionPayload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  canCreateOpportunity: boolean;
};

export type GscUrlIssueAuditOptions = {
  urls?: string[];
  issueIds?: string[];
  candidateLimit?: number;
  openIssueLimit?: number;
  searchAnalyticsLimit?: number;
  generatedPageLimit?: number;
  inspectLimit?: number;
  createOpportunities?: boolean;
  allowExternal?: boolean;
};

export type GscPageIndexingImportRow = {
  url: string;
  reason?: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export type GscPageIndexingImportOptions = {
  rows: GscPageIndexingImportRow[];
  reason?: string;
  limit?: number;
  createOpportunities?: boolean;
  checkHttp?: boolean;
  allowExternal?: boolean;
};

const DEFAULT_BASE_URL = "https://fixly.work";
const DEFAULT_CANDIDATE_LIMIT = 100;
const DEFAULT_OPEN_ISSUE_LIMIT = 100;
const DEFAULT_SEARCH_ANALYTICS_LIMIT = 100;
const DEFAULT_GENERATED_PAGE_LIMIT = 75;
const DEFAULT_INSPECT_LIMIT = 20;
const DEFAULT_IMPORT_LIMIT = 1000;
const MAX_AUDIT_LIMIT = 500;
const HTTP_TIMEOUT_MS = 10_000;

type NormalizedGscReason =
  | "not_found_404"
  | "server_error_5xx"
  | "page_with_redirect"
  | "redirect_error"
  | "duplicate_without_user_canonical"
  | "duplicate_google_chose_different_canonical"
  | "alternate_page_with_canonical"
  | "noindex"
  | "crawled_currently_not_indexed"
  | "discovered_currently_not_indexed"
  | "unknown";

const GOOGLE_FETCH_ISSUE_TYPES: Record<string, string> = {
  NOT_FOUND: "valid_route_but_http_404",
  SOFT_404: "should_410",
  BLOCKED_ROBOTS_TXT: "noindex",
  SERVER_ERROR: "server_error",
  REDIRECT_ERROR: "redirect_error",
  ACCESS_DENIED: "unknown",
  ACCESS_FORBIDDEN: "unknown",
  BLOCKED_4XX: "valid_route_but_http_404",
  INTERNAL_CRAWL_ERROR: "server_error",
  INVALID_URL: "should_410",
};

const GSC_REASON_PATTERNS: Array<{
  normalizedReason: NormalizedGscReason;
  matches: string[];
}> = [
  {
    normalizedReason: "not_found_404",
    matches: [
      "не найдено (404)",
      "not found (404)",
      "submitted url not found",
      "404",
    ],
  },
  {
    normalizedReason: "server_error_5xx",
    matches: ["ошибка сервера (5xx)", "server error (5xx)", "5xx"],
  },
  {
    normalizedReason: "page_with_redirect",
    matches: ["страница с переадресацией", "page with redirect"],
  },
  {
    normalizedReason: "redirect_error",
    matches: ["ошибка переадресации", "redirect error"],
  },
  {
    normalizedReason: "duplicate_without_user_canonical",
    matches: [
      "страница является копией. канонический вариант не выбран пользователем",
      "канонический вариант не выбран пользователем",
      "duplicate without user-selected canonical",
      "duplicate without user selected canonical",
    ],
  },
  {
    normalizedReason: "duplicate_google_chose_different_canonical",
    matches: [
      "канонические версии страницы, выбранные google и пользователем, не совпадают",
      "google и пользователем, не совпадают",
      "duplicate, google chose different canonical",
      "google chose different canonical than user",
    ],
  },
  {
    normalizedReason: "alternate_page_with_canonical",
    matches: [
      "вариант страницы с тегом canonical",
      "альтернативная страница с тегом canonical",
      "alternate page with proper canonical tag",
      "alternate page with canonical",
    ],
  },
  {
    normalizedReason: "noindex",
    matches: [
      "индексирование страницы запрещено тегом noindex",
      "исключено тегом noindex",
      "excluded by 'noindex' tag",
      "blocked by noindex",
      "noindex",
    ],
  },
  {
    normalizedReason: "crawled_currently_not_indexed",
    matches: [
      "страница просканирована, но пока не проиндексирована",
      "просканировано, но пока не проиндексировано",
      "crawled - currently not indexed",
      "crawled, currently not indexed",
    ],
  },
  {
    normalizedReason: "discovered_currently_not_indexed",
    matches: [
      "обнаружена, не проиндексирована",
      "обнаружено, но не проиндексировано",
      "discovered - currently not indexed",
      "discovered, currently not indexed",
    ],
  },
];

const LEGACY_ROUTE_SYNONYMS: Record<string, string> = {
  "plumbing/leak-repair": "plumbing/leak-detection-repair",
  "plumbing/water-leak-repair": "plumbing/leak-detection-repair",
  "plumbing/pipe-leak-repair": "plumbing/pipe-repair-replacement",
  "handyman/tv-mounting": "handyman/tv-mounting-shelves",
  "handyman/television-mounting": "handyman/tv-mounting-shelves",
  "hvac/ac-repair": "hvac/air-conditioning-repair",
  "hvac/air-conditioner-repair": "hvac/air-conditioning-repair",
  "lawn/yard-cleanup": "lawn/yard-clean-up",
  "junk-removal/junk-hauling": "junk-removal",
};

export async function runGscUrlIssueAuditAgent(
  options: GscUrlIssueAuditOptions = {}
) {
  const admin = createSupabaseAdminClient();
  const startedAt = Date.now();

  const { data: run, error: runError } = await admin
    .from("ai_agent_runs")
    .insert({
      agent_name: "gsc_url_issue_audit_agent",
      status: "running",
      metadata: {
        source: "google_search_console_url_issue_audit",
      },
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message ?? "Unable to create agent run.");
  }

  try {
    const gsc = getSearchConsoleClient();
    const baseUrl = getBaseUrl(gsc?.siteUrl);
    const candidateLimit = capAuditLimit(
      getPositiveInteger(
        options.candidateLimit,
        "GSC_ISSUE_AUDIT_CANDIDATE_LIMIT",
        DEFAULT_CANDIDATE_LIMIT
      )
    );
    const inspectLimit = gsc
      ? getNonNegativeInteger(
          options.inspectLimit,
          "GSC_ISSUE_AUDIT_INSPECT_LIMIT",
          DEFAULT_INSPECT_LIMIT
        )
      : 0;
    const createOpportunities = options.createOpportunities !== false;

    const candidates = await collectCandidates({
      admin,
      searchconsole: gsc?.client ?? null,
      siteUrl: gsc?.siteUrl ?? null,
      baseUrl,
      options,
    });

    const selected = candidates.slice(0, candidateLimit);
    let inspectedCount = 0;
    let issuesFound = 0;
    let issuesResolved = 0;
    let opportunitiesCreated = 0;
    const issueTypeCounts: Record<string, number> = {};
    const rootCauseCounts: Record<string, number> = {};
    const samples: Array<{
      url: string;
      issueType: string;
      rootCause: string;
      normalizedReason: string;
      severity: string;
    }> = [];

    for (const candidate of selected) {
      const http = await getHttpSnapshot(candidate.url);
      const shouldInspect =
        Boolean(gsc) &&
        inspectedCount < inspectLimit &&
        shouldInspectCandidate(candidate, http);
      const inspection = shouldInspect
        ? await inspectUrl(gsc!.client, gsc!.siteUrl, candidate.url)
        : null;

      if (shouldInspect) inspectedCount += 1;

      const issue = await buildIssueDraft({
        admin,
        baseUrl,
        candidate,
        http,
        inspection,
        allowExternal: options.allowExternal === true,
      });

      if (!issue) {
        const resolved = await markUrlIssuesResolved(admin, candidate.url);
        issuesResolved += resolved;
        continue;
      }

      let opportunityId: string | null = null;

      if (createOpportunities && issue.canCreateOpportunity) {
        const opportunity = await createOpportunityForIssue(admin, issue);
        opportunityId = opportunity.id;

        if (opportunity.created) {
          opportunitiesCreated += 1;
        }
      }

      await upsertIssue(admin, issue, opportunityId);

      issuesFound += 1;
      issueTypeCounts[issue.issueType] =
        (issueTypeCounts[issue.issueType] ?? 0) + 1;
      rootCauseCounts[issue.rootCause] =
        (rootCauseCounts[issue.rootCause] ?? 0) + 1;

      if (samples.length < 10) {
        samples.push({
          url: issue.url,
          issueType: issue.issueType,
          rootCause: issue.rootCause,
          normalizedReason: issue.normalizedReason,
          severity: issue.severity,
        });
      }
    }

    const durationMs = Date.now() - startedAt;
    const summary = `Audited ${selected.length} URLs. Found ${issuesFound} active issues, resolved ${issuesResolved}, created ${opportunitiesCreated} opportunities.`;

    await admin
      .from("ai_agent_runs")
      .update({
        status: "completed",
        summary,
        finished_at: new Date().toISOString(),
        metadata: {
          source: "google_search_console_url_issue_audit",
          durationMs,
          gscAvailable: Boolean(gsc),
          candidatesCollected: candidates.length,
          candidatesAudited: selected.length,
          inspectedCount,
          inspectLimit,
          issuesFound,
          issuesResolved,
          opportunitiesCreated,
          issueTypeCounts,
          rootCauseCounts,
          samples,
        },
      })
      .eq("id", run.id);

    return {
      ok: true,
      runId: run.id,
      candidatesCollected: candidates.length,
      candidatesAudited: selected.length,
      inspectedCount,
      issuesFound,
      issuesResolved,
      opportunitiesCreated,
      issueTypeCounts,
      rootCauseCounts,
      samples,
    };
  } catch (error) {
    await admin
      .from("ai_agent_runs")
      .update({
        status: "failed",
        summary: error instanceof Error ? error.message : "Unknown error",
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    throw error;
  }
}

export async function runGscPageIndexingImportAgent(
  options: GscPageIndexingImportOptions
) {
  const admin = createSupabaseAdminClient();
  const startedAt = Date.now();

  const { data: run, error: runError } = await admin
    .from("ai_agent_runs")
    .insert({
      agent_name: "gsc_page_indexing_import_agent",
      status: "running",
      metadata: {
        source: "google_search_console_page_indexing_export",
      },
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message ?? "Unable to create agent run.");
  }

  try {
    const baseUrl = getBaseUrl(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL);
    const limit = getPositiveInteger(
      options.limit,
      "GSC_PAGE_INDEXING_IMPORT_LIMIT",
      DEFAULT_IMPORT_LIMIT
    );
    const rows = options.rows.slice(0, limit);

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const opportunitiesCreated = 0;
    const byReason: Record<string, number> = {};
    const byRootCause: Record<string, number> = {};
    const examples: Array<{
      url: string;
      reason: string;
      normalizedReason: string;
      issueType: string;
      rootCause: string;
      severity: string;
    }> = [];

    for (const row of rows) {
      const normalizedUrl = normalizeCandidateUrl(row.url, baseUrl, {
        allowExternal: options.allowExternal === true,
      });
      const reason = row.reason ?? options.reason ?? "";
      const normalizedReason = normalizeGscReason(reason);

      if (!normalizedUrl) {
        skippedCount += 1;
        continue;
      }

      const issue = await buildIssueDraft({
        admin,
        baseUrl,
        candidate: {
          url: normalizedUrl,
          source: row.source ?? "gsc_page_indexing_export",
          gscReason: reason,
          normalizedReason,
          metadata: {
            ...(row.metadata ?? {}),
            gscReason: reason,
            normalizedReason,
          },
        },
        http: {
          ok: true,
          status: undefined,
          finalUrl: normalizedUrl,
          redirected: false,
        },
        inspection: null,
        gscReason: reason,
        normalizedReason,
        allowExternal: options.allowExternal === true,
      });

      if (!issue) {
        skippedCount += 1;
        continue;
      }

      const writeResult = await upsertIssue(admin, issue, null);

      if (writeResult === "created") {
        importedCount += 1;
      } else {
        updatedCount += 1;
      }

      byReason[issue.normalizedReason] =
        (byReason[issue.normalizedReason] ?? 0) + 1;
      byRootCause[issue.rootCause] = (byRootCause[issue.rootCause] ?? 0) + 1;

      if (examples.length < 10) {
        examples.push({
          url: issue.url,
          reason,
          normalizedReason: issue.normalizedReason,
          issueType: issue.issueType,
          rootCause: issue.rootCause,
          severity: issue.severity,
        });
      }
    }

    const durationMs = Date.now() - startedAt;

    await admin
      .from("ai_agent_runs")
      .update({
        status: "completed",
        summary: `Imported ${importedCount} new GSC page indexing URLs. Updated ${updatedCount}. Skipped ${skippedCount}.`,
        finished_at: new Date().toISOString(),
        metadata: {
          source: "google_search_console_page_indexing_export",
          mode: "import_only",
          durationMs,
          receivedCount: options.rows.length,
          processedCount: rows.length,
          importedCount,
          updatedCount,
          skippedCount,
          opportunitiesCreated,
          byReason,
          byRootCause,
          examples,
        },
      })
      .eq("id", run.id);

    return {
      ok: true,
      runId: run.id,
      receivedCount: options.rows.length,
      processedCount: rows.length,
      imported: importedCount,
      updated: updatedCount,
      skipped: skippedCount,
      opportunitiesCreated,
      byReason,
      byRootCause,
      examples,
    };
  } catch (error) {
    await admin
      .from("ai_agent_runs")
      .update({
        status: "failed",
        summary: error instanceof Error ? error.message : "Unknown error",
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    throw error;
  }
}

function getSearchConsoleClient():
  | { client: SearchConsoleClient; siteUrl: string }
  | null {
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
  const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;

  if (!siteUrl || !clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return {
    client: google.searchconsole({
      version: "v1",
      auth: oauth2Client,
    }),
    siteUrl,
  };
}

async function collectCandidates(args: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  searchconsole: SearchConsoleClient | null;
  siteUrl: string | null;
  baseUrl: string;
  options: GscUrlIssueAuditOptions;
}) {
  const manualUrls = [
    ...(args.options.urls ?? []),
    ...getEnvList("GSC_ISSUE_AUDIT_EXTRA_URLS"),
  ].map((url) => ({
    url,
    source: "manual",
    metadata: {},
  }));

  const searchAnalyticsLimit = getNonNegativeInteger(
    args.options.searchAnalyticsLimit,
    "GSC_ISSUE_AUDIT_SEARCH_ANALYTICS_LIMIT",
    DEFAULT_SEARCH_ANALYTICS_LIMIT
  );
  const generatedPageLimit = getNonNegativeInteger(
    args.options.generatedPageLimit,
    "GSC_ISSUE_AUDIT_GENERATED_PAGE_LIMIT",
    DEFAULT_GENERATED_PAGE_LIMIT
  );
  const openIssueLimit = getNonNegativeInteger(
    args.options.openIssueLimit,
    "GSC_ISSUE_AUDIT_OPEN_ISSUE_LIMIT",
    DEFAULT_OPEN_ISSUE_LIMIT
  );
  const cappedOpenIssueLimit = capAuditLimit(openIssueLimit);

  const [openIssueUrls, searchAnalyticsUrls, generatedPageUrls] = await Promise.all([
    cappedOpenIssueLimit > 0 || (args.options.issueIds?.length ?? 0) > 0
      ? collectOpenIssueCandidates({
          admin: args.admin,
          limit: cappedOpenIssueLimit,
          issueIds: args.options.issueIds,
        })
      : Promise.resolve([]),
    args.searchconsole && args.siteUrl && searchAnalyticsLimit > 0
      ? collectSearchAnalyticsPageCandidates({
          searchconsole: args.searchconsole,
          siteUrl: args.siteUrl,
          limit: searchAnalyticsLimit,
        })
      : Promise.resolve([]),
    generatedPageLimit > 0
      ? collectGeneratedPageCandidates({
          admin: args.admin,
          baseUrl: args.baseUrl,
          limit: generatedPageLimit,
        })
      : Promise.resolve([]),
  ]);

  return dedupeCandidates(
    [...manualUrls, ...openIssueUrls, ...searchAnalyticsUrls, ...generatedPageUrls],
    args.baseUrl,
    args.options.allowExternal === true
  );
}

async function collectOpenIssueCandidates(args: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  limit: number;
  issueIds?: string[];
}): Promise<CandidateUrl[]> {
  let query = args.admin
    .from("gsc_url_issues")
    .select(
      "id, url, normalized_url, source, gsc_reason, normalized_reason, issue_type, root_cause, metadata, last_seen_at"
    )
    .in("status", ["open", "opportunity_created"])
    .order("last_seen_at", { ascending: false });

  if (args.issueIds && args.issueIds.length > 0) {
    query = query.in("id", args.issueIds);
  } else {
    query = query.limit(args.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((issue) => {
      const metadata =
        issue.metadata && typeof issue.metadata === "object"
          ? (issue.metadata as Record<string, unknown>)
          : {};

      return {
        url:
          typeof issue.normalized_url === "string" && issue.normalized_url
            ? issue.normalized_url
            : issue.url,
        source: "gsc_url_issues",
        gscReason:
          typeof issue.gsc_reason === "string" ? issue.gsc_reason : undefined,
        normalizedReason: isNormalizedGscReason(issue.normalized_reason)
          ? issue.normalized_reason
          : normalizeGscReason(
              typeof issue.gsc_reason === "string" ? issue.gsc_reason : ""
            ),
        issueId: issue.id,
        metadata: {
          ...metadata,
          existingIssueId: issue.id,
          existingIssueType: issue.issue_type,
          existingRootCause: issue.root_cause,
          existingNormalizedReason: issue.normalized_reason,
          existingLastSeenAt: issue.last_seen_at,
        },
      } satisfies CandidateUrl;
    })
    .filter((candidate) => Boolean(candidate.url));
}

async function collectSearchAnalyticsPageCandidates(args: {
  searchconsole: SearchConsoleClient;
  siteUrl: string;
  limit: number;
}): Promise<CandidateUrl[]> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 28);

  const response = await args.searchconsole.searchanalytics.query({
    siteUrl: args.siteUrl,
    requestBody: {
      startDate: toDateString(startDate),
      endDate: toDateString(endDate),
      dimensions: ["page"],
      rowLimit: args.limit,
    },
  });

  const rows = (response.data.rows ?? []) as SearchConsoleRow[];

  const candidates: CandidateUrl[] = [];

  for (const row of rows) {
    const url = row.keys?.[0]?.trim();

    if (!url) continue;

    candidates.push({
      url,
      source: "search_analytics_page",
      metadata: {
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
        startDate: toDateString(startDate),
        endDate: toDateString(endDate),
      },
    });
  }

  return candidates;
}

async function collectGeneratedPageCandidates(args: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  baseUrl: string;
  limit: number;
}): Promise<CandidateUrl[]> {
  const { data, error } = await args.admin
    .from("ai_generated_pages")
    .select("target_url, status, quality_status, updated_at, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(args.limit);

  if (error) {
    throw new Error(error.message);
  }

  const candidates: CandidateUrl[] = [];

  for (const page of data ?? []) {
    if (
      !page.target_url ||
      typeof page.target_url !== "string" ||
      !page.target_url.startsWith("/")
    ) {
      continue;
    }

    candidates.push({
      url: new URL(page.target_url, args.baseUrl).toString(),
      source: "published_generated_page",
      metadata: {
        targetUrl: page.target_url,
        status: page.status,
        qualityStatus: page.quality_status,
        updatedAt: page.updated_at,
        publishedAt: page.published_at,
      },
    });
  }

  return candidates;
}

function dedupeCandidates(
  items: CandidateUrl[],
  baseUrl: string,
  allowExternal = false
) {
  const map = new Map<string, CandidateUrl>();

  for (const item of items) {
    const normalized = normalizeCandidateUrl(item.url, baseUrl, {
      allowExternal,
    });

    if (!normalized) continue;

    const existing = map.get(normalized);

    if (!existing) {
      map.set(normalized, {
        ...item,
        url: normalized,
      });
      continue;
    }

    existing.source = Array.from(
      new Set([...existing.source.split(","), item.source])
    ).join(",");
    existing.gscReason = existing.gscReason ?? item.gscReason;
    existing.normalizedReason =
      existing.normalizedReason ?? item.normalizedReason;
    existing.issueId = existing.issueId ?? item.issueId;
    existing.metadata = {
      ...existing.metadata,
      [`source:${item.source}`]: item.metadata,
    };
  }

  return Array.from(map.values());
}

function normalizeCandidateUrl(
  rawUrl: string,
  baseUrl: string,
  options: { allowExternal?: boolean } = {}
) {
  try {
    const base = new URL(baseUrl);
    const cleaned = cleanCopiedUrl(rawUrl);
    const url = cleaned.startsWith("/")
      ? new URL(cleaned, base)
      : new URL(cleaned);

    if (!["http:", "https:"].includes(url.protocol)) return null;

    const allowedHosts = new Set([base.hostname, `www.${base.hostname}`]);
    const isAllowedHost = allowedHosts.has(url.hostname.toLowerCase());

    if (!isAllowedHost && options.allowExternal !== true) return null;

    if (isAllowedHost) {
      url.protocol = base.protocol;
      url.hostname = base.hostname.toLowerCase();
    } else {
      url.hostname = url.hostname.toLowerCase();
    }

    url.port = "";
    url.hash = "";

    if (url.pathname.length > 1) {
      url.pathname = url.pathname.replace(/\/+$/g, "");
    }

    return url.toString();
  } catch {
    return null;
  }
}

function cleanCopiedUrl(rawUrl: string) {
  let cleaned = rawUrl
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .trim()
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'");

  cleaned = cleaned.replace(/^["'<]+|[>"']+$/g, "").trim();

  try {
    return decodeURI(cleaned);
  } catch {
    return cleaned;
  }
}

async function getHttpSnapshot(url: string): Promise<HttpSnapshot> {
  const head = await fetchWithTimeout(url, "HEAD");

  if (head.status !== 405 && head.status !== 501) {
    return head;
  }

  return fetchWithTimeout(url, "GET");
}

async function fetchWithTimeout(
  url: string,
  method: "HEAD" | "GET"
): Promise<HttpSnapshot> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "user-agent": "Fixly-GSC-Issue-Audit/1.0",
      },
    });

    return {
      ok: true,
      status: response.status,
      finalUrl: response.url,
      redirected: response.redirected,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Fetch failed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

function shouldInspectCandidate(candidate: CandidateUrl, http: HttpSnapshot) {
  if (candidate.source.includes("manual")) return true;
  if (!http.ok) return true;
  if ((http.status ?? 200) >= 400) return true;
  return candidate.source.includes("search_analytics_page");
}

async function inspectUrl(
  searchconsole: SearchConsoleClient,
  siteUrl: string,
  url: string
): Promise<InspectionSnapshot> {
  try {
    const response = await searchconsole.urlInspection.index.inspect({
      requestBody: {
        inspectionUrl: url,
        siteUrl,
        languageCode: "en-US",
      },
    });

    const result = response.data.inspectionResult;
    const index = result?.indexStatusResult;

    return {
      verdict: index?.verdict ?? undefined,
      coverageState: index?.coverageState ?? undefined,
      pageFetchState: index?.pageFetchState ?? undefined,
      indexingState: index?.indexingState ?? undefined,
      robotsTxtState: index?.robotsTxtState ?? undefined,
      googleCanonical: index?.googleCanonical ?? undefined,
      userCanonical: index?.userCanonical ?? undefined,
      inspectionResultLink: result?.inspectionResultLink ?? undefined,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "URL Inspection request failed.",
    };
  }
}

async function buildIssueDraft(args: {
  admin: ReturnType<typeof createSupabaseAdminClient>;
  baseUrl: string;
  candidate: CandidateUrl;
  http: HttpSnapshot;
  inspection: InspectionSnapshot | null;
  gscReason?: string;
  normalizedReason?: NormalizedGscReason;
  allowExternal?: boolean;
}): Promise<IssueDraft | null> {
  const normalizedUrl =
    normalizeCandidateUrl(args.candidate.url, args.baseUrl, {
      allowExternal: args.allowExternal === true,
    }) ?? args.candidate.url;
  const url = new URL(normalizedUrl);
  const path = url.pathname;
  const route = await analyzeRoute(args.admin, path);
  let gscReason =
    args.gscReason ??
    args.candidate.gscReason ??
    getMetadataString(args.candidate.metadata, "gscReason");
  let normalizedReason =
    args.normalizedReason ??
    args.candidate.normalizedReason ??
    normalizeGscReason(gscReason ?? "");

  if (normalizedReason === "unknown" && !gscReason) {
    const existingReason = await getExistingIssueReason(args.admin, normalizedUrl);

    if (existingReason) {
      gscReason = existingReason.gscReason;
      normalizedReason = existingReason.normalizedReason;
    }
  }
  const issueType = getIssueType({
    http: args.http,
    inspection: args.inspection,
    route,
    normalizedReason,
  });

  if (!issueType) {
    return null;
  }

  const rootCause = getRootCause(issueType, route);
  const severity = getSeverity({
    issueType,
    httpStatus: args.http.status,
    metadata: args.candidate.metadata,
  });
  const recommendation = getRecommendation(rootCause, route);
  const actionPayload = getProposedAction(rootCause, route);
  const proposedAction =
    typeof actionPayload.action === "string"
      ? actionPayload.action
      : "manual_review";

  return {
    url: normalizedUrl,
    normalizedUrl,
    path,
    source: args.candidate.source,
    issueType,
    rootCause,
    gscReason,
    normalizedReason,
    severity,
    httpStatus: args.http.status,
    finalUrl: args.http.finalUrl,
    gscVerdict: args.inspection?.verdict,
    gscCoverageState: args.inspection?.coverageState,
    gscPageFetchState: args.inspection?.pageFetchState,
    inspectionIndexStatus:
      args.inspection?.indexingState ?? args.inspection?.verdict,
    inspectionCoverageState: args.inspection?.coverageState,
    canonicalUser: args.inspection?.userCanonical,
    canonicalGoogle: args.inspection?.googleCanonical,
    countryCode: route.countryCode,
    regionSlug: route.regionSlug,
    marketSlug: route.market?.slug,
    categorySlug: route.categorySlug,
    subcategorySlug: route.subcategorySlug,
    intentSlug: route.intentSlug,
    recommendation,
    proposedAction,
    actionPayload,
    metadata: {
      candidate: args.candidate.metadata,
      http: args.http,
      inspection: args.inspection,
      rawGscReason: gscReason,
      normalizedReason,
      issueType,
      rootCause,
      route: {
        routeMarketSlug: route.routeMarketSlug,
        routePath: route.routePath,
        routeProblem: route.routeProblem,
        routeProblemReason: route.routeProblemReason,
      },
      baseUrl: args.baseUrl,
    },
    canCreateOpportunity:
      issueType === "missing_ai_generated_page" && route.canCreateOpportunity,
  };
}

function normalizeGscReason(reason: string): NormalizedGscReason {
  const normalized = normalizeReasonText(reason);

  if (!normalized) return "unknown";

  for (const item of GSC_REASON_PATTERNS) {
    if (item.matches.some((match) => normalized.includes(match))) {
      return item.normalizedReason;
    }
  }

  return "unknown";
}

function isNormalizedGscReason(
  value: unknown
): value is NormalizedGscReason {
  return (
    typeof value === "string" &&
    [
      "not_found_404",
      "server_error_5xx",
      "page_with_redirect",
      "redirect_error",
      "duplicate_without_user_canonical",
      "duplicate_google_chose_different_canonical",
      "alternate_page_with_canonical",
      "noindex",
      "crawled_currently_not_indexed",
      "discovered_currently_not_indexed",
      "unknown",
    ].includes(value)
  );
}

function normalizeReasonText(reason: string) {
  return reason
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, "\"")
    .trim();
}

function getRootCause(issueType: string, route: RouteAnalysis) {
  return route.routeProblem ?? issueType;
}

async function analyzeRoute(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  path: string
): Promise<RouteAnalysis> {
  const parts = path.split("/").filter(Boolean);
  const [countryCode, regionSlug, routeMarketSlug, ...serviceSlug] = parts;
  const analysis: RouteAnalysis = {
    path,
    countryCode,
    regionSlug,
    routeMarketSlug,
    canCreateOpportunity: false,
  };

  if (!countryCode || !regionSlug || !routeMarketSlug || serviceSlug.length === 0) {
    return analysis;
  }

  const market = getMarketByGlobalPath({
    countryCode,
    region: regionSlug,
    market: routeMarketSlug,
  });

  if (!market) {
    return {
      ...analysis,
      routeProblem: "missing_market",
      routeProblemReason: "Market route is not present in the local geo index.",
    };
  }

  const parsed = parseServiceIntentPath(serviceSlug);
  const route = getLegacyServiceRoute(parsed.routePath);
  const categorySlugFromPath = serviceSlug[0];
  const categoryFromPath = categorySlugFromPath
    ? categories[categorySlugFromPath]
    : null;
  const subcategoryFromPath = serviceSlug[1]
    ? getSubcategoryBySlug(serviceSlug[1])
    : null;
  const categorySlug =
    route?.categorySlug ??
    (route?.subcategorySlug
      ? getSubcategoryBySlug(route.subcategorySlug)?.parentSlug
      : undefined) ??
    categoryFromPath?.slug;
  const subcategorySlug = route?.subcategorySlug ?? subcategoryFromPath?.slug;
  const category = categorySlug ? getCategoryBySlug(categorySlug) : null;
  const subcategory = subcategorySlug
    ? getSubcategoryBySlug(subcategorySlug)
    : null;
  const publishedAiPage = await getPublishedAiPage(admin, path);
  const synonymTarget = LEGACY_ROUTE_SYNONYMS[parsed.routePath];

  const baseAnalysis: RouteAnalysis = {
    ...analysis,
    market,
    categorySlug,
    subcategorySlug,
    intentSlug: parsed.intent?.slug,
    routePath: parsed.routePath,
  };

  if (!route && !publishedAiPage) {
    if (
      category &&
      parsed.intent &&
      isIntentAllowedForService({
        category,
        subcategory,
        intentSlug: parsed.intent.slug,
      })
    ) {
      return {
        ...baseAnalysis,
        routeProblem: "missing_ai_generated_page",
        routeProblemReason:
          "The market, service, and intent are valid, but no published AI-generated recovery page exists for this path.",
        canCreateOpportunity: true,
      };
    }

    if (!category && !subcategory && !synonymTarget) {
      return {
        ...baseAnalysis,
        routeProblem: "should_410",
        routeProblemReason:
          "The URL does not match a known market service, service synonym, intent, or generated page target.",
        canCreateOpportunity: false,
      };
    }

    return {
      ...baseAnalysis,
      routeProblem: "missing_service_route",
      routeProblemReason: synonymTarget
        ? `Service route is not mapped, but ${parsed.routePath} looks like a legacy synonym for ${synonymTarget}.`
        : "Service route is not mapped and no published AI page exists for this path.",
      canCreateOpportunity: false,
    };
  }

  if (
    route &&
    parsed.intent &&
    category &&
    !isIntentAllowedForService({
      category,
      subcategory,
      intentSlug: parsed.intent.slug,
    }) &&
    !publishedAiPage
  ) {
    return {
      ...baseAnalysis,
      routeProblem: "invalid_intent",
      routeProblemReason:
        "Intent is blocked for this service and no published AI override page exists.",
      canCreateOpportunity: false,
    };
  }

  return baseAnalysis;
}

async function getPublishedAiPage(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  path: string
) {
  const { data, error } = await admin
    .from("ai_generated_pages")
    .select("id")
    .eq("target_url", path)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function getExistingIssueReason(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  normalizedUrl: string
) {
  const { data, error } = await admin
    .from("gsc_url_issues")
    .select("gsc_reason, normalized_reason")
    .eq("normalized_url", normalizedUrl)
    .neq("normalized_reason", "unknown")
    .order("last_seen_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !isNormalizedGscReason(data.normalized_reason)) {
    return null;
  }

  return {
    gscReason:
      typeof data.gsc_reason === "string" ? data.gsc_reason : undefined,
    normalizedReason: data.normalized_reason,
  };
}

function getIssueType(args: {
  http: HttpSnapshot;
  inspection: InspectionSnapshot | null;
  route: RouteAnalysis;
  normalizedReason: NormalizedGscReason;
}) {
  const { http, inspection, route, normalizedReason } = args;
  const status = http.status;
  const hasLiveStatus = typeof status === "number";

  if (normalizedReason === "not_found_404") {
    if (route.routeProblem) return route.routeProblem;
    if (!hasLiveStatus) return "valid_route_but_http_404";
    if (!http.ok || status === 404 || status >= 400) {
      return status >= 500 ? "server_error" : "valid_route_but_http_404";
    }

    return null;
  }

  if (normalizedReason === "server_error_5xx") {
    if (!hasLiveStatus) return "server_error";
    if (!http.ok || status >= 500) return "server_error";
    return null;
  }

  if (
    normalizedReason === "page_with_redirect" ||
    normalizedReason === "redirect_error"
  ) {
    if (!hasLiveStatus) return "redirect";
    if (!http.ok || http.redirected || (status >= 300 && status < 400)) {
      return "redirect";
    }

    return null;
  }

  if (normalizedReason === "noindex") {
    if (
      inspection?.verdict === "PASS" &&
      inspection.indexingState !== "BLOCKED_BY_META_TAG"
    ) {
      return null;
    }

    return "noindex";
  }

  if (
    normalizedReason === "duplicate_without_user_canonical" ||
    normalizedReason === "duplicate_google_chose_different_canonical" ||
    normalizedReason === "alternate_page_with_canonical"
  ) {
    if (
      inspection?.verdict === "PASS" &&
      inspection.googleCanonical &&
      inspection.userCanonical &&
      inspection.googleCanonical === inspection.userCanonical
    ) {
      return null;
    }

    return "canonical_duplicate";
  }

  if (normalizedReason === "crawled_currently_not_indexed") {
    return inspection?.verdict === "PASS" ? null : "crawled_not_indexed";
  }

  if (normalizedReason === "discovered_currently_not_indexed") {
    return inspection?.verdict === "PASS" ? null : "discovered_not_indexed";
  }

  if (route.routeProblem && (status === 404 || !http.ok)) {
    return route.routeProblem;
  }

  if (http.ok && hasLiveStatus) {
    if (status >= 500) return "server_error";
    if (status === 404) return "valid_route_but_http_404";
    if (status >= 400) return "should_410";
    if (http.redirected) return "redirect";
  }

  if (!http.ok) return "server_error";

  const pageFetchState = inspection?.pageFetchState;

  if (pageFetchState && pageFetchState in GOOGLE_FETCH_ISSUE_TYPES) {
    if (route.routeProblem && pageFetchState === "NOT_FOUND") {
      return route.routeProblem;
    }

    return GOOGLE_FETCH_ISSUE_TYPES[pageFetchState];
  }

  if (inspection?.indexingState === "BLOCKED_BY_META_TAG") return "noindex";
  if (inspection?.robotsTxtState === "DISALLOWED") return "noindex";
  if (inspection?.verdict === "FAIL") return "unknown";

  return null;
}

function getSeverity(args: {
  issueType: string;
  httpStatus?: number;
  metadata: Record<string, unknown>;
}): IssueDraft["severity"] {
  const impressions = getMetadataNumber(args.metadata, "impressions");
  const clicks = getMetadataNumber(args.metadata, "clicks");

  if (args.httpStatus && args.httpStatus >= 500) return "critical";

  if (
    [
      "missing_market",
      "missing_service_route",
      "missing_ai_generated_page",
      "valid_route_but_http_404",
      "server_error",
      "crawled_not_indexed",
      "discovered_not_indexed",
      "should_410",
    ].includes(args.issueType)
  ) {
    return clicks > 0 || impressions >= 50 ? "critical" : "high";
  }

  if (["redirect", "canonical_duplicate", "noindex"].includes(args.issueType)) {
    return impressions >= 50 ? "high" : "medium";
  }

  return "medium";
}

function getRecommendation(issueType: string, route: RouteAnalysis) {
  const marketName = route.market
    ? `${route.market.city}, ${route.market.state}`
    : route.routeMarketSlug ?? "the requested market";
  const serviceName = route.categorySlug
    ? route.categorySlug.replace(/-/g, " ")
    : "the requested service";

  if (issueType === "missing_market") {
    return `Review whether ${route.routeMarketSlug ?? "this market"} should exist in the geo dataset. If it is a real supported market, add it to the geo index; otherwise redirect to the nearest valid market or intentionally return 410.`;
  }

  if (issueType === "missing_service_route") {
    return `Review whether ${serviceName} in ${marketName} is an old synonym, typo, or service route gap. Add a canonical redirect or legacy route only after review.`;
  }

  if (issueType === "missing_ai_generated_page") {
    return `Create a reviewed AI SEO opportunity for ${serviceName} in ${marketName}; do not publish until the normal quality/review pipeline approves it.`;
  }

  if (issueType === "invalid_intent") {
    return `Review the service intent mapping for ${serviceName} in ${marketName}. Keep 404/noindex if the combination is semantically invalid, or publish an approved AI override page if the URL has real search demand.`;
  }

  if (issueType === "server_error") {
    return "Investigate production errors for this URL before asking Google to recrawl it.";
  }

  if (issueType === "valid_route_but_http_404") {
    return "The route looks valid but production returns 404. Compare the route handler, generated-page lookup, and sitemap URL before requesting recrawl.";
  }

  if (issueType === "should_410") {
    return "Decide whether this URL should become a valid page, redirect to a canonical URL, be removed from sitemaps/internal links, or intentionally return 410.";
  }

  if (issueType === "canonical_duplicate") {
    return "Compare Google-selected canonical with the page-declared canonical, then align canonical tags, internal links, sitemap URLs, and duplicate page content.";
  }

  if (issueType === "redirect") {
    return "Remove redirected URLs from sitemaps/internal links and point Google to the final canonical URL directly.";
  }

  if (issueType === "crawled_not_indexed") {
    return "Improve the page's unique value, canonical signals, internal links, and sitemap freshness; if the page is low-value, consolidate or noindex it intentionally.";
  }

  if (issueType === "discovered_not_indexed") {
    return "Strengthen internal links and sitemap signals, reduce crawl waste, and make sure the URL returns a fast 200 with unique indexable content.";
  }

  if (issueType === "soft_404") {
    return "Strengthen the page content and canonical signals, or intentionally noindex/remove the URL if it should not rank.";
  }

  if (issueType === "noindex") {
    return "Check whether robots/noindex is intentional. If the page should rank, remove the blocking directive and resubmit the sitemap.";
  }

  return "Review the URL, canonical target, sitemap inclusion, and internal links before requesting recrawl.";
}

function getProposedAction(issueType: string, route: RouteAnalysis) {
  if (issueType === "missing_market") {
    return {
      action: "geo_review_required",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      regionSlug: route.regionSlug,
      routeMarketSlug: route.routeMarketSlug,
      reason: route.routeProblemReason,
    };
  }

  if (issueType === "missing_service_route") {
    const synonymTarget = route.routePath
      ? LEGACY_ROUTE_SYNONYMS[route.routePath]
      : undefined;

    return {
      action: synonymTarget
        ? "review_legacy_route_redirect"
        : "review_service_route_or_redirect",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      marketSlug: route.market?.slug,
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
      intentSlug: route.intentSlug,
      targetUrl: route.path,
      synonymTarget,
      reason: route.routeProblemReason,
    };
  }

  if (issueType === "missing_ai_generated_page") {
    return {
      action: "create_ai_page_opportunity",
      safeToAutoFix: route.canCreateOpportunity,
      countryCode: route.countryCode,
      marketSlug: route.market?.slug,
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
      intentSlug: route.intentSlug,
      targetUrl: route.path,
      reason: route.routeProblemReason,
    };
  }

  if (issueType === "valid_route_but_http_404") {
    return {
      action: "check_route_runtime_404",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      marketSlug: route.market?.slug,
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
      intentSlug: route.intentSlug,
      targetUrl: route.path,
      reason: route.routeProblemReason,
    };
  }

  if (issueType === "server_error") {
    return {
      action: "check_logs",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      marketSlug: route.market?.slug,
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
      intentSlug: route.intentSlug,
      targetUrl: route.path,
      reason: route.routeProblemReason,
    };
  }

  if (issueType === "noindex") {
    return {
      action: "check_metadata_robots",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      marketSlug: route.market?.slug,
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
      intentSlug: route.intentSlug,
      targetUrl: route.path,
      reason: route.routeProblemReason,
    };
  }

  if (
    [
      "canonical_duplicate",
    ].includes(issueType)
  ) {
    return {
      action: "check_canonical",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      marketSlug: route.market?.slug,
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
      intentSlug: route.intentSlug,
      targetUrl: route.path,
      reason: route.routeProblemReason,
    };
  }

  if (issueType === "redirect" || issueType === "should_redirect") {
    return {
      action: "check_redirect",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      marketSlug: route.market?.slug,
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
      intentSlug: route.intentSlug,
      targetUrl: route.path,
      reason: route.routeProblemReason,
    };
  }

  if (
    issueType === "crawled_not_indexed" ||
    issueType === "discovered_not_indexed"
  ) {
    return {
      action: "review_content_quality_and_internal_links",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      marketSlug: route.market?.slug,
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
      intentSlug: route.intentSlug,
      targetUrl: route.path,
      reason: route.routeProblemReason,
    };
  }

  if (issueType === "should_410") {
    return {
      action: "review_410_or_redirect",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      marketSlug: route.market?.slug,
      categorySlug: route.categorySlug,
      subcategorySlug: route.subcategorySlug,
      intentSlug: route.intentSlug,
      targetUrl: route.path,
      reason: route.routeProblemReason,
    };
  }

  return {
    action: "manual_review",
    safeToAutoFix: false,
    countryCode: route.countryCode,
    marketSlug: route.market?.slug,
    categorySlug: route.categorySlug,
    subcategorySlug: route.subcategorySlug,
    intentSlug: route.intentSlug,
    targetUrl: route.path,
    reason: route.routeProblemReason,
  };
}

async function createOpportunityForIssue(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  issue: IssueDraft
) {
  if (
    !issue.marketSlug ||
    !issue.categorySlug ||
    !issue.intentSlug ||
    !issue.countryCode
  ) {
    return {
      id: null,
      created: false,
    };
  }

  const { data: existing, error: existingError } = await admin
    .from("ai_seo_opportunities")
    .select("id")
    .eq("target_url", issue.path)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return {
      id: existing.id as string,
      created: false,
    };
  }

  const market = issue.marketSlug ? getMarketByGlobalPath({
    countryCode: issue.countryCode,
    region: issue.regionSlug ?? "",
    market: issue.path.split("/").filter(Boolean)[2] ?? "",
  }) : null;
  const category = issue.categorySlug ? categories[issue.categorySlug] : null;
  const marketPath = market ? getMarketUrlPath(market) : null;

  const { data: created, error } = await admin
    .from("ai_seo_opportunities")
    .insert({
      country_code: issue.countryCode,
      market_slug: issue.marketSlug,
      category_slug: issue.categorySlug,
      subcategory_slug: issue.subcategorySlug ?? null,
      intent_slug: issue.intentSlug,
      opportunity_type: "technical_seo",
      title: `Recover indexed URL for ${category?.shortTitle ?? issue.categorySlug}`,
      target_url: issue.path,
      search_query: null,
      priority_score: issue.severity === "critical" ? 98 : 90,
      recommendation: issue.recommendation,
      proposed_action: {
        ...issue.actionPayload,
        source: "gsc_url_issue_audit_agent",
        issueType: issue.issueType,
        rootCause: issue.rootCause,
        normalizedReason: issue.normalizedReason,
        marketPath,
      },
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Unable to create SEO opportunity.");
  }

  return {
    id: created.id as string,
    created: true,
  };
}

async function upsertIssue(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  issue: IssueDraft,
  opportunityId: string | null
): Promise<"created" | "updated"> {
  const now = new Date().toISOString();
  const nextStatus = opportunityId ? "opportunity_created" : "open";

  const { data: existing, error: existingError } = await admin
    .from("gsc_url_issues")
    .select("id, status, opportunity_id")
    .eq("normalized_url", issue.normalizedUrl)
    .eq("normalized_reason", issue.normalizedReason)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const row = {
    source: issue.source,
    normalized_url: issue.normalizedUrl,
    gsc_reason: issue.gscReason ?? null,
    normalized_reason: issue.normalizedReason,
    issue_type: issue.issueType,
    root_cause: issue.rootCause,
    path: issue.path,
    severity: issue.severity,
    http_status: issue.httpStatus ?? null,
    final_url: issue.finalUrl ?? null,
    gsc_verdict: issue.gscVerdict ?? null,
    gsc_coverage_state: issue.gscCoverageState ?? null,
    gsc_page_fetch_state: issue.gscPageFetchState ?? null,
    inspection_index_status: issue.inspectionIndexStatus ?? null,
    inspection_coverage_state: issue.inspectionCoverageState ?? null,
    canonical_user: issue.canonicalUser ?? null,
    canonical_google: issue.canonicalGoogle ?? null,
    country_code: issue.countryCode ?? null,
    region_slug: issue.regionSlug ?? null,
    market_slug: issue.marketSlug ?? null,
    category_slug: issue.categorySlug ?? null,
    subcategory_slug: issue.subcategorySlug ?? null,
    intent_slug: issue.intentSlug ?? null,
    recommendation: issue.recommendation,
    proposed_action: issue.proposedAction,
    action_payload: issue.actionPayload,
    metadata: issue.metadata,
    opportunity_id: opportunityId ?? existing?.opportunity_id ?? null,
    last_seen_at: now,
    resolved_at: null,
    updated_at: now,
  };

  if (existing) {
    const { error } = await admin
      .from("gsc_url_issues")
      .update({
        ...row,
        status:
          existing.status === "ignored"
            ? "ignored"
            : opportunityId || existing.opportunity_id
              ? "opportunity_created"
              : nextStatus,
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }

    return "updated";
  }

  const { error } = await admin.from("gsc_url_issues").insert({
    ...row,
    url: issue.url,
    status: nextStatus,
  });

  if (error) {
    throw new Error(error.message);
  }

  return "created";
}

async function markUrlIssuesResolved(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  url: string
) {
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("gsc_url_issues")
    .update({
      status: "resolved",
      resolved_at: now,
      last_seen_at: now,
      updated_at: now,
    })
    .eq("normalized_url", url)
    .in("status", ["open", "opportunity_created"])
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  return data?.length ?? 0;
}

function getBaseUrl(siteUrl?: string | null) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_BASE_URL;

  if (!siteUrl || siteUrl.startsWith("sc-domain:")) {
    return fromEnv;
  }

  try {
    return new URL(siteUrl).origin;
  } catch {
    return fromEnv;
  }
}

function getPositiveInteger(
  optionValue: number | undefined,
  envKey: string,
  fallback: number
): number {
  if (
    typeof optionValue === "number" &&
    Number.isInteger(optionValue) &&
    optionValue > 0
  ) {
    return optionValue;
  }

  const envValue = Number(process.env[envKey]);

  if (Number.isInteger(envValue) && envValue > 0) {
    return envValue;
  }

  return fallback;
}

function capAuditLimit(value: number) {
  return Math.min(MAX_AUDIT_LIMIT, Math.max(0, value));
}

function getNonNegativeInteger(
  optionValue: number | undefined,
  envKey: string,
  fallback: number
): number {
  if (
    typeof optionValue === "number" &&
    Number.isInteger(optionValue) &&
    optionValue >= 0
  ) {
    return optionValue;
  }

  const envValue = Number(process.env[envKey]);

  if (Number.isInteger(envValue) && envValue >= 0) {
    return envValue;
  }

  return fallback;
}

function getEnvList(key: string) {
  return (process.env[key] ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getMetadataNumber(metadata: Record<string, unknown>, key: string) {
  const direct = metadata[key];

  if (typeof direct === "number" && Number.isFinite(direct)) {
    return direct;
  }

  for (const value of Object.values(metadata)) {
    if (!value || typeof value !== "object") continue;

    const nested = (value as Record<string, unknown>)[key];

    if (typeof nested === "number" && Number.isFinite(nested)) {
      return nested;
    }
  }

  return 0;
}

function getMetadataString(metadata: Record<string, unknown>, key: string) {
  const direct = metadata[key];

  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  for (const value of Object.values(metadata)) {
    if (!value || typeof value !== "object") continue;

    const nested = (value as Record<string, unknown>)[key];

    if (typeof nested === "string" && nested.trim()) {
      return nested.trim();
    }
  }

  return undefined;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}
