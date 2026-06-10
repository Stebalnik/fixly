export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMarketByGlobalPath } from "@/lib/geo";
import {
  getCategoryBySlug,
  getLegacyServiceRoute,
  getSubcategoryBySlug,
} from "@/lib/services";
import { getCategoryPageMeta, getSubcategoryPageMeta } from "@/lib/seo";
import {
  getIntentH1,
  getIntentPageMeta,
  isIntentAllowedForService,
  parseServiceIntentPath,
} from "@/lib/seo/intents";
import {
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getJsonLdScriptProps,
  getOrganizationJsonLd,
  getServiceJsonLd,
  type JsonLdObject,
} from "@/lib/seo/schema";
import ServicePageTemplate from "@/features/services/ServicePageTemplate";
import { AiGeneratedSeoPage } from "@/features/ai-pages/AiGeneratedSeoPage";

type PageProps = {
  params: Promise<{
    country: string;
    region: string;
    market: string;
    serviceSlug: string[];
  }>;
};

type PublishedAiPage = {
  target_url: string;
  title: string;
  meta_description: string | null;
  h1: string | null;
  intro: string | null;
  sections:
    | Array<{
        heading?: string;
        body?: string;
      }>
    | null;
  faqs:
    | Array<{
        question?: string;
        answer?: string;
      }>
    | null;
  internal_links:
    | Array<{
        label?: string;
        href?: string;
      }>
    | null;
  cta: string | null;
};

function JsonLdScript({ data }: { data: JsonLdObject | null }) {
  const props = getJsonLdScriptProps(data);

  if (!props) return null;

  return <script {...props} />;
}

async function getPublishedAiPage(
  targetUrl: string
): Promise<PublishedAiPage | null> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("ai_generated_pages")
    .select(
      "target_url, title, meta_description, h1, intro, sections, faqs, internal_links, cta"
    )
    .eq("target_url", targetUrl)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to load AI generated page", error);
    return null;
  }

  return data as PublishedAiPage | null;
}

export async function generateMetadata({ params }: PageProps) {
  const { country, region, market, serviceSlug } = await params;

  const canonicalPath = `/${country}/${region}/${market}/${serviceSlug.join(
    "/"
  )}`;

  const currentMarket = getMarketByGlobalPath({
    countryCode: country,
    region,
    market,
  });

  const parsed = parseServiceIntentPath(serviceSlug);
  const route = getLegacyServiceRoute(parsed.routePath);

  if (!currentMarket) return {};

  if (!route) {
    const aiPage = await getPublishedAiPage(canonicalPath);

    if (aiPage) {
      return {
        title: aiPage.title,
        description: aiPage.meta_description ?? undefined,
        alternates: {
          canonical: canonicalPath,
        },
      };
    }

    return {};
  }

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
  const canonicalPath = `/${country}/${region}/${market}/${serviceSlug.join(
    "/"
  )}`;
  const marketPath = `/${country}/${region}/${market}`;

  if (!currentMarket) {
    notFound();
  }

  if (!route) {
    const aiPage = await getPublishedAiPage(canonicalPath);

    if (aiPage) {
      return <AiGeneratedSeoPage page={aiPage} />;
    }

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
      const aiPage = await getPublishedAiPage(canonicalPath);

      if (aiPage) {
        return <AiGeneratedSeoPage page={aiPage} />;
      }

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
      intent: parsed.intent ?? undefined,
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
      const aiPage = await getPublishedAiPage(canonicalPath);

      if (aiPage) {
        return <AiGeneratedSeoPage page={aiPage} />;
      }

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
      intent: parsed.intent ?? undefined,
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
