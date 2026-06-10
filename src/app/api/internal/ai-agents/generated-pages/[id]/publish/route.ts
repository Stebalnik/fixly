import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  await requireAdminUser();

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: page, error: pageError } = await admin
    .from("ai_generated_pages")
    .select("id, target_url, status")
    .eq("id", id)
    .maybeSingle();

  if (pageError) {
    return NextResponse.json(
      { ok: false, error: pageError.message },
      { status: 500 }
    );
  }

  if (!page) {
    return NextResponse.json(
      { ok: false, error: "Generated page not found." },
      { status: 404 }
    );
  }

  if (!page.target_url.startsWith("/")) {
    return NextResponse.json(
      { ok: false, error: "Invalid target URL." },
      { status: 400 }
    );
  }

  const { error: updateError } = await admin
    .from("ai_generated_pages")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: updateError.message },
      { status: 500 }
    );
  }

  revalidatePath(page.target_url);
  revalidatePath("/sitemaps/generated-pages.xml");

  return NextResponse.json({
    ok: true,
    status: "published",
    targetUrl: page.target_url,
  });
}
