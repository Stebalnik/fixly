import { NextResponse } from "next/server";
import { runServiceRequestGeneratorAgent } from "@/lib/ai-agents/request-generator-agent";
import { requireInternalAiAgentAuth } from "@/lib/ai-agents/internal-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = requireInternalAiAgentAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await runServiceRequestGeneratorAgent();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Service request generation failed.",
      },
      { status: 500 }
    );
  }
}
