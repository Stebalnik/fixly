import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";
import { getInternalAiAgentToken } from "@/lib/ai-agents/internal-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  await requireAdminUser();

  const token = getInternalAiAgentToken();

  return NextResponse.json({
    ok: true,
    internalTokenConfigured: Boolean(token),
    internalTokenLength: token?.length ?? 0,
  });
}
