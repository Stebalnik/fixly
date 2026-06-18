import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";
import { recordPlatformEvent } from "@/lib/analytics/platform-events";

type CompleteProOnboardingBody = {
  fullName?: string;
  name?: string;
  companyName?: string;
  phone?: string;
  lead?: string;
  next?: string;
};

function getSafeRedirectPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account/fixa";
  }

  return value;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CompleteProOnboardingBody;

  const fullName = (body.fullName ?? body.name ?? "").trim();
  const companyName = body.companyName?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const lead = body.lead?.trim() ?? "";
  const next = getSafeRedirectPath(body.next);

  if (fullName.length < 2) {
    return NextResponse.json(
      { error: "Full name is required." },
      { status: 400 }
    );
  }

  if (companyName.length < 2) {
    return NextResponse.json(
      { error: "Company name is required." },
      { status: 400 }
    );
  }

  if (phone.length < 7) {
    return NextResponse.json(
      { error: "Phone number is required." },
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
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { error: profileError } = await admin.from("pro_profiles").upsert(
    {
      user_id: user.id,

      full_name: fullName,
      company_name: companyName,
      phone,

      contact_name: fullName,
      contact_email: user.email ?? null,
      contact_phone: phone,

      email: user.email ?? null,
      status: "active",
      updated_at: now,
    },
    {
      onConflict: "user_id",
    }
  );

  if (profileError) {
    console.error("Failed to update pro profile", profileError);

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
        full_name: fullName,
        name: fullName,
        company_name: companyName,
        phone,
      },
    }
  );

  if (updateUserError) {
    console.error("Failed to update pro user metadata", updateUserError);

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
    console.error("Failed to create pro subscription", subscriptionError);

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
        updated_at: now,
      },
      {
        onConflict: "user_id",
      }
    );

  if (fixaAccountError) {
    console.error("Failed to create FIXA account", fixaAccountError);

    return NextResponse.json(
      { error: "Unable to create FIXA account." },
      { status: 500 }
    );
  }

  await createNotification({
    userId: user.id,
    type: "pro_onboarding_completed",
    title: "Pro account activated",
    body: "Your Fixly Pro account is active. You can now buy FIXAs and unlock leads.",
    href: "/account",
    metadata: {
      proUserId: user.id,
      lead,
      next,
    },
  });

  await recordPlatformEvent({
    eventName: "pro_onboarding_completed",
    eventGroup: "accounts",
    actorUserId: user.id,
    entityType: "pro_profile",
    entityId: user.id,
    metadata: {
      lead: lead || null,
      next,
      hasCompanyName: Boolean(companyName),
    },
  });

  const redirectTo = new URL(next, request.url);

  if (lead) {
    redirectTo.searchParams.set("lead", lead);
  }

  return NextResponse.json({
    ok: true,
    redirectTo: `${redirectTo.pathname}${redirectTo.search}`,
  });
}
