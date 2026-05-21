import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

export const dynamic = "force-dynamic";

const BASE_URL = "https://fixly.work";

type GeneratedPageSitemapRow = {
  target_url: string | null;
  updated_at: string | null;
  published_at: string | null;
};

export async function GET() {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("ai_generated_pages")
    .select("target_url, updated_at, published_at")
    .eq("status", "published")
    .eq("quality_status", "approved")
    .order("published_at", { ascending: false })
    .limit(5000);

  if (error) {
    return new Response("Unable to load generated pages sitemap", {
      status: 500,
    });
  }

  const urls = ((data ?? []) as GeneratedPageSitemapRow[])
    .filter((page) => page.target_url?.startsWith("/"))
    .map((page) => ({
      url: `${BASE_URL}${page.target_url}`,
      lastModified: page.updated_at
        ? new Date(page.updated_at)
        : page.published_at
          ? new Date(page.published_at)
          : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return new Response(buildUrlSet(urls), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
