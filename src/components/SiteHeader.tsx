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
  isPro: boolean;
  proBalance: number | null;
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
      isPro: false,
      proBalance: null,
    };
  }

  const admin = createSupabaseAdminClient();

  const { data: profile } = await admin
    .from("pro_profiles")
    .select("user_id, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!profile) {
    return {
      isLoggedIn: true,
      isPro: false,
      proBalance: null,
    };
  }

  const { data: creditAccount } = await admin
    .from("pro_credit_accounts")
    .select("balance")
    .eq("pro_user_id", user.id)
    .maybeSingle();

  return {
    isLoggedIn: true,
    isPro: true,
    proBalance: creditAccount?.balance ?? 0,
  };
}

export default async function SiteHeader({ breadcrumbs }: SiteHeaderProps) {
  const authState = await getHeaderAuthState();

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
          {authState.isPro && authState.proBalance !== null ? (
            <>
              <Link href="/pro/credits" className="site-header-balance">
                <Image
                  src="/fixacoin.png"
                  alt="FIXA"
                  width={18}
                  height={18}
                  className="site-header-balance-icon"
                />
                <span>{authState.proBalance.toLocaleString()}</span>
              </Link>

              <Link href="/pro" className="button button-secondary">
                Pro dashboard
              </Link>

              <LogoutButton />
            </>
          ) : null}

          {!authState.isLoggedIn ? (
            <Link href="/pro/login?next=/pro" className="button button-secondary">
              Pro login
            </Link>
          ) : null}

          {authState.isLoggedIn && !authState.isPro ? <LogoutButton /> : null}

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