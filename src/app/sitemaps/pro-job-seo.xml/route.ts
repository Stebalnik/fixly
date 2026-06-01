import { buildProJobSeoTargets, getProJobSeoUrl } from "@/lib/pro/jobSeo";
import { buildUrlSet } from "@/lib/seo/sitemapXml";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ProJobSeoSitemapRow = {
  public_slug: string;
  category_slug: string;
  subcategory_slug: string | null;
  city: string;
  state: string;
  public_description: string;
  created_at: string;
  updated_at: string | null;
};

export async function GET() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("service_requests")
    .select(
      "public_slug, category_slug, subcategory_slug, city, state, public_description, created_at, updated_at"
    )
    .eq("status", "open")
    .eq("lead_status", "available")
    .not("public_slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return new Response("Unable to load pro job SEO sitemap", { status: 500 });
  }

  const targets = buildProJobSeoTargets((data ?? []) as ProJobSeoSitemapRow[]);

  const xml = buildUrlSet(
    targets.map((target) => ({
      url: getProJobSeoUrl(target.slug),
      lastModified: target.lastModified ?? new Date(),
      changeFrequency: "daily",
      priority:
        target.kind === "subcategory_city"
          ? 0.72
          : target.kind === "category_city"
            ? 0.7
            : 0.66,
    }))
  );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
