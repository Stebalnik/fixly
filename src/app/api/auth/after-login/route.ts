import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeLoginIntent } from "@/lib/auth/roleRedirect";
import {
  getPostLoginRedirectPath,
  getSafePostLoginNext,
} from "@/lib/auth/postLogin";
import {
  applySupabaseCookieMutations,
  clearSupabaseCookies,
  isRefreshTokenNotFoundError,
  type SupabaseCookieToSet,
} from "@/lib/auth/supabaseCookies";

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://fixly.work"
  );
}

export async function GET(request: NextRequest) {
  const authCookiesToSet: SupabaseCookieToSet[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: SupabaseCookieToSet[]) {
          authCookiesToSet.push(...cookiesToSet);
        },
      },
    }
  );
  const intent = normalizeLoginIntent(
    request.nextUrl.searchParams.get("intent")
  );
  const next = getSafePostLoginNext(request.nextUrl.searchParams.get("next"));
  const lead = request.nextUrl.searchParams.get("lead") ?? undefined;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL("/login", getAppUrl());
    redirectUrl.searchParams.set("intent", intent);
    redirectUrl.searchParams.set(
      "error",
      "Login session was not available on the server. Please log in again."
    );

    if (next) {
      redirectUrl.searchParams.set("next", next);
    }

    if (lead) {
      redirectUrl.searchParams.set("lead", lead);
    }

    const response = NextResponse.redirect(redirectUrl);
    applySupabaseCookieMutations(response, authCookiesToSet);

    if (isRefreshTokenNotFoundError(error)) {
      clearSupabaseCookies(response, request.cookies.getAll());
    }

    return response;
  }

  const redirectPath = await getPostLoginRedirectPath({
    userId: user.id,
    intent,
    next,
    lead,
  });

  const redirectUrl = new URL(redirectPath, getAppUrl());

  const response = NextResponse.redirect(redirectUrl);
  applySupabaseCookieMutations(response, authCookiesToSet);

  return response;
}
