import { NextResponse } from "next/server";
import { runInternalSeoExpansionAgent } from "@/lib/ai-agents/internal-seo-expansion-agent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.INTERNAL_AI_AGENT_TOKEN;

  if (!expectedToken) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing INTERNAL_API_TOKEN.",
      },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized.",
      },
      { status: 401 }
    );
  }

  try {
    const result = await runInternalSeoExpansionAgent();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}