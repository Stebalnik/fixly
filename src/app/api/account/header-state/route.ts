import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      isLoggedIn: false,
      fixaBalance: null,
      unreadNotifications: 0,
    });
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

  return NextResponse.json({
    isLoggedIn: true,
    fixaBalance: fixaAccount?.balance ?? 0,
    unreadNotifications: unreadNotifications ?? 0,
  });
}