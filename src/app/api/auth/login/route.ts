import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPostLoginRedirectPath } from "@/lib/auth/postLogin";
import {
  applySupabaseCookieMutations,
  clearSupabaseCookies,
  getSupabaseCookieOptionsForRequest,
  isRefreshTokenNotFoundError,
} from "@/lib/auth/supabaseCookies";
import { recordPlatformEvent } from "@/lib/analytics/platform-events";

type LoginBody = {
  email?: string;
  password?: string;
  intent?: string;
  next?: string;
  lead?: string;
};

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authCookiesToSet: CookieToSet[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: getSupabaseCookieOptionsForRequest(request),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          authCookiesToSet.push(...cookiesToSet);
        },
      },
    }
  );

  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      {
        ok: false,
        error: "Email and password are required.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    const response = NextResponse.json(
      {
        ok: false,
        error: error?.message ?? "Login failed.",
      },
      { status: 401 }
    );

    if (isRefreshTokenNotFoundError(error)) {
      clearSupabaseCookies(response, request.cookies.getAll(), {
        hostname: request.nextUrl.hostname,
        includeHostDomain: true,
      });
    }

    return response;
  }

  const redirectTo = await getPostLoginRedirectPath({
    userId: data.user.id,
    intent: body.intent,
    next: body.next,
    lead: body.lead,
  });

  await recordPlatformEvent({
    eventName: "login_success",
    eventGroup: "accounts",
    actorUserId: data.user.id,
    entityType: "auth_user",
    entityId: data.user.id,
    metadata: {
      intent: body.intent ?? null,
      next: body.next ?? null,
      lead: body.lead ?? null,
      redirectTo,
    },
  });

  const response = NextResponse.json({
    ok: true,
    redirectTo,
  });

  clearSupabaseCookies(response, request.cookies.getAll(), {
    hostname: request.nextUrl.hostname,
    includeHostDomain: true,
  });
  applySupabaseCookieMutations(response, authCookiesToSet);

  return response;
}
