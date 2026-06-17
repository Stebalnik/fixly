import type { CookieOptions } from "@supabase/ssr";

const SHARED_COOKIE_ROOT_DOMAIN = "fixly.work";
const SHARED_COOKIE_DOMAIN = `.${SHARED_COOKIE_ROOT_DOMAIN}`;

export function normalizeCookieHostname(hostname?: string | null) {
  if (!hostname) return "";

  return hostname.split(":")[0]?.trim().toLowerCase() ?? "";
}

export function getSupabaseSharedCookieDomain(hostname?: string | null) {
  const normalized = normalizeCookieHostname(hostname);

  if (
    normalized === SHARED_COOKIE_ROOT_DOMAIN ||
    normalized.endsWith(SHARED_COOKIE_DOMAIN)
  ) {
    return SHARED_COOKIE_DOMAIN;
  }

  return undefined;
}

function getDefaultCookieHostname() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://fixly.work";

  try {
    return new URL(siteUrl).hostname;
  } catch {
    return "";
  }
}

export function getSupabaseCookieOptionsForHost(
  hostname?: string | null,
  secure?: boolean
): CookieOptions {
  const domain = getSupabaseSharedCookieDomain(hostname);

  return {
    ...(domain ? { domain } : {}),
    path: "/",
    sameSite: "lax",
    secure: secure ?? Boolean(domain),
  };
}

export function getSupabaseCookieOptions(): CookieOptions {
  return getSupabaseCookieOptionsForHost(getDefaultCookieHostname());
}
