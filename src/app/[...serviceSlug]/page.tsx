export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getMarketBySlug } from "@/lib/geo";
import {
  getCategoryBySlug,
  getLegacyServiceRoute,
} from "@/lib/services";
import { subcategories } from "@/lib/services/subcategories";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getJsonLdScriptProps,
  getOrganizationJsonLd,
  getServiceJsonLd,
} from "@/lib/seo/schema";
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

function JsonLdScript({
  data,
}: {
  data: ReturnType<
    | typeof getOrganizationJsonLd
    | typeof getBreadcrumbJsonLd
    | typeof getFaqJsonLd
    | typeof getServiceJsonLd
  >;
}) {
  const props = getJsonLdScriptProps(data);

  if (!props) {
    return null;
  }

  return <script {...props} />;
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
  const canonicalPath = `/${path}`;
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

    const organizationJsonLd = getOrganizationJsonLd();
    const breadcrumbJsonLd = getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" },
      { name: category.title, url: canonicalPath },
    ]);
    const serviceJsonLd = getServiceJsonLd({
      market,
      category,
      url: canonicalPath,
    });
    const faqJsonLd = getFaqJsonLd({
      market,
      category,
    });

    return (
      <>
        <JsonLdScript data={organizationJsonLd} />
        <JsonLdScript data={breadcrumbJsonLd} />
        <JsonLdScript data={serviceJsonLd} />
        <JsonLdScript data={faqJsonLd} />
        <ServicePageTemplate category={category} market={market} />
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

    const organizationJsonLd = getOrganizationJsonLd();
    const breadcrumbJsonLd = getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" },
      ...(category
        ? [{ name: category.title, url: `/${category.slug}` }]
        : []),
      { name: subcategory.title, url: canonicalPath },
    ]);
    const serviceJsonLd = getServiceJsonLd({
      market,
      category: category ?? undefined,
      subcategory,
      url: canonicalPath,
    });
    const faqJsonLd = getFaqJsonLd({
      market,
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
          market={market}
          relatedSubcategories={relatedSubcategories}
        />
      </>
    );
  }

  notFound();
}