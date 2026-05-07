import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    lead?: string;
    next?: string;
  };

  const name = body.name?.trim() ?? "";
  const lead = body.lead?.trim() ?? "";
  const next = body.next?.trim() ?? "";

  if (!name) {
    return NextResponse.json(
      { error: "Name is required." },
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
        setAll() {
          // Route handler response is JSON here.
          // Session cookies are already created by the browser Supabase client.
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { error: profileError } = await admin.from("pro_profiles").upsert(
    {
      user_id: user.id,
      company_name: "",
      status: "active",
    },
    {
      onConflict: "user_id",
    }
  );

  if (profileError) {
    return NextResponse.json(
      { error: "Unable to create pro profile." },
      { status: 500 }
    );
  }

  const { error: updateUserError } = await admin.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        role: "pro",
        name,
      },
    }
  );

  if (updateUserError) {
    return NextResponse.json(
      { error: "Unable to update pro profile." },
      { status: 500 }
    );
  }

  const { error: subscriptionError } = await admin
    .from("pro_subscriptions")
    .upsert(
      {
        pro_user_id: user.id,
        status: "trialing",
        plan: "starter",
        current_period_end: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        onConflict: "pro_user_id",
      }
    );

  if (subscriptionError) {
    return NextResponse.json(
      { error: "Unable to create pro subscription." },
      { status: 500 }
    );
  }

  const { error: fixaAccountError } = await admin
    .from("user_fixa_accounts")
    .upsert(
      {
        user_id: user.id,
        balance: 0,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (fixaAccountError) {
    return NextResponse.json(
      { error: "Unable to create FIXA account." },
      { status: 500 }
    );
  }

  const redirectTo = new URL(next || "/account/fixa", request.url);

  if (lead) {
    redirectTo.searchParams.set("lead", lead);
  }

  return NextResponse.json({
    ok: true,
    redirectTo: `${redirectTo.pathname}${redirectTo.search}`,
  });
}