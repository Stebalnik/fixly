import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getRoleRedirectPath,
  normalizeLoginIntent,
  type LoginIntent,
} from "@/lib/auth/roleRedirect";

export function getSafePostLoginNext(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  if (value.includes("\\")) {
    return undefined;
  }

  let parsed: URL;

  try {
    parsed = new URL(value, "https://fixly.work");
  } catch {
    return undefined;
  }
  const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;

  if (
    parsed.pathname === "/login" ||
    parsed.pathname.startsWith("/api/auth") ||
    parsed.pathname.includes("/signup") ||
    parsed.pathname.includes("/onboarding")
  ) {
    return undefined;
  }

  return path;
}

export async function getPostLoginRedirectPath(args: {
  userId: string;
  intent?: string | null;
  next?: string | null;
  lead?: string | null;
}) {
  const intent: LoginIntent = normalizeLoginIntent(args.intent);
  const requestedNext = getSafePostLoginNext(args.next);
  const admin = createSupabaseAdminClient();

  const [
    { data: proProfile, error: proProfileError },
    { data: customerProfile, error: customerProfileError },
    { data: adminUser, error: adminUserError },
  ] = await Promise.all([
    admin
      .from("pro_profiles")
      .select("user_id, status")
      .eq("user_id", args.userId)
      .maybeSingle(),

    admin
      .from("customer_profiles")
      .select("user_id")
      .eq("user_id", args.userId)
      .maybeSingle(),

    admin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", args.userId)
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

  if (adminUserError) {
    console.error("Failed to load admin role after login", adminUserError);
  }

  if (requestedNext?.startsWith("/account/admin")) {
    return adminUser ? requestedNext : "/account";
  }

  const hasProProfile =
    Boolean(proProfile) &&
    (!proProfile?.status || proProfile.status === "active");
  const hasCustomerProfile = Boolean(customerProfile);

  const redirectPath = getRoleRedirectPath({
    hasProProfile,
    hasCustomerProfile,
    intent,
    next: requestedNext,
  });

  const redirectUrl = new URL(redirectPath, "https://fixly.work");

  if (args.lead && redirectUrl.pathname === "/pro/onboarding") {
    redirectUrl.searchParams.set("lead", args.lead);
  }

  return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
}
