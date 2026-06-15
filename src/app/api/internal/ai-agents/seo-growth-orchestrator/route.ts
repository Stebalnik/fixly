import { NextResponse } from "next/server";
import { runSeoGrowthOrchestrator } from "@/lib/ai-agents/orchestrators/seo-growth-orchestrator";
import { requireInternalAiAgentAuth } from "@/lib/ai-agents/internal-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = requireInternalAiAgentAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await runSeoGrowthOrchestrator();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "SEO growth orchestration failed.",
      },
      { status: 500 }
    );
  }
}
