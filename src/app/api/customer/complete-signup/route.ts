import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    fullName?: string;
    email?: string;
    phone?: string;
    requestId?: string;
    next?: string;
  };

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const requestId = body.requestId?.trim() ?? "";
  const next = body.next?.trim() || "/customer";

  if (!fullName || !email) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 }
    );
  }

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

  if (!user) {
    return NextResponse.json(
      { error: "Please confirm your email or log in to continue." },
      { status: 401 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { error: profileError } = await admin
    .from("customer_profiles")
    .upsert(
      {
        user_id: user.id,
        full_name: fullName,
        email,
        phone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  if (requestId) {
    const { error: requestError } = await admin
      .from("service_requests")
      .update({
        customer_user_id: user.id,
      })
      .eq("id", requestId)
      .is("customer_user_id", null);

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 400 });
    }
  }

  return NextResponse.json({
    ok: true,
    redirectTo: next.startsWith("/") ? next : "/customer",
  });
}