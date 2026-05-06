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

export function getRoleRedirectPath(args: {
  hasProProfile: boolean;
  hasCustomerProfile: boolean;
  intent: LoginIntent;
  next?: string;
}) {
  const { hasProProfile, hasCustomerProfile, intent, next } = args;

  if (hasProProfile && hasCustomerProfile) {
    return "/account/select-role";
  }

  if (hasProProfile) {
    return next && next.startsWith("/pro") ? next : "/pro";
  }

  if (hasCustomerProfile) {
    return next && next.startsWith("/customer") ? next : "/customer";
  }

  return getSignupPathByIntent(intent, next);
}