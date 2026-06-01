import { getMaterialListingPath } from "@/lib/materials/listings";
import { buildUrlSet } from "@/lib/seo/sitemapXml";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const BASE_URL = "https://materials.fixly.work";

type MaterialListingSitemapRow = {
  public_slug: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function GET() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("material_listings")
    .select("public_slug, created_at, updated_at")
    .eq("status", "approved")
    .not("public_slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) {
    return new Response("Unable to load materials sitemap", { status: 500 });
  }

  const xml = buildUrlSet(
    ((data ?? []) as MaterialListingSitemapRow[])
      .filter((row) => row.public_slug)
      .map((row) => ({
        url: `${BASE_URL}${getMaterialListingPath(row.public_slug!)}`,
        lastModified: new Date(row.updated_at ?? row.created_at ?? Date.now()),
        changeFrequency: "weekly",
        priority: 0.6,
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
