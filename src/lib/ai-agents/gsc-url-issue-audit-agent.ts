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
  routeProblem?: "missing_market" | "missing_service_route" | "invalid_intent";
  routeProblemReason?: string;
  canCreateOpportunity: boolean;
};

type IssueDraft = {
  url: string;
  path: string;
  source: string;
  issueType: string;
  severity: "low" | "medium" | "high" | "critical";
  httpStatus?: number;
  finalUrl?: string;
  gscVerdict?: string;
  gscCoverageState?: string;
  gscPageFetchState?: string;
  countryCode?: string;
  regionSlug?: string;
  marketSlug?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  intentSlug?: string;
  recommendation: string;
  proposedAction: Record<string, unknown>;
  metadata: Record<string, unknown>;
  canCreateOpportunity: boolean;
};

export type GscUrlIssueAuditOptions = {
  urls?: string[];
  candidateLimit?: number;
  searchAnalyticsLimit?: number;
  generatedPageLimit?: number;
  inspectLimit?: number;
  createOpportunities?: boolean;
};

const DEFAULT_BASE_URL = "https://fixly.work";
const DEFAULT_CANDIDATE_LIMIT = 150;
const DEFAULT_SEARCH_ANALYTICS_LIMIT = 100;
const DEFAULT_GENERATED_PAGE_LIMIT = 75;
const DEFAULT_INSPECT_LIMIT = 20;
const HTTP_TIMEOUT_MS = 10_000;

