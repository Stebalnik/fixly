import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  const secret = process.env.FIXLY_INTERNAL_CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Missing FIXLY_INTERNAL_CRON_SECRET" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (token !== secret) {
    return unauthorized();
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await admin
    .from("service_requests")
    .update({
      status: "archived",
      lead_status: "closed",
      archived_at: now,
      archive_reason: "auto_expired",
    })
    .eq("status", "open")
    .lte("archive_after", now)
    .select("id, public_slug");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    archivedCount: data?.length ?? 0,
    archived: data ?? [],
  });
}