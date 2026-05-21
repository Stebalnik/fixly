import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

type PublicProfileRow = {
  slug: string | null;
  updated_at: string | null;
};

export async function GET() {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("pro_profiles")
    .select("slug, updated_at")
    .eq("status", "active")
    .eq("public_profile_enabled", true)
    .not("slug", "is", null)
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (error) {
    return new Response("Unable to load profile sitemap", { status: 500 });
  }

  const xml = buildUrlSet(
    ((data ?? []) as PublicProfileRow[])
      .filter((profile) => profile.slug)
      .map((profile) => ({
        url: `${BASE_URL}/pro/${profile.slug}`,
        lastModified: profile.updated_at
          ? new Date(profile.updated_at)
          : undefined,
        changeFrequency: "weekly",
        priority: 0.5,
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
