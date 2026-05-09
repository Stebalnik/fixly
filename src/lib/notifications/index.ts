import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "new_message"
  | "request_unlocked_by_pro"
  | "pro_contact_unlocked"
  | string;

type NotificationMetadata = Record<string, unknown>;

type CreateNotificationArgs = {
  userId: string | null | undefined;
  type: NotificationType;
  title: string;
  body?: string;
  href?: string;
  metadata?: NotificationMetadata;
};

export async function createNotification({
  userId,
  type,
  title,
  body,
  href,
  metadata,
}: CreateNotificationArgs) {
  if (!userId) return;

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body: body ?? null,
    href: href ?? null,
    metadata: metadata ?? {},
  });

  if (error) {
    console.error("Failed to create notification", error);
  }
}

export async function markNotificationRead({
  notificationId,
  userId,
}: {
  notificationId: string;
  userId: string;
}) {
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("Failed to mark notification as read", error);
  }
}