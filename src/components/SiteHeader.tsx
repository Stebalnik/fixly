import Image from "next/image";
import Link from "next/link";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import Breadcrumbs from "@/components/Breadcrumbs";
import HeaderAuthMenu from "@/components/HeaderAuthMenu";

type SiteHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];
};

export default function SiteHeader({ breadcrumbs }: SiteHeaderProps) {
  const materialsUrl =
    process.env.NEXT_PUBLIC_MATERIALS_SITE_URL ??
    "https://materials.fixly.work";

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-header-logo" aria-label="Fixly home">
          <Image src="/logo.png" alt="Fixly" width={132} height={42} priority />
        </Link>

        <nav className="site-header-nav" aria-label="Main navigation">
          <Link href="/services">Services</Link>
          <Link href="/book">Request service</Link>
          <Link href={materialsUrl}>Materials</Link>
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
