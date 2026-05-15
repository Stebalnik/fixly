import Image from "next/image";
import Link from "next/link";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import Breadcrumbs from "@/components/Breadcrumbs";
import HeaderAuthMenu from "@/components/HeaderAuthMenu";
import { getRequestsPath } from "@/lib/routes/marketplace";

type SiteHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];
};

export default function SiteHeader({ breadcrumbs }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-header-logo" aria-label="Fixly home">
          <Image src="/logo.png" alt="Fixly" width={132} height={42} priority />
        </Link>

        <nav className="site-header-nav" aria-label="Main navigation">
          <Link href="/services">Services</Link>
          <Link href={getRequestsPath("us")}>Browse jobs</Link>
          <Link href="/pro/signup">For pros</Link>
        </nav>

        <div className="site-header-actions">
          <HeaderAuthMenu />

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