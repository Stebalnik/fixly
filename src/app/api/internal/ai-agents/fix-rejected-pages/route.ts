import { NextResponse } from "next/server";
import { runFixRejectedPagesAgent } from "@/lib/ai-agents/fix-rejected-pages-agent";

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