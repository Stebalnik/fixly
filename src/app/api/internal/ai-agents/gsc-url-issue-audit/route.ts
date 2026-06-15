import { NextResponse } from "next/server";
import {
  runGscUrlIssueAuditAgent,
  type GscUrlIssueAuditOptions,
} from "@/lib/ai-agents/gsc-url-issue-audit-agent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.INTERNAL_AI_AGENT_TOKEN;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const options = await readOptions(request);
    const result = await runGscUrlIssueAuditAgent(options);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "GSC URL issue audit failed.",
      },
      { status: 500 }
    );
  }
}

async function readOptions(request: Request): Promise<GscUrlIssueAuditOptions> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return {};
  }

  const body = (await request.json()) as Record<string, unknown>;

  return {
    urls: Array.isArray(body.urls)
      ? body.urls.filter((url): url is string => typeof url === "string")
      : undefined,
    issueIds: Array.isArray(body.issueIds)
      ? body.issueIds.filter((id): id is string => typeof id === "string")
      : undefined,
    candidateLimit: getNumber(body.candidateLimit),
    openIssueLimit: getNumber(body.openIssueLimit),
    searchAnalyticsLimit: getNumber(body.searchAnalyticsLimit),
    generatedPageLimit: getNumber(body.generatedPageLimit),
    inspectLimit: getNumber(body.inspectLimit),
    createOpportunities:
      typeof body.createOpportunities === "boolean"
        ? body.createOpportunities
        : undefined,
    allowExternal:
      typeof body.allowExternal === "boolean" ? body.allowExternal : undefined,
  };
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined;
}
