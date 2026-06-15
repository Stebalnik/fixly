import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdminUser();

  const token = process.env.INTERNAL_AI_AGENT_TOKEN;

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Internal agent token is not configured." },
      { status: 500 }
    );
  }

  const body = await request.text();
  const internalUrl = new URL(
    "/api/internal/ai-agents/gsc-page-indexing-import",
    request.url
  );
  const requestUrl = new URL(request.url);

  requestUrl.searchParams.forEach((value, key) => {
    internalUrl.searchParams.set(key, value);
  });

  const response = await fetch(internalUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type":
        request.headers.get("content-type") ?? "text/plain; charset=utf-8",
    },
    body,
  });

  const result = await response.json().catch(() => ({
    ok: false,
    error: "GSC import returned a non-JSON response.",
  }));

  return NextResponse.json(result, { status: response.status });
}
