import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "new_message"
  | "request_unlocked_by_pro"
  | "pro_contact_unlocked"
  | "request_archived"
  | "request_sold_out"
  | "low_fixa_balance"
  | string;

export type NotificationMetadata = Record<string, unknown>;

type CreateNotificationArgs = {
  userId: string | null | undefined;
  type: NotificationType;
  title: string;
  body?: string;
  href?: string;
  metadata?: NotificationMetadata;
};

type MarkNotificationReadArgs = {
  notificationId: string;
  userId: string;
};

export async function createNotification({
  userId,
  type,
  title,
  body,
  href,
  metadata,
}: CreateNotificationArgs) {
  if (!userId) {
    return;
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body: body?.trim() || null,
    href: href?.trim() || null,
    metadata: metadata ?? {},
  });

  if (error) {
    console.error("Failed to create notification", {
      userId,
      type,
      title,
      error,
    });
  }
}

export async function markNotificationRead({
  notificationId,
  userId,
}: MarkNotificationReadArgs) {
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("Failed to mark notification as read", {
      notificationId,
      userId,
      error,
    });
  }
}