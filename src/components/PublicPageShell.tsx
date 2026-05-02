import type { ReactNode } from "react";
import type { Market } from "@/lib/geo";
import Footer from "@/components/Footer";

type PublicPageShellProps = {
  children: ReactNode;
  market?: Market;
};

export default function PublicPageShell({
  children,
  market,
}: PublicPageShellProps) {
  return (
    <>
      {children}
      <Footer market={market} />
    </>
  );
}