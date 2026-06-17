"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseCookieOptionsForHost } from "@/lib/auth/supabaseCookieOptions";

export function createSupabaseBrowserClient() {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : undefined;
  const secure =
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : undefined;

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: getSupabaseCookieOptionsForHost(hostname, secure),
    }
  );
}
