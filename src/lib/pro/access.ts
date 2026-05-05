import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

function createAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase public environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
}

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return "";
  return header.replace("Bearer ", "").trim();
}

export async function getProAccessContext(
  request: Request
): Promise<ProAccessContext> {
  const token = getBearerToken(request);

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Login required.",
    };
  }

  const authClient = createAuthClient();
  const admin = createSupabaseAdminClient();

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(token);

  if (userError || !user) {
    return {
      ok: false,
      status: 401,
      message: "Invalid session.",
    };
  }

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
    .select("status, current_period_end")
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

  const { data: credits } = await admin
    .from("pro_credit_accounts")
    .select("balance")
    .eq("pro_user_id", user.id)
    .maybeSingle();

  return {
    ok: true,
    proUserId: user.id,
    hasActiveSubscription,
    creditBalance: credits?.balance ?? 0,
  };
}