import { NextResponse } from "next/server";
import { runSeoOpportunityAgent } from "@/lib/ai-agents/seo-opportunity-agent";

export const dynamic = "force-dynamic";

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