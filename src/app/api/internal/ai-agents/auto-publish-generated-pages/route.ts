import { NextResponse } from "next/server";
import { runAutoPublishGeneratedPagesAgent } from "@/lib/ai-agents/auto-publish-generated-pages-agent";
import { requireInternalAiAgentAuth } from "@/lib/ai-agents/internal-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = requireInternalAiAgentAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const result = await runAutoPublishGeneratedPagesAgent();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Auto publish generated pages failed.",
      },
      { status: 500 }
    );
  }
}
