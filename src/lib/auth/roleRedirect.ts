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

  if (next && next.startsWith("/")) {
    return next;
  }

  if (hasProProfile && hasCustomerProfile) {
    return "/account";
  }

  if (hasProProfile) {
    return "/pro";
  }

  if (hasCustomerProfile) {
    return "/customer";
  }

  return getSignupPathByIntent(intent);
}