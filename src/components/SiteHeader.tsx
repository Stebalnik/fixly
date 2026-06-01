import Image from "next/image";
import Link from "next/link";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import Breadcrumbs from "@/components/Breadcrumbs";
import HeaderAuthMenu from "@/components/HeaderAuthMenu";
import { getMainSiteUrl, getMaterialsSiteUrl } from "@/lib/siteUrls";

type SiteHeaderProps = {
  breadcrumbs?: BreadcrumbItem[];
};

export default function SiteHeader({ breadcrumbs }: SiteHeaderProps) {
  const homeUrl = getMainSiteUrl("/");
  const servicesUrl = getMainSiteUrl("/services");
  const bookUrl = getMainSiteUrl("/book");
  const materialsUrl = getMaterialsSiteUrl("/");

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href={homeUrl} className="site-header-logo" aria-label="Fixly home">
          <Image src="/logo.png" alt="Fixly" width={132} height={42} priority />
        </Link>

        <nav className="site-header-nav" aria-label="Main navigation">
          <Link href={servicesUrl}>Services</Link>
          <Link href={bookUrl}>Request service</Link>
          <Link href={materialsUrl}>Materials</Link>
        </nav>

        <div className="site-header-actions">
          <HeaderAuthMenu
            accountHref={getMainSiteUrl("/account")}
            balanceHref={getMainSiteUrl("/account/fixa")}
            loginHref={getMainSiteUrl("/login")}
            notificationsHref={getMainSiteUrl("/account/notifications")}
          />

          <Link href={bookUrl} className="button button-primary">
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
