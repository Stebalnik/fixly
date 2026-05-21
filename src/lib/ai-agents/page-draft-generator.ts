import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SeoOpportunityRow = {
  id: string;
  title: string;
  target_url: string | null;
  search_query: string | null;
  category_slug: string | null;
  subcategory_slug: string | null;
  market_slug: string | null;
  intent_slug: string | null;
  recommendation: string;
  proposed_action: Record<string, unknown> | null;
};

export async function generatePageDraftFromOpportunity(opportunityId: string) {
  const admin = createSupabaseAdminClient();

  const { data: opportunity, error } = await admin
    .from("ai_seo_opportunities")
    .select(
      "id, title, target_url, search_query, category_slug, subcategory_slug, market_slug, intent_slug, recommendation, proposed_action"
    )
    .eq("id", opportunityId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!opportunity) {
    throw new Error("Opportunity not found.");
  }

  const row = opportunity as SeoOpportunityRow;

  if (!row.target_url) {
    throw new Error("Opportunity has no target URL.");
  }

  const existing = await admin
    .from("ai_generated_pages")
    .select("id")
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (existing.error) {
    throw new Error(existing.error.message);
  }

  if (existing.data) {
    return {
      ok: true,
      pageId: existing.data.id,
      created: false,
    };
  }

  const draft = buildDraft(row);

  const { data: page, error: insertError } = await admin
    .from("ai_generated_pages")
    .insert(draft)
    .select("id")
    .single();

  if (insertError || !page) {
    throw new Error(insertError?.message ?? "Unable to create page draft.");
  }

  await admin
    .from("ai_seo_opportunities")
    .update({
      status: "in_progress",
      updated_at: new Date().toISOString(),
    })
    .eq("id", opportunityId);

  return {
    ok: true,
    pageId: page.id,
    created: true,
  };
}

function buildDraft(row: SeoOpportunityRow) {
  const serviceName = titleCase(
    row.category_slug?.replace(/-/g, " ") ?? "Home Service"
  );

  const marketName = titleCase(
    row.market_slug?.replace(/-/g, " ") ?? "Your Area"
  );

  const intent = row.intent_slug ?? "service";

  const h1 = buildH1(serviceName, marketName, intent);
  const recommendedLinks = getRecommendedLinks(row);

  return {
    opportunity_id: row.id,
    target_url: row.target_url,
    page_type: "geo_category_intent",
    status: "draft",
    title: row.title,
    meta_description: buildMetaDescription(serviceName, marketName, intent),
    h1,
    intro: buildIntro(serviceName, marketName, intent, row.search_query),
    sections: [
      {
        heading: "Direct summary",
        body: `${h1} helps homeowners understand when to request help, what pricing depends on, what details to include, and which local service options are related before posting a Fixly request.`,
      },
      {
        heading: `What ${serviceName} pros can help with`,
        body: `Fixly helps homeowners describe the job, compare local availability, and request help from pros who handle ${serviceName.toLowerCase()} work in ${marketName}.`,
      },
      {
        heading: `How ${intent} ${serviceName.toLowerCase()} requests work`,
        body: `Submit a short request with your location, issue, timing, and photos if available. Fixly creates a clear job summary so local pros can understand the work before responding.`,
      },
      {
        heading: `Price guidance`,
        body: `Pricing depends on job size, access, materials, urgency, and local availability. Use this page to understand what affects cost before requesting help.`,
      },
      {
        heading: "Urgency and safety",
        body: `Request faster help when the issue affects safety, active damage, water, electricity, heat, access, or normal use of the home. Stop using affected systems when continued use could make the issue worse.`,
      },
      {
        heading: "Typical process",
        body: `Describe the issue, add photos or measurements, confirm timing, compare available pros, approve the scope, complete the work, and review cleanup or maintenance notes.`,
      },
      {
        heading: "DIY vs professional help",
        body: `DIY may fit minor non-urgent tasks. A professional is usually better when the work requires diagnosis, specialized tools, permits, licensed trades, safety judgment, or active damage control.`,
      },
    ],
    faqs: [
      {
        question: `How do I find ${serviceName.toLowerCase()} help in ${marketName}?`,
        answer:
          "Submit a request on Fixly with the service type, location, timing, and a short description of the issue.",
      },
      {
        question: `Can I request same-day help?`,
        answer:
          "Yes. If the job is urgent, include timing details so available pros can understand how quickly you need help.",
      },
      {
        question: `What affects the price?`,
        answer:
          "The main factors are job complexity, materials, access, travel time, urgency, and whether troubleshooting is required.",
      },
      {
        question: `Is this ${serviceName.toLowerCase()} request urgent?`,
        answer:
          "It may be urgent if there is active damage, safety risk, blocked access, failed equipment, water, electricity, heat loss, or a condition that is spreading.",
      },
      {
        question: `Do I need a licensed pro?`,
        answer:
          "Licensing depends on local rules and the work scope. Electrical, plumbing, HVAC, roofing, structural, and major installation work may require credentials or permits.",
      },
      {
        question: "Can the damage spread?",
        answer:
          "Some problems can worsen if they involve moisture, electrical load, structural stress, weather exposure, pests, repeated use, or failed mechanical parts.",
      },
    ],
    internal_links: [
      ...recommendedLinks,
      {
        label: "Post a request",
        href: "/book",
      },
      {
        label: "Browse open requests",
        href: "/requests",
      },
    ],
    cta: `Need ${serviceName.toLowerCase()} help in ${marketName}? Post a request on Fixly and let local pros review the job.`,
  };
}

