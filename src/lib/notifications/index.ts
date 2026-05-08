import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CreateNotificationArgs = {
  userId: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
};

export async function createNotification({
  userId,
  type,
  title,
  body,
  href,
}: CreateNotificationArgs) {
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      body: body ?? null,
      href: href ?? null,
    });

  if (error) {
    console.error("Failed to create notification", error);
  }
}

export async function markNotificationRead(notificationId: string) {
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (error) {
    console.error("Failed to mark notification as read", error);
  }
}