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
};

export default async function AccountNotificationsPage() {
  const account = await getAccountContext();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("notifications")
    .select("id, type, title, body, href, read_at, created_at")
    .eq("user_id", account.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const notifications = (data ?? []) as NotificationItem[];

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
                  const content = (
                    <>
                      <div>
                        <h3>{notification.title}</h3>

                        {notification.body ? (
                          <p className="text-muted">{notification.body}</p>
                        ) : null}

                        <p className="text-muted">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>

                      {!notification.read_at ? (
                        <span className="badge badge-primary">New</span>
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
                          notification.read_at
                            ? "notification-item"
                            : "notification-item notification-item-unread"
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
                        notification.read_at
                          ? "notification-item"
                          : "notification-item notification-item-unread"
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