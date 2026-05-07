import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function getUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    publicDescription?: string;
    action?: "archive" | "reopen";
  };

  const admin = createSupabaseAdminClient();

  const updatePayload: Record<string, unknown> = {};

  if (body.action === "archive") {
    updatePayload.status = "archived";
    updatePayload.lead_status = "closed";
  } else if (body.action === "reopen") {
    updatePayload.status = "open";
    updatePayload.lead_status = "available";
  }

  if (body.publicDescription !== undefined) {
    const description = body.publicDescription.trim();

    if (description.length < 20) {
      return NextResponse.json(
        { error: "Description must be at least 20 characters." },
        { status: 400 }
      );
    }

    updatePayload.public_description = description;
  }

  const { error } = await admin
    .from("service_requests")
    .update(updatePayload)
    .eq("id", id)
    .eq("customer_user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("service_requests")
    .update({
      status: "deleted",
      lead_status: "closed",
    })
    .eq("id", id)
    .eq("customer_user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}