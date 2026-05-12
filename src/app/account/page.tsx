export const dynamic = "force-dynamic";

import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { getAccountContext, hasRole } from "@/lib/auth/account";

export const metadata = {
  title: "Account | Fixly",
};

export default async function AccountPage() {
  const account = await getAccountContext();

  const isCustomer = hasRole(account.roles, "customer");
  const isPro = hasRole(account.roles, "pro");
  const hasUnreadNotifications = account.unreadNotifications > 0;

  return (
    <PublicPageShell>
      <main className="section">
        <div className="container">
          <div className="flex flex-between gap-md">
            <div>
              <p className="eyebrow">Fixly account</p>

              <h1>Account dashboard</h1>

              <p className="hero-text">
                Manage your requests, pro leads, FIXA balance, messages, and
                notifications from one account.
              </p>
            </div>

            <Link href="/book" className="button button-primary">
              Request service
            </Link>
          </div>

          <div className="grid-3 account-summary-grid">
            <div className="card">
              <p className="eyebrow">FIXA balance</p>

              <h2>{account.fixaBalance.toLocaleString()} FIXAs</h2>

              <p>Use FIXAs to unlock contacts, leads, and platform actions.</p>

              <div className="flex gap-sm">
                <Link href="/account/fixa" className="button button-secondary">
                  Manage FIXAs
                </Link>

                <Link
                  href="/account/fixa/buy"
                  className="button button-primary"
                >
                  Buy FIXAs
                </Link>
              </div>
            </div>

            <div className="card">
              <p className="eyebrow">Roles</p>

              <h2>
                {account.roles.length > 0
                  ? account.roles.join(" + ")
                  : "No role yet"}
              </h2>

              <p>
                Your Fixly account can work as customer, pro, or both without
                logging out.
              </p>

              <div className="flex gap-sm">
                {isCustomer ? (
                  <Link href="/customer" className="button button-secondary">
                    Customer dashboard
                  </Link>
                ) : null}

                {isPro ? (
                  <Link href="/pro" className="button button-secondary">
                    Pro dashboard
                  </Link>
                ) : null}
              </div>
            </div>

            <Link
              href="/account/notifications"
              className={
                hasUnreadNotifications
                  ? "card card-hover account-notifications-card account-notifications-card-unread"
                  : "card card-hover account-notifications-card"
              }
            >
              <p className="eyebrow">Notifications</p>

              <div className="account-notifications-header">
                <h2>Updates</h2>

                {hasUnreadNotifications ? (
                  <span className="account-notifications-badge">
                    {account.unreadNotifications > 99
                      ? "99+"
                      : account.unreadNotifications}
                  </span>
                ) : (
                  <span className="badge">0 unread</span>
                )}
              </div>

              <p className="text-muted">
                View messages, lead updates, payment activity, and marketplace
                alerts.
              </p>
            </Link>
          </div>

          <div className="grid-3 account-summary-grid">
            <Link href="/account/messages" className="card card-hover">
              <p className="eyebrow">Messages</p>

              <h2>Inbox</h2>

              <p className="text-muted">
                View and reply to conversations between customers and pros.
              </p>
            </Link>

            <Link href="/account/fixa/history" className="card card-hover">
              <p className="eyebrow">Transactions</p>

              <h2>FIXA history</h2>

              <p className="text-muted">
                Review purchases, lead unlocks, contact unlocks, and balance
                changes.
              </p>
            </Link>

            <Link href="/requests" className="card card-hover">
              <p className="eyebrow">Marketplace</p>

              <h2>Browse jobs</h2>

              <p className="text-muted">
                Explore open customer requests and available service leads.
              </p>
            </Link>
          </div>

          <div className="grid-2 account-role-grid">
            {isCustomer ? (
              <div className="card">
                <p className="eyebrow">Customer area</p>

                <h2>My service requests</h2>

                <p>
                  Track requests, manage open jobs, archive completed work, and
                  review pro responses.
                </p>

                <Link href="/customer" className="button button-primary">
                  Go to customer dashboard
                </Link>
              </div>
            ) : (
              <div className="card">
                <p className="eyebrow">Customer area</p>

                <h2>Create your first request</h2>

                <p>Submit a service request and connect with local pros.</p>

                <Link href="/book" className="button button-primary">
                  Request service
                </Link>
              </div>
            )}

            {isPro ? (
              <div className="card">
                <p className="eyebrow">Pro area</p>

                <h2>Lead dashboard</h2>

                <p>
                  Browse open requests, unlock leads, and manage purchased
                  customer contacts.
                </p>

                <Link href="/pro" className="button button-primary">
                  Go to pro dashboard
                </Link>
              </div>
            ) : (
              <div className="card">
                <p className="eyebrow">Pro area</p>

                <h2>Join as a pro</h2>

                <p>
                  Create a pro profile to unlock leads and receive service
                  requests from customers.
                </p>

                <Link href="/pro/onboarding" className="button button-primary">
                  Join as pro
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}