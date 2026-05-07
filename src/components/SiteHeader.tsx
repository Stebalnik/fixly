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
    };
  }

  const admin = createSupabaseAdminClient();

  const { data: fixaAccount } = await admin
    .from("user_fixa_accounts")
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    isLoggedIn: true,
    fixaBalance: fixaAccount?.balance ?? 0,
  };
}

export default async function SiteHeader({
  breadcrumbs,
}: SiteHeaderProps) {
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
          {authState.isLoggedIn ? (
            <>
              <Link href="/account/fixa" className="site-header-balance">
                <Image
                  src="/fixacoin.png"
                  alt="FIXA"
                  width={18}
                  height={18}
                  className="site-header-balance-icon"
                />

                <span>{(authState.fixaBalance ?? 0).toLocaleString()}</span>
              </Link>

              <Link href="/account" className="button button-secondary">
                Account
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