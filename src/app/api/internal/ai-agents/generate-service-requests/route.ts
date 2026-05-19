import { NextResponse } from "next/server";
import { runServiceRequestGeneratorAgent } from "@/lib/ai-agents/request-generator-agent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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