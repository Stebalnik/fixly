import { notFound } from "next/navigation";
import { getLegacyServiceRoute, getCategoryBySlug } from "@/lib/services";
import { subcategories } from "@/lib/services/subcategories";
import { getMarketBySlug } from "@/lib/geo";
import { getCategoryPageMeta, getSubcategoryPageMeta } from "@/lib/seo";
import ServicePageTemplate from "@/features/services/ServicePageTemplate";

type PageProps = {
  params: Promise<{
    serviceSlug: string[];
  }>;
};

function getDefaultMarket() {
  return getMarketBySlug("atlanta-ga");
}

function getSubcategoryBySlug(slug: string) {
  return Object.values(subcategories).find((subcategory) => {
    return subcategory.slug === slug;
  });
}

export async function generateMetadata({ params }: PageProps) {
  const { serviceSlug } = await params;
  const path = serviceSlug.join("/");
  const canonicalPath = `/${path}`;
  const route = getLegacyServiceRoute(path);
  const market = getDefaultMarket();

  if (!route || !market) {
    return {};
  }

  if (route.type === "category" && route.categorySlug) {
    const category = getCategoryBySlug(route.categorySlug);

    if (!category) {
      return {};
    }

    return getCategoryPageMeta(category, market, canonicalPath);
  }

  if (route.type === "subcategory" && route.subcategorySlug) {
    const subcategory = getSubcategoryBySlug(route.subcategorySlug);

    if (!subcategory) {
      return {};
    }

    return getSubcategoryPageMeta(subcategory, market, canonicalPath);
  }

  return {
    title: route.title ?? "Fixly Services",
  };
}

export default async function LegacyServicePage({ params }: PageProps) {
  const { serviceSlug } = await params;
  const path = serviceSlug.join("/");
  const route = getLegacyServiceRoute(path);
  const market = getDefaultMarket();

  if (!route || !market) {
    notFound();
  }

  if (route.type === "category" && route.categorySlug) {
    const category = getCategoryBySlug(route.categorySlug);

    if (!category) {
      notFound();
    }

    return <ServicePageTemplate category={category} market={market} />;
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
        market={market}
        relatedSubcategories={relatedSubcategories}
      />
    );
  }

  notFound();
}