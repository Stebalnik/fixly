import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getRoleRedirectPath,
  normalizeLoginIntent,
} from "@/lib/auth/roleRedirect";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  const intent = normalizeLoginIntent(
    request.nextUrl.searchParams.get("intent")
  );

  const next = request.nextUrl.searchParams.get("next") ?? undefined;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("intent", intent);

    if (next) {
      url.searchParams.set("next", next);
    }

    return NextResponse.redirect(url);
  }

  const admin = createSupabaseAdminClient();

  const [{ data: proProfile }, { data: customerProfile }] = await Promise.all([
    admin
      .from("pro_profiles")
      .select("user_id, status")
      .eq("user_id", user.id)
      .maybeSingle(),

    admin
      .from("customer_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const hasProProfile =
    Boolean(proProfile) &&
    (!proProfile?.status || proProfile.status === "active");

  const hasCustomerProfile = Boolean(customerProfile);

  const redirectPath = getRoleRedirectPath({
    hasProProfile,
    hasCustomerProfile,
    intent,
    next,
  });

  return NextResponse.redirect(new URL(redirectPath, request.url));
}