const GOOGLE_FETCH_ISSUE_TYPES: Record<string, string> = {
  NOT_FOUND: "google_not_found",
  SOFT_404: "soft_404",
  BLOCKED_ROBOTS_TXT: "blocked_by_robots",
  SERVER_ERROR: "google_server_error",
  REDIRECT_ERROR: "redirect_error",
  ACCESS_DENIED: "access_denied",
  ACCESS_FORBIDDEN: "access_forbidden",
  BLOCKED_4XX: "blocked_4xx",
  INTERNAL_CRAWL_ERROR: "internal_crawl_error",
  INVALID_URL: "invalid_url",
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
    const candidateLimit = getPositiveInteger(
      options.candidateLimit,
      "GSC_ISSUE_AUDIT_CANDIDATE_LIMIT",
      DEFAULT_CANDIDATE_LIMIT
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
    const samples: Array<{ url: string; issueType: string; severity: string }> = [];

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

      if (samples.length < 10) {
        samples.push({
          url: issue.url,
          issueType: issue.issueType,
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

  const [searchAnalyticsUrls, generatedPageUrls] = await Promise.all([
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
    [...manualUrls, ...searchAnalyticsUrls, ...generatedPageUrls],
    args.baseUrl
  );
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

function dedupeCandidates(items: CandidateUrl[], baseUrl: string) {
  const map = new Map<string, CandidateUrl>();

  for (const item of items) {
    const normalized = normalizeCandidateUrl(item.url, baseUrl);

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
    existing.metadata = {
      ...existing.metadata,
      [`source:${item.source}`]: item.metadata,
    };
  }

  return Array.from(map.values());
}

function normalizeCandidateUrl(rawUrl: string, baseUrl: string) {
  try {
    const base = new URL(baseUrl);
    const url = rawUrl.startsWith("/")
      ? new URL(rawUrl, base)
      : new URL(rawUrl);

    if (!["http:", "https:"].includes(url.protocol)) return null;

    const allowedHosts = new Set([base.hostname, `www.${base.hostname}`]);

    if (!allowedHosts.has(url.hostname)) return null;

    url.protocol = base.protocol;
    url.hostname = base.hostname;
    url.port = "";
    url.hash = "";
    url.search = "";

    if (url.pathname.length > 1) {
      url.pathname = url.pathname.replace(/\/+$/g, "");
    }

    return url.toString();
  } catch {
    return null;
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
}): Promise<IssueDraft | null> {
  const url = new URL(args.candidate.url);
  const path = url.pathname;
  const route = await analyzeRoute(args.admin, path);
  const issueType = getIssueType(args.http, args.inspection, route);

  if (!issueType) {
    return null;
  }

  const severity = getSeverity({
    issueType,
    httpStatus: args.http.status,
    metadata: args.candidate.metadata,
  });
  const recommendation = getRecommendation(issueType, route);
  const proposedAction = getProposedAction(issueType, route);

  return {
    url: args.candidate.url,
    path,
    source: args.candidate.source,
    issueType,
    severity,
    httpStatus: args.http.status,
    finalUrl: args.http.finalUrl,
    gscVerdict: args.inspection?.verdict,
    gscCoverageState: args.inspection?.coverageState,
    gscPageFetchState: args.inspection?.pageFetchState,
    countryCode: route.countryCode,
    regionSlug: route.regionSlug,
    marketSlug: route.market?.slug,
    categorySlug: route.categorySlug,
    subcategorySlug: route.subcategorySlug,
    intentSlug: route.intentSlug,
    recommendation,
    proposedAction,
    metadata: {
      candidate: args.candidate.metadata,
      http: args.http,
      inspection: args.inspection,
      route: {
        routeMarketSlug: route.routeMarketSlug,
        routePath: route.routePath,
        routeProblem: route.routeProblem,
        routeProblemReason: route.routeProblemReason,
      },
      baseUrl: args.baseUrl,
    },
    canCreateOpportunity: route.canCreateOpportunity,
  };
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

  const baseAnalysis: RouteAnalysis = {
    ...analysis,
    market,
    categorySlug,
    subcategorySlug,
    intentSlug: parsed.intent?.slug,
    routePath: parsed.routePath,
  };

  if (!route && !publishedAiPage) {
    return {
      ...baseAnalysis,
      routeProblem: "missing_service_route",
      routeProblemReason:
        "Service route is not mapped and no published AI page exists for this path.",
      canCreateOpportunity: Boolean(category && parsed.intent),
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

function getIssueType(
  http: HttpSnapshot,
  inspection: InspectionSnapshot | null,
  route: RouteAnalysis
) {
  if (route.routeProblem && (http.status === 404 || !http.ok)) {
    return route.routeProblem;
  }

  if (http.ok && http.status) {
    if (http.status >= 500) return "http_5xx";
    if (http.status === 404) return "http_404";
    if (http.status >= 400) return "http_4xx";
  }

  if (!http.ok) return "fetch_failed";

  const pageFetchState = inspection?.pageFetchState;

  if (pageFetchState && pageFetchState in GOOGLE_FETCH_ISSUE_TYPES) {
    if (route.routeProblem && pageFetchState === "NOT_FOUND") {
      return route.routeProblem;
    }

    return GOOGLE_FETCH_ISSUE_TYPES[pageFetchState];
  }

  if (inspection?.verdict === "FAIL") return "google_indexing_error";
  if (inspection?.indexingState === "BLOCKED_BY_META_TAG") return "noindex";
  if (inspection?.robotsTxtState === "DISALLOWED") return "blocked_by_robots";

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
      "http_404",
      "google_not_found",
      "missing_service_route",
      "google_server_error",
    ].includes(args.issueType)
  ) {
    return clicks > 0 || impressions >= 50 ? "critical" : "high";
  }

  if (["soft_404", "redirect_error", "blocked_4xx"].includes(args.issueType)) {
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
    return `Create a reviewed AI-generated recovery page or add a canonical service route for ${serviceName} in ${marketName}.`;
  }

  if (issueType === "invalid_intent") {
    return `Review the service intent mapping for ${serviceName} in ${marketName}. Keep 404/noindex if the combination is semantically invalid, or publish an approved AI override page if the URL has real search demand.`;
  }

  if (issueType === "http_5xx" || issueType === "google_server_error") {
    return "Investigate production errors for this URL before asking Google to recrawl it.";
  }

  if (issueType === "http_404" || issueType === "google_not_found") {
    return "Decide whether this URL should become a valid page, redirect to a canonical URL, be removed from sitemaps/internal links, or intentionally return 410.";
  }

  if (issueType === "soft_404") {
    return "Strengthen the page content and canonical signals, or intentionally noindex/remove the URL if it should not rank.";
  }

  if (issueType === "blocked_by_robots" || issueType === "noindex") {
    return "Check whether robots/noindex is intentional. If the page should rank, remove the blocking directive and resubmit the sitemap.";
  }

  return "Review the URL, canonical target, sitemap inclusion, and internal links before requesting recrawl.";
}

function getProposedAction(issueType: string, route: RouteAnalysis) {
  if (issueType === "missing_market") {
    return {
      action: "review_geo_market_or_redirect",
      safeToAutoFix: false,
      countryCode: route.countryCode,
      regionSlug: route.regionSlug,
      routeMarketSlug: route.routeMarketSlug,
      reason: route.routeProblemReason,
    };
  }

  if (issueType === "missing_service_route") {
    return {
      action: route.canCreateOpportunity
        ? "create_ai_page_opportunity"
        : "review_service_route_or_redirect",
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
        ...issue.proposedAction,
        source: "gsc_url_issue_audit_agent",
        issueType: issue.issueType,
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
) {
  const now = new Date().toISOString();
  const nextStatus = opportunityId ? "opportunity_created" : "open";

  const { data: existing, error: existingError } = await admin
    .from("gsc_url_issues")
    .select("id, status")
    .eq("url", issue.url)
    .eq("issue_type", issue.issueType)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const row = {
    source: issue.source,
    path: issue.path,
    severity: issue.severity,
    http_status: issue.httpStatus ?? null,
    final_url: issue.finalUrl ?? null,
    gsc_verdict: issue.gscVerdict ?? null,
    gsc_coverage_state: issue.gscCoverageState ?? null,
    gsc_page_fetch_state: issue.gscPageFetchState ?? null,
    country_code: issue.countryCode ?? null,
    region_slug: issue.regionSlug ?? null,
    market_slug: issue.marketSlug ?? null,
    category_slug: issue.categorySlug ?? null,
    subcategory_slug: issue.subcategorySlug ?? null,
    intent_slug: issue.intentSlug ?? null,
    recommendation: issue.recommendation,
    proposed_action: issue.proposedAction,
    metadata: issue.metadata,
    opportunity_id: opportunityId,
    last_seen_at: now,
    resolved_at: null,
    updated_at: now,
  };

  if (existing) {
    const { error } = await admin
      .from("gsc_url_issues")
      .update({
        ...row,
        status: existing.status === "ignored" ? "ignored" : nextStatus,
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await admin.from("gsc_url_issues").insert({
    ...row,
    url: issue.url,
    issue_type: issue.issueType,
    status: nextStatus,
  });

  if (error) {
    throw new Error(error.message);
  }
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
    .eq("url", url)
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

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}
