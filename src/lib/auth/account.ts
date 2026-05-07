import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AccountRole = "customer" | "pro";

export type AccountContext = {
  user: User;
  roles: AccountRole[];
  fixaBalance: number;
};

export async function getCurrentUser() {
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

  return user;
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

  const [{ data: customerProfile }, { data: proProfile }] = await Promise.all([
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
  const admin = createSupabaseAdminClient();

  const { data: account } = await admin
    .from("user_fixa_accounts")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  return account?.balance ?? 0;
}

export async function ensureUserFixaAccount(userId: string) {
  const admin = createSupabaseAdminClient();

  const { data: account, error } = await admin
    .from("user_fixa_accounts")
    .upsert(
      {
        user_id: userId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select("balance")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return account.balance ?? 0;
}

export async function getAccountContext(): Promise<AccountContext> {
  const user = await requireCurrentUser();

  const [roles, fixaBalance] = await Promise.all([
    getUserRoles(user.id),
    ensureUserFixaAccount(user.id),
  ]);

  return {
    user,
    roles,
    fixaBalance,
  };
}

export function hasRole(roles: AccountRole[], role: AccountRole) {
  return roles.includes(role);
}