export type LoginIntent = "pro" | "customer";

export function normalizeLoginIntent(value?: string | null): LoginIntent {
  return value === "customer" ? "customer" : "pro";
}

function isSafeInternalPath(value?: string): value is string {
  if (!value) {
    return false;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return false;
  }

  return true;
}

export function getSignupPathByIntent(intent: LoginIntent, next?: string) {
  const params = new URLSearchParams();

  if (isSafeInternalPath(next)) {
    params.set("next", next);
  }

  if (intent === "customer") {
    return `/customer/signup${params.toString() ? `?${params}` : ""}`;
  }

  return `/pro/signup${params.toString() ? `?${params}` : ""}`;
}

function getSafeRoleNext(
  next: string | undefined,
  allowedPrefixes: string[]
): string | null {
  if (!isSafeInternalPath(next)) {
    return null;
  }

  if (next.includes("/onboarding") || next.includes("/signup")) {
    return null;
  }

  const isAllowed = allowedPrefixes.some(
    (prefix) => next === prefix || next.startsWith(`${prefix}/`)
  );

  return isAllowed ? next : null;
}

export function getRoleRedirectPath(args: {
  hasProProfile: boolean;
  hasCustomerProfile: boolean;
  intent: LoginIntent;
  next?: string;
}) {
  const { hasProProfile, hasCustomerProfile, intent, next } = args;

  if (hasProProfile && hasCustomerProfile) {
    return (
      getSafeRoleNext(next, [
        "/account",
        "/pro",
        "/customer",
        "/us/requests",
      ]) ?? "/account"
    );
  }

  if (hasProProfile) {
    return (
      getSafeRoleNext(next, ["/account", "/pro", "/us/requests"]) ?? "/pro"
    );
  }

  if (hasCustomerProfile) {
    return (
      getSafeRoleNext(next, ["/account", "/customer", "/us/requests"]) ??
      "/customer"
    );
  }

  return getSignupPathByIntent(intent, next);
}