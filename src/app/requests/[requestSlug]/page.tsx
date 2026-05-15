import { redirect, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getRequestPublicPath } from "@/lib/routes/marketplace";

type PageProps = {
  params: Promise<{
    requestSlug: string;
  }>;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function LegacyRequestRedirectPage({
  params,
}: PageProps) {
  const { requestSlug } = await params;

  const { data } = await supabase
    .from("service_requests")
    .select("country_code")
    .eq("public_slug", requestSlug)
    .maybeSingle();

  if (!data) {
    notFound();
  }

  redirect(
    getRequestPublicPath(
      requestSlug,
      data.country_code?.toLowerCase() || "us"
    )
  );
}