function getRecommendedLinks(row: SeoOpportunityRow) {
  const rawLinks = row.proposed_action?.internalLinkRecommendations;

  if (!Array.isArray(rawLinks)) {
    return [];
  }

  return rawLinks
    .map((link) => {
      if (!link || typeof link !== "object") return null;

      const record = link as Record<string, unknown>;
      const label = typeof record.label === "string" ? record.label : null;
      const href = typeof record.href === "string" ? record.href : null;

      return label && href ? { label, href } : null;
    })
    .filter((link): link is { label: string; href: string } => Boolean(link));
}

function buildH1(serviceName: string, marketName: string, intent: string) {
  if (intent === "price") {
    return `${serviceName} Prices in ${marketName}`;
  }

  if (intent === "same-day") {
    return `Same-Day ${serviceName} in ${marketName}`;
  }

  if (intent === "emergency") {
    return `Emergency ${serviceName} in ${marketName}`;
  }

  if (intent === "near-me") {
    return `${serviceName} Near Me in ${marketName}`;
  }

  return `${serviceName} in ${marketName}`;
}

function buildMetaDescription(
  serviceName: string,
  marketName: string,
  intent: string
) {
  if (intent === "price") {
    return `Understand ${serviceName.toLowerCase()} pricing in ${marketName}, what affects cost, and how to request help from local pros.`;
  }

  if (intent === "same-day") {
    return `Request same-day ${serviceName.toLowerCase()} help in ${marketName}. Describe the job and let local pros review your request.`;
  }

  if (intent === "emergency") {
    return `Need urgent ${serviceName.toLowerCase()} help in ${marketName}? Post a request and share the issue, timing, and location.`;
  }

  return `Find ${serviceName.toLowerCase()} help in ${marketName}. Post a request and let local pros review the job.`;
}

function buildIntro(
  serviceName: string,
  marketName: string,
  intent: string,
  searchQuery: string | null
) {
  const queryContext = searchQuery
    ? ` This page was created from demand around "${searchQuery}".`
    : "";

  if (intent === "price") {
    return `${serviceName} prices in ${marketName} depend on the type of work, urgency, materials, access, and local pro availability.${queryContext}`;
  }

  if (intent === "same-day") {
    return `If you need same-day ${serviceName.toLowerCase()} help in ${marketName}, Fixly helps you create a clear request so available pros can understand the job quickly.${queryContext}`;
  }

  if (intent === "emergency") {
    return `For urgent ${serviceName.toLowerCase()} issues in ${marketName}, a clear request helps local pros understand the problem, timing, and access details before responding.${queryContext}`;
  }

  return `Fixly helps homeowners request ${serviceName.toLowerCase()} help in ${marketName} by turning the job into a clear, local service request.${queryContext}`;
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
