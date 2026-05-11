export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 86400;

import { notFound } from "next/navigation";
import { getMarketByGlobalPath } from "@/lib/geo";
import {
  getCategoryBySlug,
  getLegacyServiceRoute,
  getSubcategoryBySlug,
} from "@/lib/services";
import { getCategoryPageMeta, getSubcategoryPageMeta } from "@/lib/seo";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getJsonLdScriptProps,
  getOrganizationJsonLd,
  getServiceJsonLd,
  type JsonLdObject,
} from "@/lib/seo/schema";
import ServicePageTemplate from "@/features/services/ServicePageTemplate";

type PageProps = {
  params: Promise<{
    country: string;
    region: string;
    market: string;
    serviceSlug: string[];
  }>;
};

function JsonLdScript({ data }: { data: JsonLdObject | null }) {
  const props = getJsonLdScriptProps(data);

  if (!props) {
    return null;
  }

  return <script {...props} />;
}

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

    if (!category) {
      return {};
    }

    return getCategoryPageMeta(category, currentMarket, canonicalPath);
  }

  if (route.type === "subcategory" && route.subcategorySlug) {
    const subcategory = getSubcategoryBySlug(route.subcategorySlug);

    if (!subcategory) {
      return {};
    }

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

  const routePath = serviceSlug.join("/");
  const route = getLegacyServiceRoute(routePath);
  const canonicalPath = `/${country}/${region}/${market}/${routePath}`;
  const marketPath = `/${country}/${region}/${market}`;

  if (!currentMarket || !route) {
    notFound();
  }

  if (route.type === "category" && route.categorySlug) {
    const category = getCategoryBySlug(route.categorySlug);

    if (!category) {
      notFound();
    }

    const organizationJsonLd = getOrganizationJsonLd();
    const breadcrumbJsonLd = getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: currentMarket.city, url: marketPath },
      { name: category.title, url: canonicalPath },
    ]);
    const serviceJsonLd = getServiceJsonLd({
      market: currentMarket,
      category,
      url: canonicalPath,
    });
    const faqJsonLd = getFaqJsonLd({
      market: currentMarket,
      category,
    });

    return (
      <>
        <JsonLdScript data={organizationJsonLd} />
        <JsonLdScript data={breadcrumbJsonLd} />
        <JsonLdScript data={serviceJsonLd} />
        <JsonLdScript data={faqJsonLd} />
        <ServicePageTemplate category={category} market={currentMarket} />
      </>
    );
  }

  if (route.type === "subcategory" && route.subcategorySlug) {
    const subcategory = getSubcategoryBySlug(route.subcategorySlug);
    const category = subcategory
      ? getCategoryBySlug(subcategory.parentSlug)
      : null;

    if (!subcategory) {
      notFound();
    }

    const relatedSubcategories = subcategory.relatedSlugs
      .map((slug) => getSubcategoryBySlug(slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const categoryPath = category
      ? `/${country}/${region}/${market}/${category.slug}`
      : marketPath;

    const organizationJsonLd = getOrganizationJsonLd();
    const breadcrumbJsonLd = getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: currentMarket.city, url: marketPath },
      ...(category
        ? [{ name: category.title, url: categoryPath }]
        : []),
      { name: subcategory.title, url: canonicalPath },
    ]);
    const serviceJsonLd = getServiceJsonLd({
      market: currentMarket,
      category: category ?? undefined,
      subcategory,
      url: canonicalPath,
    });
    const faqJsonLd = getFaqJsonLd({
      market: currentMarket,
      category: category ?? undefined,
      subcategory,
    });

    return (
      <>
        <JsonLdScript data={organizationJsonLd} />
        <JsonLdScript data={breadcrumbJsonLd} />
        <JsonLdScript data={serviceJsonLd} />
        <JsonLdScript data={faqJsonLd} />
        <ServicePageTemplate
          subcategory={subcategory}
          market={currentMarket}
          relatedSubcategories={relatedSubcategories}
        />
      </>
    );
  }

  notFound();
}