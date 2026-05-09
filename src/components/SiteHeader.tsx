import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import Breadcrumbs from "@/components/Breadcrumbs";
import LogoutButton from "@/components/LogoutButton";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SiteHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];
};

type HeaderAuthState = {
  isLoggedIn: boolean;
  fixaBalance: number | null;
  unreadNotifications: number;
};

async function getHeaderAuthState(): Promise<HeaderAuthState> {
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

  if (!user) {
    return {
      isLoggedIn: false,
      fixaBalance: null,
      unreadNotifications: 0,
    };
  }

  const admin = createSupabaseAdminClient();

  const [{ data: fixaAccount }, { count: unreadNotifications }] =
    await Promise.all([
      admin
        .from("user_fixa_accounts")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle(),

      admin
        .from("notifications")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .is("read_at", null),
    ]);

  return {
    isLoggedIn: true,
    fixaBalance: fixaAccount?.balance ?? 0,
    unreadNotifications: unreadNotifications ?? 0,
  };
}

export default async function SiteHeader({ breadcrumbs }: SiteHeaderProps) {
  const authState = await getHeaderAuthState();
  const hasUnreadNotifications = authState.unreadNotifications > 0;

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-header-logo" aria-label="Fixly home">
          <Image src="/logo.png" alt="Fixly" width={132} height={42} priority />
        </Link>

        <nav className="site-header-nav" aria-label="Main navigation">
          <Link href="/services">Services</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/requests">Browse jobs</Link>
        </nav>

        <div className="site-header-actions">
          {authState.isLoggedIn ? (
            <>
              <Link
                href="/account/fixa"
                className="site-header-balance"
                aria-label={`FIXA balance: ${(
                  authState.fixaBalance ?? 0
                ).toLocaleString()} FIXAs`}
              >
                <Image
                  src="/fixacoin.png"
                  alt="FIXA"
                  width={18}
                  height={18}
                  className="site-header-balance-icon"
                />

                <span>{(authState.fixaBalance ?? 0).toLocaleString()}</span>
              </Link>

              <Link
                href={
                  hasUnreadNotifications
                    ? "/account/notifications"
                    : "/account"
                }
                className="site-header-account-button"
                aria-label={
                  hasUnreadNotifications
                    ? `Account, ${authState.unreadNotifications} unread notifications`
                    : "Account"
                }
              >
                <span className="site-header-account-label">Account</span>

                {hasUnreadNotifications ? (
                  <span className="site-header-notification-badge">
                    {authState.unreadNotifications > 99
                      ? "99+"
                      : authState.unreadNotifications}
                  </span>
                ) : null}
              </Link>

              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="button button-secondary">
              Login
            </Link>
          )}

          <Link href="/book" className="button button-primary">
            Request service
          </Link>
        </div>
      </div>

      {breadcrumbs && breadcrumbs.length > 0 ? (
        <div className="site-header-context">
          <div className="container">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      ) : null}
    </header>
  );
}