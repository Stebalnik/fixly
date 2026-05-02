import Link from "next/link";
import type { Market } from "@/lib/geo";
import { getNearbyMarkets, getMarketUrlPath } from "@/lib/geo";
import { categories } from "@/lib/services/categories";

type FooterProps = {
  market?: Market;
};

export default function Footer({ market }: FooterProps) {
  const nearbyMarkets = market ? getNearbyMarkets(market.slug) : [];
  const popularCategories = Object.values(categories).slice(0, 6);

  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div>
          <h2 className="site-footer-title">Fixly</h2>
          <p className="site-footer-text">
            Find local home service pros and post requests for your next project.
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

              {nearbyMarkets.map((item) => (
                <li key={item.slug}>
                  <Link href={getMarketUrlPath(item)}>
                    {item.city}, {item.state}
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
        </div>

        <div>
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
      </div>
    </footer>
  );
}