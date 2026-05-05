import type { ReactNode } from "react";
import type { Market } from "@/lib/geo";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";

type PublicPageShellProps = {
  children: ReactNode;
  market?: Market;
  breadcrumbs?: BreadcrumbItem[];
};

export default function PublicPageShell({
  children,
  market,
  breadcrumbs,
}: PublicPageShellProps) {
  return (
    <>
      <SiteHeader breadcrumbs={breadcrumbs} />
      {children}
      <Footer market={market} />
    </>
  );
}