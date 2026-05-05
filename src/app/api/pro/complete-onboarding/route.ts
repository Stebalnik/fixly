import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    companyName?: string;
    lead?: string;
    next?: string;
  };

  const companyName = body.companyName?.trim() ?? "";
  const lead = body.lead?.trim() ?? "";
  const next = body.next?.trim() ?? "";

  if (!companyName) {
    return NextResponse.json(
      { error: "Company name is required." },
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

  const { error: profileError } = await admin.from("pro_profiles").upsert({
    user_id: user.id,
    company_name: companyName,
    status: "active",
  });

  if (profileError) {
    return NextResponse.json(
      { error: "Unable to create pro profile." },
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

  const { error: creditsError } = await admin
    .from("pro_credit_accounts")
    .upsert({
      pro_user_id: user.id,
      balance: 0,
      updated_at: new Date().toISOString(),
    });

  if (creditsError) {
    return NextResponse.json(
      { error: "Unable to create credit account." },
      { status: 500 }
    );
  }

  const redirectTo = new URL(next || "/pro/credits", request.url);

  if (lead) {
    redirectTo.searchParams.set("lead", lead);
  }

  return NextResponse.json({
    ok: true,
    redirectTo: `${redirectTo.pathname}${redirectTo.search}`,
  });
}