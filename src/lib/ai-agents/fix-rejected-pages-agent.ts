import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RejectedPageRow = {
  id: string;
  target_url: string;
  title: string;
  meta_description: string | null;
  h1: string | null;
  intro: string | null;
  sections: Array<{ heading?: string; body?: string }> | null;
  faqs: Array<{ question?: string; answer?: string }> | null;
  internal_links: Array<{ label?: string; href?: string }> | null;
  cta: string | null;
  quality_score: number | null;
  quality_notes: string[] | null;
};

export async function runFixRejectedPagesAgent() {
  const admin = createSupabaseAdminClient();

  const { data: run, error: runError } = await admin
    .from("ai_agent_runs")
    .insert({
      agent_name: "fix_rejected_pages_agent",
      status: "running",
      metadata: {
        source: "ai_generated_pages",
      },
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message ?? "Unable to create agent run.");
  }

  try {
    const { data: pages, error } = await admin
      .from("ai_generated_pages")
      .select(
        "id, target_url, title, meta_description, h1, intro, sections, faqs, internal_links, cta, quality_score, quality_notes"
      )
      .eq("status", "needs_review")
      .eq("quality_status", "rejected")
      .order("reviewed_at", { ascending: true })
      .limit(25);

    if (error) {
      throw new Error(error.message);
    }

    let fixedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const page of (pages ?? []) as RejectedPageRow[]) {
      try {
        if (shouldSkipRejectedPage(page)) {
          skippedCount += 1;
          continue;
        }

        const fixed = buildImprovedPage(page);

        const { error: updateError } = await admin
          .from("ai_generated_pages")
          .update({
            status: "draft",
            title: fixed.title,
            meta_description: fixed.meta_description,
            h1: fixed.h1,
            intro: fixed.intro,
            sections: fixed.sections,
            faqs: fixed.faqs,
            internal_links: fixed.internal_links,
            cta: fixed.cta,
            quality_status: "pending",
            quality_score: null,
            quality_notes: [],
            reviewed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", page.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        fixedCount += 1;
      } catch (error) {
        failedCount += 1;

        console.error("Failed to fix rejected page", {
          pageId: page.id,
          error,
        });
      }
    }

    await admin
      .from("ai_agent_runs")
      .update({
        status: "completed",
        summary: `Processed ${
          pages?.length ?? 0
        } rejected pages. Fixed ${fixedCount}. Skipped ${skippedCount}. Failed ${failedCount}.`,
        finished_at: new Date().toISOString(),
        metadata: {
          source: "ai_generated_pages",
          processedCount: pages?.length ?? 0,
          fixedCount,
          skippedCount,
          failedCount,
        },
      })
      .eq("id", run.id);

    return {
      ok: true,
      runId: run.id,
      processedCount: pages?.length ?? 0,
      fixedCount,
      skippedCount,
      failedCount,
    };
  } catch (error) {
    await admin
      .from("ai_agent_runs")
      .update({
        status: "failed",
        summary: error instanceof Error ? error.message : "Unknown error",
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    throw error;
  }
}

function buildImprovedPage(page: RejectedPageRow) {
  const readableTopic = getReadableTopic(page);
  const readableLocation = getReadableLocation(page);
  const notes = page.quality_notes ?? [];

  const title =
    page.title && page.title.length >= 30
      ? page.title
      : `${readableTopic} in ${readableLocation} | Local Help on Fixly`;

  const metaDescription =
    page.meta_description && page.meta_description.length >= 80
      ? page.meta_description
      : `Find ${readableTopic.toLowerCase()} in ${readableLocation}. Learn what affects cost, timing, availability, and how to post a clear request on Fixly.`;

  const h1 =
    page.h1 && page.h1.length >= 15
      ? page.h1
      : `${readableTopic} in ${readableLocation}`;

  const intro =
    page.intro && page.intro.length >= 160
      ? page.intro
      : `Fixly helps homeowners in ${readableLocation} request ${readableTopic.toLowerCase()} with clear project details, timing, and location. This page explains what usually affects price and availability, when it makes sense to contact a pro, and how to write a request that local professionals can understand quickly.`;

  const sections = normalizeSections(
    page.sections,
    readableTopic,
    readableLocation,
    notes
  );

  const faqs = normalizeFaqs(page.faqs, readableTopic, readableLocation);
  const internalLinks = normalizeInternalLinks(page.internal_links);

  const cta =
    page.cta && page.cta.length >= 80
      ? page.cta
      : `Post your ${readableTopic.toLowerCase()} request on Fixly with photos, timing, location, and a short description of what you need. Local pros can review the details and respond if they are available.`;

  return {
    title,
    meta_description: metaDescription,
    h1,
    intro,
    sections,
    faqs,
    internal_links: internalLinks,
    cta,
  };
}

function normalizeSections(
  sections: Array<{ heading?: string; body?: string }> | null,
  topic: string,
  location: string,
  notes: string[]
) {
  const existing = Array.isArray(sections) ? sections : [];

  const improved = existing
    .filter((section) => section.heading || section.body)
    .map((section, index) => ({
      heading: section.heading || `Important detail ${index + 1}`,
      body:
        section.body && section.body.length >= 120
          ? section.body
          : `This part of the project can affect timing, cost, materials, and whether a specialist is needed. Include clear details in your Fixly request so local pros in ${location} can understand the scope before responding.`,
    }));

  while (improved.length < 4) {
    const index = improved.length;

    const defaults = [
      {
        heading: `What affects ${topic.toLowerCase()} cost`,
        body: `Cost can depend on the size of the job, materials, labor time, urgency, property access, and whether licensed work is required. A clear request helps local pros in ${location} estimate the work more accurately.`,
      },
      {
        heading: "When to request local help",
        body: `Request help when the issue affects comfort, safety, access, property value, or daily use of the home. Add photos, preferred timing, and any known measurements or symptoms to make the request easier to evaluate.`,
      },
      {
        heading: "How Fixly helps homeowners",
        body: `Fixly organizes your service request so local professionals can review the scope before contacting you. This helps reduce back-and-forth and makes it easier to compare availability and next steps.`,
      },
      {
        heading: "What to include before posting",
        body: `Include the location, service type, timeline, photos if available, access notes, and whether the job is urgent. The more specific the request, the easier it is for a pro to respond with useful information.`,
      },
    ];

    improved.push(defaults[index] ?? defaults[3]);
  }

  if (notes.some((note) => note.toLowerCase().includes("section"))) {
    return improved.map((section) => ({
      ...section,
      body:
        section.body.length >= 140
          ? section.body
          : `${section.body} Add project details, timing expectations, access notes, and any material requirements to help local pros understand the work.`,
    }));
  }

  return improved;
}

function normalizeFaqs(
  faqs: Array<{ question?: string; answer?: string }> | null,
  topic: string,
  location: string
) {
  const existing = Array.isArray(faqs) ? faqs : [];

  const improved = existing
    .filter((faq) => faq.question || faq.answer)
    .map((faq, index) => ({
      question: faq.question || `Question ${index + 1}`,
      answer:
        faq.answer && faq.answer.length >= 80
          ? faq.answer
          : `The answer depends on the scope, timing, property condition, and local availability. Add clear details to your request so pros in ${location} can respond with better guidance.`,
    }));

  const defaults = [
    {
      question: `How much does ${topic.toLowerCase()} cost in ${location}?`,
      answer:
        "Pricing depends on project size, labor time, materials, urgency, and local availability. Small jobs usually cost less, while complex or urgent work can cost more.",
    },
    {
      question: `Can I request ${topic.toLowerCase()} near me?`,
      answer: `Yes. Fixly lets homeowners post local service requests in ${location} so nearby professionals can review the details and respond if they are available.`,
    },
    {
      question: "What details should I include?",
      answer:
        "Include photos, location, preferred timing, measurements if relevant, access notes, symptoms, materials, and whether the request is urgent.",
    },
    {
      question: "Can this be handled quickly?",
      answer:
        "Availability depends on the service type, pro schedule, project complexity, and how clearly the request is described.",
    },
  ];

  while (improved.length < 4) {
    improved.push(defaults[improved.length]);
  }

  return improved;
}

function normalizeInternalLinks(
  links: Array<{ label?: string; href?: string }> | null
) {
  const existing = Array.isArray(links) ? links : [];

  const improved = existing.filter((link) => link.label && link.href);

  const defaults = [
    { label: "Post a service request", href: "/book" },
    { label: "Browse open requests", href: "/requests" },
    { label: "View all services", href: "/services" },
  ];

  for (const link of defaults) {
    if (!improved.some((item) => item.href === link.href)) {
      improved.push(link);
    }
  }

  return improved.slice(0, 6);
}

function shouldSkipRejectedPage(page: RejectedPageRow) {
  const notes = page.quality_notes ?? [];

  return notes.some((note) => {
    const normalized = note.toLowerCase();

    return (
      normalized.includes("published duplicate target url already exists") ||
      normalized.includes("possible geo mismatch detected")
    );
  });
}

function getReadableTopic(page: RejectedPageRow) {
  const fromTitle = page.title?.split("|")[0]?.trim();

  if (fromTitle && fromTitle.length > 3) {
    return fromTitle;
  }

  const parts = page.target_url.split("/").filter(Boolean);
  const category = parts[3] ?? "home service";
  const intent = parts[4] ?? "";

  return titleCase(
    `${category.replace(/-/g, " ")} ${intent.replace(/-/g, " ")}`
  );
}

function getReadableLocation(page: RejectedPageRow) {
  const parts = page.target_url.split("/").filter(Boolean);
  const market = parts[2] ?? "your area";

  return titleCase(market.replace(/-/g, " "));
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}