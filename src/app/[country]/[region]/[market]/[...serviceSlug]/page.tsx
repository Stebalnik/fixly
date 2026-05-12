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
import { getServiceIntentBySlug } from "@/lib/seo/intents";
import { isIntentAllowedForService } from "@/lib/seo/intentMappings";
import { getIntentH1, getIntentPageMeta } from "@/lib/seo/intentMeta";
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

  if (!props) return null;

  return <script {...props} />;
}

function parseServiceIntentPath(serviceSlug: string[]) {
  const maybeIntentSlug = serviceSlug.at(-1);
  const intent = getServiceIntentBySlug(maybeIntentSlug);

  if (!intent) {
    return {
      routePath: serviceSlug.join("/"),
      intent: null,
    };
  }

  return {
    routePath: serviceSlug.slice(0, -1).join("/"),
    intent,
  };
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

  const parsed = parseServiceIntentPath(serviceSlug);
  const route = getLegacyServiceRoute(parsed.routePath);
  const canonicalPath = `/${country}/${region}/${market}/${serviceSlug.join("/")}`;

  if (!currentMarket || !route) return {};

  if (route.type === "category" && route.categorySlug) {
    const category = getCategoryBySlug(route.categorySlug);

    if (!category) return {};

    if (parsed.intent) {
      const isAllowed = isIntentAllowedForService({
        category,
        intentSlug: parsed.intent.slug,
      });

      if (!isAllowed) {
        return {
          robots: {
            index: false,
            follow: false,
          },
        };
      }

      return getIntentPageMeta({
        market: currentMarket,
        category,
        intent: parsed.intent,
        canonicalPath,
      });
    }

    return getCategoryPageMeta(category, currentMarket, canonicalPath);
  }

  if (route.type === "subcategory" && route.subcategorySlug) {
    const subcategory = getSubcategoryBySlug(route.subcategorySlug);
    const category = subcategory
      ? getCategoryBySlug(subcategory.parentSlug)
      : null;

    if (!subcategory || !category) return {};

    if (parsed.intent) {
      const isAllowed = isIntentAllowedForService({
        category,
        subcategory,
        intentSlug: parsed.intent.slug,
      });

      if (!isAllowed) {
        return {
          robots: {
            index: false,
            follow: false,
          },
        };
      }

      return getIntentPageMeta({
        market: currentMarket,
        category,
        subcategory,
        intent: parsed.intent,
        canonicalPath,
      });
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

  const parsed = parseServiceIntentPath(serviceSlug);
  const route = getLegacyServiceRoute(parsed.routePath);
  const canonicalPath = `/${country}/${region}/${market}/${serviceSlug.join("/")}`;
  const marketPath = `/${country}/${region}/${market}`;

  if (!currentMarket || !route) {
    notFound();
  }

  if (route.type === "category" && route.categorySlug) {
    const category = getCategoryBySlug(route.categorySlug);

    if (!category) {
      notFound();
    }

    if (
      parsed.intent &&
      !isIntentAllowedForService({
        category,
        intentSlug: parsed.intent.slug,
      })
    ) {
      notFound();
    }

    const categoryPath = `/${country}/${region}/${market}/${category.slug}`;

    const organizationJsonLd = getOrganizationJsonLd();
    const breadcrumbJsonLd = getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: currentMarket.city, url: marketPath },
      { name: category.title, url: categoryPath },
      ...(parsed.intent
        ? [{ name: parsed.intent.title, url: canonicalPath }]
        : []),
    ]);
    const serviceJsonLd = getServiceJsonLd({
      market: currentMarket,
      category,
       intent: parsed.intent ?? undefined,
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
        <ServicePageTemplate
          category={category}
          market={currentMarket}
          intent={parsed.intent ?? undefined}
          intentH1={
            parsed.intent
              ? getIntentH1({
                  market: currentMarket,
                  category,
                  intent: parsed.intent,
                })
              : undefined
          }
        />
      </>
    );
  }

  if (route.type === "subcategory" && route.subcategorySlug) {
    const subcategory = getSubcategoryBySlug(route.subcategorySlug);
    const category = subcategory
      ? getCategoryBySlug(subcategory.parentSlug)
      : null;

    if (!subcategory || !category) {
      notFound();
    }

    if (
      parsed.intent &&
      !isIntentAllowedForService({
        category,
        subcategory,
        intentSlug: parsed.intent.slug,
      })
    ) {
      notFound();
    }

    const relatedSubcategories = subcategory.relatedSlugs
      .map((slug) => getSubcategoryBySlug(slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const categoryPath = `/${country}/${region}/${market}/${category.slug}`;
    const subcategoryPath = `/${country}/${region}/${market}/${parsed.routePath}`;

    const organizationJsonLd = getOrganizationJsonLd();
    const breadcrumbJsonLd = getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: currentMarket.city, url: marketPath },
      { name: category.title, url: categoryPath },
      { name: subcategory.title, url: subcategoryPath },
      ...(parsed.intent
        ? [{ name: parsed.intent.title, url: canonicalPath }]
        : []),
    ]);
    const serviceJsonLd = getServiceJsonLd({
      market: currentMarket,
      category,
      subcategory, 
      intent: parsed.intent ?? undefined,
      url: canonicalPath,
    });
    const faqJsonLd = getFaqJsonLd({
      market: currentMarket,
      category,
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
          intent={parsed.intent ?? undefined}
          intentH1={
            parsed.intent
              ? getIntentH1({
                  market: currentMarket,
                  category,
                  subcategory,
                  intent: parsed.intent,
                })
              : undefined
          }
        />
      </>
    );
  }

  notFound();
}