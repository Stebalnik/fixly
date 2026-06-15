import { NextResponse } from "next/server";
import { runSeoOpportunityAgent } from "@/lib/ai-agents/seo-opportunity-agent";
import { requireInternalAiAgentAuth } from "@/lib/ai-agents/internal-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = requireInternalAiAgentAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await runSeoOpportunityAgent();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Agent failed.",
      },
      { status: 500 }
    );
  }
}
