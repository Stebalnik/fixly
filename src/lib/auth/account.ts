import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureFixaAccount, getFixaBalance } from "@/lib/fixa";
import {
  isRefreshTokenNotFoundError,
  isSessionMissingError,
  isSupabaseCookieName,
  getSupabaseCookieOptions,
  type SupabaseCookieToSet,
} from "@/lib/auth/supabaseCookies";

export type AccountRole = "customer" | "pro";

export type AccountContext = {
  user: User;
  roles: AccountRole[];
  fixaBalance: number;
  unreadNotifications: number;
};

export async function getCurrentUser() {
  const cookieStore = await cookies();

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
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can read auth cookies but cannot write them.
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (isRefreshTokenNotFoundError(error)) {
      clearSupabaseCookiesFromStore(cookieStore);
    } else if (!isSessionMissingError(error)) {
      console.error("Failed to get current user", error);
    }

    return null;
  }

  return user;
}

function clearSupabaseCookiesFromStore(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  try {
    cookieStore.getAll().forEach((cookie) => {
      if (!isSupabaseCookieName(cookie.name)) return;

      cookieStore.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
      });
    });
  } catch {
    // Server Components cannot mutate cookies; API routes clear them in responses.
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  return user;
}

export async function getUserRoles(userId: string): Promise<AccountRole[]> {
  const admin = createSupabaseAdminClient();

  const [{ data: customerProfile, error: customerError }, { data: proProfile, error: proError }] =
    await Promise.all([
      admin
        .from("customer_profiles")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle(),

      admin
        .from("pro_profiles")
        .select("user_id, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle(),
    ]);

  if (customerError) {
    console.error("Failed to load customer role", customerError);
  }

  if (proError) {
    console.error("Failed to load pro role", proError);
  }

  const roles: AccountRole[] = [];

  if (customerProfile) {
    roles.push("customer");
  }

  if (proProfile) {
    roles.push("pro");
  }

  return roles;
}

export async function getUserFixaBalance(userId: string) {
  return getFixaBalance(userId);
}

export async function ensureUserFixaAccount(userId: string) {
  return ensureFixaAccount(userId);
}

export async function getUnreadNotificationsCount(userId: string) {
  const admin = createSupabaseAdminClient();

  const { count, error } = await admin
    .from("notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("Failed to count unread notifications", error);
    return 0;
  }

  return count ?? 0;
}

export async function getAccountContext(): Promise<AccountContext> {
  const user = await requireCurrentUser();

  const [roles, fixaBalance, unreadNotifications] = await Promise.all([
    getUserRoles(user.id),
    ensureUserFixaAccount(user.id),
    getUnreadNotificationsCount(user.id),
  ]);

  return {
    user,
    roles,
    fixaBalance,
    unreadNotifications,
  };
}

export function hasRole(roles: AccountRole[], role: AccountRole) {
  return roles.includes(role);
}
