import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_STATUSES = ["new", "approved", "ignored", "in_progress"] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return (
    typeof value === "string" &&
    ALLOWED_STATUSES.includes(value as AllowedStatus)
  );
}

export async function POST(request: Request, { params }: RouteProps) {
  await requireAdminUser();

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: unknown;
  };

  if (!isAllowedStatus(body.status)) {
    return NextResponse.json(
      { ok: false, error: "Invalid status." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("ai_seo_opportunities")
    .update({
      status: body.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: body.status,
  });
}