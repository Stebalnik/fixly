import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  applySupabaseCookieMutations,
  clearSupabaseCookies,
  getSupabaseCookieOptions,
  hasSupabaseAuthCookie,
  type SupabaseCookieToSet,
} from "@/lib/auth/supabaseCookies";

export const dynamic = "force-dynamic";

const loggedOutState = {
  isLoggedIn: false,
  fixaBalance: null,
  unreadNotifications: 0,
};

function loggedOutResponse(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const response = NextResponse.json(loggedOutState);
  clearSupabaseCookies(response, cookieStore.getAll());

  return response;
}

export async function GET() {
  const cookieStore = await cookies();

  if (!hasSupabaseAuthCookie(cookieStore.getAll())) {
    return NextResponse.json(loggedOutState);
  }

  const authCookiesToSet: SupabaseCookieToSet[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: getSupabaseCookieOptions(),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: SupabaseCookieToSet[]) {
          authCookiesToSet.push(...cookiesToSet);
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return loggedOutResponse(cookieStore);
  }

  const admin = createSupabaseAdminClient();

  const [{ data: fixaAccount }, { count: unreadNotifications }] =
    await Promise.all([
      admin
        .from("user_fixa_accounts")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle(),

      admin
        .from("notifications")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .is("read_at", null),
    ]);

  const response = NextResponse.json({
    isLoggedIn: true,
    fixaBalance: fixaAccount?.balance ?? 0,
    unreadNotifications: unreadNotifications ?? 0,
  });
  applySupabaseCookieMutations(response, authCookiesToSet);

  return response;
}
