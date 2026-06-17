import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  applySupabaseCookieMutations,
  clearSupabaseCookies,
  getSupabaseCookieOptions,
  type SupabaseCookieToSet,
} from "@/lib/auth/supabaseCookies";

export async function POST() {
  const cookieStore = await cookies();
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
        setAll(cookiesToSet) {
          authCookiesToSet.push(...cookiesToSet);
        },
      },
    }
  );

  await supabase.auth.signOut();

  const response = NextResponse.json({ ok: true });
  applySupabaseCookieMutations(response, authCookiesToSet);
  clearSupabaseCookies(response, cookieStore.getAll());

  return response;
}
