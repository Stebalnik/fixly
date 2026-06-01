import { getProJobUrl } from "@/lib/pro/jobs";
import { buildUrlSet } from "@/lib/seo/sitemapXml";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ProJobSitemapRow = {
  public_slug: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function GET() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("service_requests")
    .select("public_slug, created_at, updated_at")
    .eq("status", "open")
    .eq("lead_status", "available")
    .not("public_slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return new Response("Unable to load pro jobs sitemap", { status: 500 });
  }

  const xml = buildUrlSet(
    ((data ?? []) as ProJobSitemapRow[])
      .filter((row) => row.public_slug)
      .map((row) => ({
        url: getProJobUrl(row.public_slug!),
        lastModified: new Date(row.updated_at ?? row.created_at ?? Date.now()),
        changeFrequency: "daily",
        priority: 0.65,
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
