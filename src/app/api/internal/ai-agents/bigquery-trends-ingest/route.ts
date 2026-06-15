import { NextResponse } from "next/server";
import { runBigQueryTrendsIngestAgent } from "@/lib/ai-agents/bigquery-trends-ingest-agent";
import { requireInternalAiAgentAuth } from "@/lib/ai-agents/internal-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = requireInternalAiAgentAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await runBigQueryTrendsIngestAgent();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "BigQuery Trends ingest failed.",
      },
      { status: 500 }
    );
  }
}
