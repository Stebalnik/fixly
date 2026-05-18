import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type GeneratedPage = {
  id: string;
  target_url: string;
  status: string;
  title: string;
  meta_description: string | null;
  h1: string | null;
  intro: string | null;
  sections: Array<{ heading?: string; body?: string }> | null;
  faqs: Array<{ question?: string; answer?: string }> | null;
  internal_links: Array<{ label?: string; href?: string }> | null;
  cta: string | null;
};

type QualityResult = {
  score: number;
  status: "approved" | "rejected";
  notes: string[];
};

export async function reviewAndPublishGeneratedPage(pageId: string) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("ai_generated_pages")
    .select(
      "id, target_url, status, title, meta_description, h1, intro, sections, faqs, internal_links, cta"
    )
    .eq("id", pageId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Generated page not found.");
  }

  const page = data as GeneratedPage;
  const result = await reviewGeneratedPage(page);

  const nextStatus = result.status === "approved" ? "published" : "needs_review";

  const { error: updateError } = await admin
    .from("ai_generated_pages")
    .update({
      status: nextStatus,
      quality_score: result.score,
      quality_status: result.status,
      quality_notes: result.notes,
      reviewed_at: new Date().toISOString(),
      published_at:
        result.status === "approved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", page.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    ok: true,
    pageId: page.id,
    status: nextStatus,
    qualityScore: result.score,
    qualityStatus: result.status,
    notes: result.notes,
  };
}

export async function reviewGeneratedPage(page: GeneratedPage): Promise<QualityResult> {
  const notes: string[] = [];
  let score = 100;

  if (!page.target_url.startsWith("/")) {
    score -= 40;
    notes.push("Target URL must start with /.");
  }

  if (!page.h1 || page.h1.trim().length < 10) {
    score -= 15;
    notes.push("Missing or weak H1.");
  }

  if (!page.title || page.title.trim().length < 15) {
    score -= 10;
    notes.push("Missing or weak meta title.");
  }

  if (!page.meta_description || page.meta_description.trim().length < 50) {
    score -= 10;
    notes.push("Missing or weak meta description.");
  }

  if (!page.intro || page.intro.trim().length < 80) {
    score -= 15;
    notes.push("Intro is too short.");
  }

  if (!Array.isArray(page.sections) || page.sections.length < 3) {
    score -= 15;
    notes.push("Page should have at least 3 content sections.");
  }

  if (!Array.isArray(page.faqs) || page.faqs.length < 3) {
    score -= 15;
    notes.push("Page should have at least 3 FAQ items.");
  }

  if (!Array.isArray(page.internal_links) || page.internal_links.length < 2) {
    score -= 8;
    notes.push("Page should have at least 2 internal links.");
  }

  if (!page.cta || page.cta.trim().length < 40) {
    score -= 10;
    notes.push("Missing or weak CTA.");
  }

  if (hasGeoMismatchRisk(page)) {
    score -= 30;
    notes.push("Possible geo mismatch detected.");
  }

  const hasPublishedDuplicate = await hasDuplicatePublishedPage(page);

  if (hasPublishedDuplicate) {
    score -= 50;
    notes.push("Published duplicate target URL already exists.");
  }

  const finalScore = Math.max(0, Math.min(score, 100));

  return {
    score: finalScore,
    status: finalScore >= 80 ? "approved" : "rejected",
    notes,
  };
}

async function hasDuplicatePublishedPage(page: GeneratedPage) {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("ai_generated_pages")
    .select("id")
    .eq("target_url", page.target_url)
    .eq("status", "published")
    .neq("id", page.id)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data && data.length > 0);
}

function hasGeoMismatchRisk(page: GeneratedPage) {
  const target = page.target_url.toLowerCase();
  const text = [
    page.title,
    page.meta_description,
    page.h1,
    page.intro,
    page.cta,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (target.includes("/alpha/") && text.includes("alpharetta")) {
    return true;
  }

  return false;
}