export type LoginIntent = "pro" | "customer";

export function normalizeLoginIntent(value?: string | null): LoginIntent {
  return value === "customer" ? "customer" : "pro";
}

export function getSignupPathByIntent(intent: LoginIntent, next?: string) {
  const params = new URLSearchParams();

  if (next) {
    params.set("next", next);
  }

  if (intent === "customer") {
    return `/customer/signup${params.toString() ? `?${params}` : ""}`;
  }

  return `/pro/onboarding${params.toString() ? `?${params}` : ""}`;
}

function isSafeRoleNext(next: string | undefined, allowedPrefixes: string[]) {
  if (!next || !next.startsWith("/")) {
    return false;
  }

  if (next.includes("/onboarding") || next.includes("/signup")) {
    return false;
  }

  return allowedPrefixes.some(
    (prefix) => next === prefix || next.startsWith(`${prefix}/`)
  );
}

export function getRoleRedirectPath(args: {
  hasProProfile: boolean;
  hasCustomerProfile: boolean;
  intent: LoginIntent;
  next?: string;
}) {
  const { hasProProfile, hasCustomerProfile, intent, next } = args;

  if (hasProProfile && hasCustomerProfile) {
    return isSafeRoleNext(next, ["/account", "/pro", "/customer"])
      ? next!
      : "/account";
  }

  if (hasProProfile) {
    return isSafeRoleNext(next, ["/account", "/pro"]) ? next! : "/pro";
  }

  if (hasCustomerProfile) {
    return isSafeRoleNext(next, ["/account", "/customer"])
      ? next!
      : "/customer";
  }

  return getSignupPathByIntent(intent, next);
}