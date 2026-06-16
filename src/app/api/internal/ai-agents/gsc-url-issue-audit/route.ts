import { NextResponse } from "next/server";
import {
  runGscUrlIssueAuditAgent,
} from "@/lib/ai-agents/gsc-url-issue-audit-agent";
import { requireInternalAiAgentAuth } from "@/lib/ai-agents/internal-auth";
import { readGscUrlIssueAuditOptions } from "@/lib/ai-agents/gsc-url-issue-route-options";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = requireInternalAiAgentAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const options = await readGscUrlIssueAuditOptions(request);
    const result = await runGscUrlIssueAuditAgent(options);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "GSC URL issue audit failed.",
      },
      { status: 500 }
    );
  }
}
