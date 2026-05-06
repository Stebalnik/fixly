import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getRoleRedirectPath, normalizeLoginIntent } from "@/lib/auth/roleRedirect";

export async function GET(request: NextRequest) {
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

  const intent = normalizeLoginIntent(request.nextUrl.searchParams.get("intent"));
  const next = request.nextUrl.searchParams.get("next") ?? undefined;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("intent", intent);
    if (next) url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  const [{ data: proProfile }, { data: customerProfile }] = await Promise.all([
    supabase
      .from("pro_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("customer_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const redirectPath = getRoleRedirectPath({
    hasProProfile: Boolean(proProfile),
    hasCustomerProfile: Boolean(customerProfile),
    intent,
    next,
  });

  return NextResponse.redirect(new URL(redirectPath, request.url));
}