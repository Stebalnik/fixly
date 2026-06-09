import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const loggedOutState = {
  isLoggedIn: false,
  fixaBalance: null,
  unreadNotifications: 0,
};

function hasSupabaseAuthCookie(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")
    );
}

function loggedOutResponse(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const response = NextResponse.json(loggedOutState);

  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
      });
    }
  }

  return response;
}

export async function GET() {
  const cookieStore = await cookies();

  if (!hasSupabaseAuthCookie(cookieStore)) {
    return NextResponse.json(loggedOutState);
  }

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

  return NextResponse.json({
    isLoggedIn: true,
    fixaBalance: fixaAccount?.balance ?? 0,
    unreadNotifications: unreadNotifications ?? 0,
  });
}
