import { NextResponse } from "next/server";
import { runAutoPublishGeneratedPagesAgent } from "@/lib/ai-agents/auto-publish-generated-pages-agent";

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