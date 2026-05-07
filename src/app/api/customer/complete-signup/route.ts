import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    requestId?: string;
    next?: string;
  };

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const phone = body.phone?.trim() ?? "";
  const password = body.password ?? "";
  const requestId = body.requestId?.trim() ?? "";
  const next = body.next?.trim() || "/customer";

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: createdUser, error: createUserError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        role: "customer",
      },
    });

  if (createUserError || !createdUser.user) {
    return NextResponse.json(
      { error: createUserError?.message ?? "Unable to create user." },
      { status: 400 }
    );
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await admin
    .from("customer_profiles")
    .upsert(
      {
        user_id: userId,
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
        customer_user_id: userId,
      })
      .eq("id", requestId);

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 400 });
    }
  }

  return NextResponse.json({
    ok: true,
    email,
    redirectTo: next.startsWith("/") ? next : "/customer",
  });
}