import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureFixaAccount } from "@/lib/fixa";

export type ProAccessContext =
  | {
      ok: true;
      proUserId: string;
      hasActiveSubscription: boolean;
      creditBalance: number;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

export async function getProAccessContext(): Promise<ProAccessContext> {
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
    return {
      ok: false,
      status: 401,
      message: "Login required.",
    };
  }

  const admin = createSupabaseAdminClient();

  const { data: profile } = await admin
    .from("pro_profiles")
    .select("user_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || profile.status !== "active") {
    return {
      ok: false,
      status: 403,
      message: "Active pro profile required.",
    };
  }

  const { data: subscription } = await admin
    .from("pro_subscriptions")
    .select("status, current_period_end, created_at")
    .eq("pro_user_id", user.id)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  const hasActiveSubscription =
    Boolean(subscription) && (!periodEnd || periodEnd > new Date());

  const fixaBalance = await ensureFixaAccount(user.id);

  return {
    ok: true,
    proUserId: user.id,
    hasActiveSubscription,
    creditBalance: fixaBalance,
  };
}