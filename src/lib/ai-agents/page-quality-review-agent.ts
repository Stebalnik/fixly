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

  if (!Array.isArray(page.faqs) || page.faqs.length < 5) {
    score -= 15;
    notes.push("Page should have at least 5 FAQ items.");
  }

  if (!Array.isArray(page.internal_links) || page.internal_links.length < 5) {
    score -= 10;
    notes.push("Page should have at least 5 internal links.");
  }

  if (!page.cta || page.cta.trim().length < 40) {
    score -= 10;
    notes.push("Missing or weak CTA.");
  }

  if (hasGeoMismatchRisk(page)) {
    score -= 30;
    notes.push("Possible geo mismatch detected.");
  }

  const semanticCompleteness = getSemanticCompletenessScore(page);

  if (semanticCompleteness < 5) {
    score -= 18;
    notes.push("Semantic completeness is weak.");
  }

  if (!hasPricingCoverage(page)) {
    score -= 12;
    notes.push("Missing pricing coverage.");
  }

  if (!hasFaqCoverage(page)) {
    score -= 12;
    notes.push("FAQ coverage is missing urgency, pricing, or licensing questions.");
  }

  if (getDuplicatePhraseDensity(page) > 0.22) {
    score -= 12;
    notes.push("Duplicate phrase density is too high.");
  }

  if (!hasRetrievalFriendlyStructure(page)) {
    score -= 12;
    notes.push("Page needs more retrieval-friendly summaries, process, comparison, or bullet-style sections.");
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

function getSemanticCompletenessScore(page: GeneratedPage) {
  const text = getPageText(page);
  const requiredConcepts = [
    ["summary", "direct"],
    ["price", "cost", "pricing"],
    ["urgent", "emergency", "same-day", "safety"],
    ["process", "steps", "inspection"],
    ["faq", "question"],
    ["licensed", "permit", "code"],
    ["related", "nearby", "local"],
  ];

  return requiredConcepts.reduce((total, terms) => {
    return terms.some((term) => text.includes(term)) ? total + 1 : total;
  }, 0);
}

function hasPricingCoverage(page: GeneratedPage) {
  const text = getPageText(page);
  return (
    text.includes("price") ||
    text.includes("pricing") ||
    text.includes("cost") ||
    text.includes("materials")
  );
}

function hasFaqCoverage(page: GeneratedPage) {
  const faqText = (page.faqs ?? [])
    .map((faq) => `${faq.question ?? ""} ${faq.answer ?? ""}`)
    .join(" ")
    .toLowerCase();

  return (
    (faqText.includes("urgent") || faqText.includes("same-day")) &&
    (faqText.includes("price") || faqText.includes("cost")) &&
    (faqText.includes("licensed") || faqText.includes("permit"))
  );
}

function getDuplicatePhraseDensity(page: GeneratedPage) {
  const words = getPageText(page)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);

  if (words.length < 30) return 0;

  const phrases = new Map<string, number>();

  for (let index = 0; index < words.length - 2; index += 1) {
    const phrase = words.slice(index, index + 3).join(" ");
    phrases.set(phrase, (phrases.get(phrase) ?? 0) + 1);
  }

  const repeated = Array.from(phrases.values()).filter((count) => count > 1)
    .length;

  return repeated / Math.max(1, phrases.size);
}

function hasRetrievalFriendlyStructure(page: GeneratedPage) {
  const headings = (page.sections ?? [])
    .map((section) => section.heading ?? "")
    .join(" ")
    .toLowerCase();

  return (
    headings.includes("summary") &&
    headings.includes("price") &&
    (headings.includes("process") || headings.includes("steps")) &&
    (headings.includes("comparison") ||
      headings.includes("diy") ||
      headings.includes("professional"))
  );
}

function getPageText(page: GeneratedPage) {
  return [
    page.title,
    page.meta_description,
    page.h1,
    page.intro,
    ...(page.sections ?? []).flatMap((section) => [
      section.heading,
      section.body,
    ]),
    ...(page.faqs ?? []).flatMap((faq) => [faq.question, faq.answer]),
    ...(page.internal_links ?? []).flatMap((link) => [link.label, link.href]),
    page.cta,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
