import Image from "next/image";
import Link from "next/link";
import type { Market } from "@/lib/geo";
import { getNearbyMarkets, getMarketUrlPath } from "@/lib/geo";
import { categories } from "@/lib/services/categories";

type FooterProps = {
  market?: Market;
};

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Pro Terms", href: "/pro-terms" },
  { label: "Lead Policy", href: "/lead-policy" },
  { label: "Safety Policy", href: "/safety-policy" },
  { label: "Accessibility", href: "/accessibility" },
];

export default function Footer({ market }: FooterProps) {
  const nearbyMarkets = market ? getNearbyMarkets(market.slug) : [];
  const popularCategories = Object.values(categories).slice(0, 6);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div>
          <Link href="/" className="site-footer-logo" aria-label="Fixly home">
            <Image
              src="/logo.png"
              alt="Fixly"
              width={140}
              height={44}
            />
          </Link>

          <p className="site-footer-text">
            Find local home service pros and post requests for your next project.
          </p>

          <p className="site-footer-text">
            © {year} Fixly. All rights reserved.
          </p>
        </div>

        <div>
          <h3>Popular services</h3>
          <ul className="site-footer-list">
            {popularCategories.map((category) => (
              <li key={category.slug}>
                <Link href={`/${category.slug}`}>{category.shortTitle}</Link>
              </li>
            ))}
          </ul>
        </div>

        {market && (
          <div>
            <h3>Service areas near {market.city}</h3>
            <ul className="site-footer-list">
              <li>
                <Link href={getMarketUrlPath(market)}>
                  {market.city}, {market.state}
                </Link>
              </li>

              {nearbyMarkets.map((nearbyMarket) => (
                <li key={nearbyMarket.slug}>
                  <Link href={getMarketUrlPath(nearbyMarket)}>
                    {nearbyMarket.city}, {nearbyMarket.state}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3>For customers</h3>
          <ul className="site-footer-list">
            <li>
              <Link href="/book">Request service</Link>
            </li>
            <li>
              <Link href="/services">Browse services</Link>
            </li>
            <li>
              <Link href="/requests">Public requests</Link>
            </li>
          </ul>
        

        
          <h3>For pros</h3>
          <ul className="site-footer-list">
            <li>
              <Link href="/pro">Join as a pro</Link>
            </li>
            <li>
              <Link href="/requests">View requests</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Legal</h3>
          <ul className="site-footer-list">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}