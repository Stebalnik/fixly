import type { CookieOptions } from "@supabase/ssr";
import type { NextResponse } from "next/server";

type CookieLike = {
  name: string;
  value?: string;
};

export type SupabaseCookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

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
  cookies: CookieLike[]
) {
  for (const cookie of cookies) {
    if (!isSupabaseCookieName(cookie.name)) continue;

    response.cookies.set(cookie.name, "", {
      path: "/",
      maxAge: 0,
    });
  }
}

export function applySupabaseCookieMutations(
  response: NextResponse,
  cookiesToSet: SupabaseCookieToSet[]
) {
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options);
  }
}
