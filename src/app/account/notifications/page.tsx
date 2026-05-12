export const dynamic = "force-dynamic";

import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { getAccountContext } from "@/lib/auth/account";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Notifications | Fixly",
};

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

function formatNotificationDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNotificationBadge(type: string) {
  if (type === "new_message") return "Message";
  if (type === "request_unlocked_by_pro") return "Lead opened";
  if (type === "pro_contact_unlocked") return "Contact opened";
  if (type === "request_sold_out") return "Sold out";
  if (type === "request_archived") return "Archived";
  if (type === "low_fixa_balance") return "FIXA";

  return "Update";
}

export default async function AccountNotificationsPage() {
  const account = await getAccountContext();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("notifications")
    .select("id, type, title, body, href, read_at, created_at, metadata")
    .eq("user_id", account.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const notifications = (data ?? []) as NotificationItem[];

  const unreadNotificationIds = notifications
    .filter((notification) => !notification.read_at)
    .map((notification) => notification.id);

  if (unreadNotificationIds.length > 0) {
    const { error: readError } = await admin
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
      })
      .eq("user_id", account.user.id)
      .in("id", unreadNotificationIds)
      .is("read_at", null);

    if (readError) {
      console.error("Failed to mark notifications as read", readError);
    }
  }

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container">
          <div className="flex flex-between gap-md">
            <div>
              <p className="eyebrow">Fixly account</p>
              <h1>Notifications</h1>
              <p className="hero-text">
                Updates about requests, leads, messages, FIXAs, and marketplace
                activity.
              </p>
            </div>

            <Link href="/account" className="button button-secondary">
              Back to account
            </Link>
          </div>

          <div className="card notifications-card">
            {notifications.length === 0 ? (
              <div className="notifications-empty">
                <h2>No notifications yet</h2>
                <p>
                  Important updates about your Fixly activity will appear here.
                </p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => {
                  const wasUnread = !notification.read_at;

                  const content = (
                    <>
                      <div>
                        <div className="flex gap-sm">
                          <span className="badge">
                            {getNotificationBadge(notification.type)}
                          </span>

                          {wasUnread ? (
                            <span className="badge badge-primary">New</span>
                          ) : null}
                        </div>

                        <h3>{notification.title}</h3>

                        {notification.body ? (
                          <p className="text-muted">{notification.body}</p>
                        ) : null}

                        <p className="text-muted">
                          {formatNotificationDate(notification.created_at)}
                        </p>
                      </div>

                      {notification.href ? (
                        <span className="button button-secondary">
                          Open
                        </span>
                      ) : (
                        <span className="badge">Read</span>
                      )}
                    </>
                  );

                  if (notification.href) {
                    return (
                      <Link
                        key={notification.id}
                        href={notification.href}
                        className={
                          wasUnread
                            ? "notification-item notification-item-unread"
                            : "notification-item"
                        }
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={notification.id}
                      className={
                        wasUnread
                          ? "notification-item notification-item-unread"
                          : "notification-item"
                      }
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}