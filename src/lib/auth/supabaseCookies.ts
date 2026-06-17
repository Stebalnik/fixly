import type { CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseCookieOptions,
  getSupabaseCookieOptionsForHost,
  getSupabaseSharedCookieDomain,
  normalizeCookieHostname,
} from "@/lib/auth/supabaseCookieOptions";

export { getSupabaseCookieOptions } from "@/lib/auth/supabaseCookieOptions";

type CookieLike = {
  name: string;
  value?: string;
};

export type SupabaseCookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function getSupabaseCookieOptionsForRequest(
  request: NextRequest
): CookieOptions {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.hostname;
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  const hostname = normalizeCookieHostname(host);
  const secure =
    Boolean(getSupabaseSharedCookieDomain(hostname)) ||
    forwardedProto === "https" ||
    request.nextUrl.protocol === "https:";

  return getSupabaseCookieOptionsForHost(hostname, secure);
}

export function isSupabaseCookieName(name: string) {
  return name.startsWith("sb-");
}

export function hasSupabaseAuthCookie(cookies: CookieLike[]) {
  return cookies.some(
    (cookie) =>
      isSupabaseCookieName(cookie.name) && cookie.name.includes("auth-token")
  );
}

export function isRefreshTokenNotFoundError(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return error.code === "refresh_token_not_found";
}

export function isSessionMissingError(error: unknown) {
  if (!error || typeof error !== "object" || !("name" in error)) {
    return false;
  }

  return error.name === "AuthSessionMissingError";
}

export function clearSupabaseCookies(
  response: NextResponse,
  cookies: CookieLike[],
  options: {
    hostname?: string | null;
    includeSharedDomain?: boolean;
    includeHostDomain?: boolean;
  } = {}
) {
  const hostname = normalizeCookieHostname(options.hostname);
  const sharedDomain =
    options.includeSharedDomain === false
      ? undefined
      : getSupabaseSharedCookieDomain(hostname) ??
        getSupabaseCookieOptions().domain;
  const domains = new Set<string>();

  if (sharedDomain) {
    domains.add(sharedDomain);
  }

  if (options.includeHostDomain && hostname && hostname !== sharedDomain) {
    domains.add(hostname);
  }

  for (const cookie of cookies) {
    if (!isSupabaseCookieName(cookie.name)) continue;

    response.cookies.set(cookie.name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    for (const domain of domains) {
      response.cookies.set(cookie.name, "", {
        domain,
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }
}

export function applySupabaseCookieMutations(
  response: NextResponse,
  cookiesToSet: SupabaseCookieToSet[],
  headers: Record<string, string> = {}
) {
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options);
  }
}
