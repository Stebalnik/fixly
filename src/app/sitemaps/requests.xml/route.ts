import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildUrlSet } from "@/lib/seo/sitemapXml";

const BASE_URL = "https://fixly.work";

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data: requests } = await supabase
    .from("service_requests")
    .select("public_slug, created_at, updated_at, status, lead_status")
    .not("public_slug", "is", null)
    .eq("status", "open")
    .limit(5000);

  const entries =
    requests?.map((request) => ({
      url: `${BASE_URL}/requests/${request.public_slug}`,
      lastModified: new Date(
        request.updated_at || request.created_at || Date.now()
      ),
      changeFrequency: "weekly" as const,
      priority: 0.55,
    })) ?? [];

  const xml = buildUrlSet(entries);

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}