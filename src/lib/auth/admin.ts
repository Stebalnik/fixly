import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function requireAdminUser() {
  const user = await requireCurrentUser();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to check admin user", error);
    redirect("/account");
  }

  if (!data) {
    redirect("/account");
  }

  return {
    user,
    adminRole: data.role as string,
  };
}