import { notFound } from "next/navigation";
import {
  getLegacyServiceRoute,
  getCategoryBySlug,
  getSubcategoryBySlug,
} from "@/lib/services";
import { getMarketByGlobalPath } from "@/lib/geo";
import { getCategoryPageMeta, getSubcategoryPageMeta } from "@/lib/seo";
import ServicePageTemplate from "@/features/services/ServicePageTemplate";

type PageProps = {
  params: Promise<{
    country: string;
    region: string;
    market: string;
    serviceSlug: string[];
  }>;
};

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps) {
  const { country, region, market, serviceSlug } = await params;

  const currentMarket = getMarketByGlobalPath({
    countryCode: country,
    region,
    market,
  });

  const route = getLegacyServiceRoute(serviceSlug.join("/"));
  const canonicalPath = `/${country}/${region}/${market}/${serviceSlug.join("/")}`;

  if (!currentMarket || !route) {
    return {};
  }

  if (route.type === "category" && route.categorySlug) {
    const category = getCategoryBySlug(route.categorySlug);
    if (!category) return {};

    return getCategoryPageMeta(category, currentMarket, canonicalPath);
  }

  if (route.type === "subcategory" && route.subcategorySlug) {
    const subcategory = getSubcategoryBySlug(route.subcategorySlug);
    if (!subcategory) return {};

    return getSubcategoryPageMeta(subcategory, currentMarket, canonicalPath);
  }

  return {};
}

export default async function GlobalServicePage({ params }: PageProps) {
  const { country, region, market, serviceSlug } = await params;

  const currentMarket = getMarketByGlobalPath({
    countryCode: country,
    region,
    market,
  });

  const route = getLegacyServiceRoute(serviceSlug.join("/"));

  if (!currentMarket || !route) {
    notFound();
  }

  if (route.type === "category" && route.categorySlug) {
    const category = getCategoryBySlug(route.categorySlug);

    if (!category) {
      notFound();
    }

    return <ServicePageTemplate category={category} market={currentMarket} />;
  }

  if (route.type === "subcategory" && route.subcategorySlug) {
    const subcategory = getSubcategoryBySlug(route.subcategorySlug);

    if (!subcategory) {
      notFound();
    }

    const relatedSubcategories = subcategory.relatedSlugs
      .map((slug) => getSubcategoryBySlug(slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return (
      <ServicePageTemplate
        subcategory={subcategory}
        market={currentMarket}
        relatedSubcategories={relatedSubcategories}
      />
    );
  }

  notFound();
}