import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import Breadcrumbs from "@/components/Breadcrumbs";

type SiteHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];
};

async function getProHeaderBalance() {
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
    return null;
  }

  const { data: profile } = await supabase
    .from("pro_profiles")
    .select("user_id, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const { data: creditAccount } = await supabase
    .from("pro_credit_accounts")
    .select("balance")
    .eq("pro_user_id", user.id)
    .maybeSingle();

  return creditAccount?.balance ?? 0;
}

export default async function SiteHeader({ breadcrumbs }: SiteHeaderProps) {
  const proBalance = await getProHeaderBalance();

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
          {proBalance !== null ? (
            <>
              <Link href="/pro/credits" className="site-header-balance">
                <Image
                  src="/fixacoin.png"
                  alt="FIXA"
                  width={18}
                  height={18}
                  className="site-header-balance-icon"
                />
                <span>{proBalance.toLocaleString()}</span>
              </Link>

              <Link href="/pro" className="button button-secondary">
                Pro dashboard
              </Link>
            </>
          ) : null}

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