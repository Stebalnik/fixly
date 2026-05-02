import type { Market } from "@/lib/geo";
import { getMarketUrlPath } from "@/lib/geo";
import type { Category, Subcategory } from "@/lib/services";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type ServiceBreadcrumbParams = {
  market?: Market;
  category?: Category;
  subcategory?: Subcategory;
};

export function getServiceBreadcrumbs({
  market,
  category,
  subcategory,
}: ServiceBreadcrumbParams): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
  ];

  if (market) {
    items.push({
      label: `${market.city}, ${market.state}`,
      href: getMarketUrlPath(market),
    });
  }

  if (subcategory) {
    items.push({
      label: subcategory.parentSlug,
      href: market
        ? `${getMarketUrlPath(market)}/${subcategory.parentSlug}`
        : `/${subcategory.parentSlug}`,
    });

    items.push({
      label: subcategory.title,
    });

    return items;
  }

  if (category) {
    items.push({
      label: category.title,
    });
  }

  return items;
}