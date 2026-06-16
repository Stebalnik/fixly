import { requireAdminUser } from "@/lib/auth/admin";
import { runGscUrlIssueAuditAgent } from "@/lib/ai-agents/gsc-url-issue-audit-agent";
import { readGscUrlIssueAuditOptions } from "@/lib/ai-agents/gsc-url-issue-route-options";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdminUser();

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
