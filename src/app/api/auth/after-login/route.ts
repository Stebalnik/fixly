import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getRoleRedirectPath,
  normalizeLoginIntent,
} from "@/lib/auth/roleRedirect";

function isSafeInternalPath(value?: string) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  const intent = normalizeLoginIntent(
    request.nextUrl.searchParams.get("intent")
  );

  const nextParam = request.nextUrl.searchParams.get("next") ?? undefined;
  const next = isSafeInternalPath(nextParam) ? nextParam : undefined;
  const lead = request.nextUrl.searchParams.get("lead") ?? undefined;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("intent", intent);

    if (next) {
      url.searchParams.set("next", next);
    }

    if (lead) {
      url.searchParams.set("lead", lead);
    }

    return NextResponse.redirect(url);
  }

  const admin = createSupabaseAdminClient();

  const [
    { data: proProfile, error: proProfileError },
    { data: customerProfile, error: customerProfileError },
  ] = await Promise.all([
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

  if (proProfileError) {
    console.error("Failed to load pro profile after login", proProfileError);
  }

  if (customerProfileError) {
    console.error(
      "Failed to load customer profile after login",
      customerProfileError
    );
  }

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

  const redirectUrl = new URL(redirectPath, request.url);

  if (lead && redirectUrl.pathname === "/pro/onboarding") {
    redirectUrl.searchParams.set("lead", lead);
  }

  return NextResponse.redirect(redirectUrl);
}