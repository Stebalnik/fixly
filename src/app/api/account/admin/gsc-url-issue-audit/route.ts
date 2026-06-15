import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdminUser();

  const token = process.env.INTERNAL_AI_AGENT_TOKEN;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Internal agent token is not configured." },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    limit?: unknown;
  };
  const limit = getLimit(body.limit);
  const internalUrl = new URL(
    "/api/internal/ai-agents/gsc-url-issue-audit",
    request.url
  );

  const response = await fetch(internalUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      candidateLimit: limit,
      openIssueLimit: limit,
      searchAnalyticsLimit: 0,
      generatedPageLimit: 0,
      inspectLimit: Math.min(limit, 20),
      createOpportunities: false,
    }),
  });

  const result = await response.json().catch(() => ({
    ok: false,
    error: "GSC audit returned a non-JSON response.",
  }));

  return NextResponse.json(result, { status: response.status });
}

function getLimit(value: unknown) {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 1000;

  if (!Number.isFinite(number)) return 1000;

  return Math.max(1, Math.min(1000, Math.floor(number)));
}
