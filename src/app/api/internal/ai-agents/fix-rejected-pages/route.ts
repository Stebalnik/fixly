import { NextResponse } from "next/server";
import { runFixRejectedPagesAgent } from "@/lib/ai-agents/fix-rejected-pages-agent";
import { requireInternalAiAgentAuth } from "@/lib/ai-agents/internal-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = requireInternalAiAgentAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await runFixRejectedPagesAgent();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Fix rejected pages failed.",
      },
      { status: 500 }
    );
  }
}
