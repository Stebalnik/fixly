import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAllMarketsByCountry, getMarketUrlPath } from "@/lib/geo";
import { categories } from "@/lib/services/categories";
import { generateJson } from "@/lib/llm/provider";

type Market = ReturnType<typeof getAllMarketsByCountry>[number];

type GeneratedRequest = {
  topicIndex: number;
  title: string;
  description: string;
  urgency: "flexible" | "this_week" | "same_day" | "emergency";
};

type GeneratedRequestsResponse = {
  requests: GeneratedRequest[];
};

type SeoOpportunityRow = {
  country_code: string | null;
  market_slug: string | null;
  category_slug: string | null;
  subcategory_slug: string | null;
  intent_slug: string | null;
  target_url: string | null;
  search_query: string | null;
  priority_score: number | null;
};

type GeneratedPageRow = {
  target_url: string | null;
};

type ExistingRequestRow = {
  market_slug: string | null;
  category_slug: string | null;
  subcategory_slug: string | null;
};

type RequestTopicBase = {
  countryCode: string;
  market: Market;
  categorySlug: string;
  subcategorySlug: string | null;
  intentSlug: string | null;
  targetUrl: string | null;
  searchQuery: string | null;
  priorityScore: number;
  existingSeededCount: number;
};

type RequestTopic = RequestTopicBase & {
  index: number;
};

const DEFAULT_COUNTRIES = ["us", "ca", "gb", "au", "nz"];
const INTENT_SLUGS = new Set(["price", "same-day", "emergency", "near-me"]);

export async function runServiceRequestGeneratorAgent() {
  const admin = createSupabaseAdminClient();

  const { data: run, error: runError } = await admin
    .from("ai_agent_runs")
    .insert({
      agent_name: "service_request_generator_agent",
      status: "running",
      metadata: { source: "llm_synthetic_requests" },
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message ?? "Unable to create agent run.");
  }

  try {
    if (process.env.LLM_ENABLED === "false") {
      await finishRun(run.id, "completed", "LLM generation is disabled.", {
        disabled: true,
      });

      return { ok: true, runId: run.id, disabled: true, createdCount: 0 };
    }

    const requestedCount = getEnvNumber("SERVICE_REQUEST_GENERATOR_LIMIT", 25);
    const dailyMax = getEnvNumber("SERVICE_REQUEST_GENERATOR_DAILY_MAX", 75);
    const requestsPerTopic = getEnvNumber("SERVICE_REQUESTS_PER_TOPIC", 3);
    const countries = getEnvList(
      "SERVICE_REQUEST_GENERATOR_COUNTRIES",
      DEFAULT_COUNTRIES
    );

    const todayCreated = await getTodaySeededRequestCount();

    if (todayCreated >= dailyMax) {
      await finishRun(run.id, "completed", "Daily synthetic request cap reached.", {
        source: "llm_synthetic_requests",
        todayCreated,
        dailyMax,
        skipped: true,
      });

      return {
        ok: true,
        runId: run.id,
        skipped: true,
        reason: "daily_cap_reached",
        createdCount: 0,
      };
    }

    const count = Math.max(1, Math.min(requestedCount, dailyMax - todayCreated));
    const topics = await getPrioritizedRequestTopics({
      countries,
      requestCount: count,
      requestsPerTopic,
    });

    if (topics.length === 0) {
      throw new Error("No request topics available.");
    }

    const prompt = [
      `Generate ${count} realistic but fully synthetic homeowner service requests for Fixly.work.`,
      "",
      "Important:",
      "- Generate requests only for the provided topics.",
      "- Each request must include topicIndex matching one of the provided topics.",
      "- Do NOT use real people, real phone numbers, real emails, real addresses, or exact street names.",
      "- Descriptions must sound like real homeowner requests, not marketing copy.",
      "- Descriptions should be 90-180 words.",
      "- Include realistic context: move-in, move-out, storm damage, tenant complaint, HOA issue, rental property, older home, first-time homeowner, preparing to sell, already got one quote, budget-sensitive homeowner, elderly parent, recurring maintenance, or small urgent repair.",
      "- Include specific symptoms, constraints, timing, and what the homeowner noticed or tried.",
      "- Do not make every request urgent. Mix flexible, this week, same-day, and emergency naturally.",
      "- Make requests local by city/state/country, but do not invent street addresses.",
      "- Keep the text public-safe and SEO-useful.",
      "",
      "Topics:",
      JSON.stringify(
        topics.map((topic) => ({
          topicIndex: topic.index,
          city: topic.market.city,
          state: topic.market.state,
          countryCode: topic.countryCode,
          marketSlug: topic.market.slug,
          categorySlug: topic.categorySlug,
          subcategorySlug: topic.subcategorySlug,
          intentSlug: topic.intentSlug,
          searchQuery: topic.searchQuery,
          targetUrl: topic.targetUrl,
          existingSeededCount: topic.existingSeededCount,
        }))
      ),
      "",
      "Return JSON only.",
    ].join("\n");

    const generated = await generateJson<GeneratedRequestsResponse>({
      temperature: 0.6,
      system:
        "You generate realistic, public-safe synthetic home service requests for a marketplace. You never generate real personal data.",
      prompt,
      schema: {
        name: "generated_service_requests",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["requests"],
          properties: {
            requests: {
              type: "array",
              minItems: 1,
              maxItems: count,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["topicIndex", "title", "description", "urgency"],
                properties: {
                  topicIndex: { type: "number" },
                  title: { type: "string" },
                  description: { type: "string" },
                  urgency: {
                    type: "string",
                    enum: ["flexible", "this_week", "same_day", "emergency"],
                  },
                },
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const topicMap = new Map(topics.map((topic) => [topic.index, topic]));

    const rows = generated.requests
      .slice(0, count)
      .map((request, index) => {
        const topic = topicMap.get(request.topicIndex);

        if (!topic) {
          return null;
        }

        const category = categories[topic.categorySlug];

        if (!category) {
          return null;
        }

        const title = cleanPublicText(request.title);
        const description = cleanPublicText(`${title}. ${request.description}`);

        if (description.length < 80) {
          return null;
        }

        return {
          public_slug: makePublicSlug({
            city: topic.market.city,
            state: topic.market.state,
            categorySlug: topic.categorySlug,
            subcategorySlug: topic.subcategorySlug,
            title,
            index,
          }),
          category_slug: topic.categorySlug,
          subcategory_slug: topic.subcategorySlug,
          market_slug: topic.market.slug,
          city: topic.market.city,
          state: topic.market.state,
          country_code: topic.countryCode,
          public_description: description,
          status: "open",
          quality_score: 80,
          index_status: "index",
          customer_flow: "ai_seeded",
          notify_email: false,
          lead_access_policy: "paid_only",
          lead_price_credits: 5,
          lead_price_fixas: 100,
          max_purchases: 5,
          purchase_count: 0,
          lead_status: "available",
          max_responses: 5,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          archive_after: new Date(
            now.getTime() + 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          is_seeded: true,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    let createdCount = 0;

    if (rows.length > 0) {
      const { error: insertError } = await admin
        .from("service_requests")
        .upsert(rows, {
          onConflict: "public_slug",
          ignoreDuplicates: true,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      createdCount = rows.length;
    }

    await finishRun(
      run.id,
      "completed",
      `Generated ${createdCount} synthetic service requests from SEO topics.`,
      {
        source: "llm_synthetic_requests",
        createdCount,
        requestedCount: count,
        dailyMax,
        todayCreated,
        requestsPerTopic,
        topicsUsed: topics.length,
        countries,
      }
    );

    return {
      ok: true,
      runId: run.id,
      createdCount,
      topicsUsed: topics.length,
      todayCreated,
      dailyMax,
    };
  } catch (error) {
    await finishRun(
      run.id,
      "failed",
      error instanceof Error ? error.message : "Unknown error",
      {
        source: "llm_synthetic_requests",
      }
    );

    throw error;
  }
}

async function getPrioritizedRequestTopics(args: {
  countries: string[];
  requestCount: number;
  requestsPerTopic: number;
}) {
  const markets = args.countries
    .flatMap((country) => getAllMarketsByCountry(country))
    .filter((market) => market.city && market.slug && market.countryCode);

  const marketBySlug = new Map(markets.map((market) => [market.slug, market]));
  const seededCounts = await getRecentSeededRequestCounts();

  const topics: RequestTopicBase[] = [];

  for (const topic of await getTopicsFromSeoOpportunities(marketBySlug)) {
    topics.push({
      ...topic,
      existingSeededCount: seededCounts.get(buildTopicKey(topic)) ?? 0,
    });
  }

  for (const topic of getTopicsFromPublishedPages(markets)) {
    topics.push({
      ...topic,
      existingSeededCount: seededCounts.get(buildTopicKey(topic)) ?? 0,
    });
  }

  if (topics.length < args.requestCount) {
    for (const topic of getFallbackTopics(markets)) {
      topics.push({
        ...topic,
        existingSeededCount: seededCounts.get(buildTopicKey(topic)) ?? 0,
      });
    }
  }

  const deduped = dedupeTopics(topics)
    .filter((topic) => topic.existingSeededCount < args.requestsPerTopic)
    .sort((a, b) => {
      if (a.existingSeededCount !== b.existingSeededCount) {
        return a.existingSeededCount - b.existingSeededCount;
      }

      return b.priorityScore - a.priorityScore;
    });

  return deduped
    .slice(0, Math.ceil(args.requestCount / args.requestsPerTopic) + 5)
    .map((topic, index) => ({ ...topic, index }));
}

async function getTopicsFromSeoOpportunities(
  marketBySlug: Map<string, Market>
): Promise<Omit<RequestTopic, "index" | "existingSeededCount">[]> {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("ai_seo_opportunities")
    .select(
      "country_code, market_slug, category_slug, subcategory_slug, intent_slug, target_url, search_query, priority_score"
    )
    .order("priority_score", { ascending: false })
    .limit(300);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SeoOpportunityRow[])
    .map((row) => {
      if (!row.market_slug || !row.category_slug) {
        return null;
      }

      const market = marketBySlug.get(row.market_slug);
      const category = categories[row.category_slug];

      if (!market || !category) {
        return null;
      }

      const subcategorySlug =
        row.subcategory_slug &&
        category.subcategories.includes(row.subcategory_slug)
          ? row.subcategory_slug
          : null;

      return {
        countryCode: (row.country_code ?? market.countryCode).toLowerCase(),
        market,
        categorySlug: row.category_slug,
        subcategorySlug,
        intentSlug: row.intent_slug,
        targetUrl: row.target_url,
        searchQuery: row.search_query,
        priorityScore: row.priority_score ?? 50,
      };
    })
    .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic));
}

function getTopicsFromPublishedPages(
  markets: Market[]
): Omit<RequestTopic, "index" | "existingSeededCount">[] {
  // Lightweight fallback based on existing market/category architecture.
  // Published page parsing can be added later if ai_generated_pages schema needs deeper usage.
  return getFallbackTopics(markets).slice(0, 200);
}

function getFallbackTopics(
  markets: Market[]
): Omit<RequestTopic, "index" | "existingSeededCount">[] {
  const priorityCategories = [
    "plumbing",
    "electrical",
    "handyman",
    "cleaning",
    "roofing",
    "hvac",
    "appliance-repair",
    "lawn-care",
    "painting",
    "flooring",
    "garage-door",
    "pest-control",
    "junk-removal",
    "pressure-washing",
    "remodeling",
  ];

  const topics: Omit<RequestTopic, "index" | "existingSeededCount">[] = [];

  for (const market of shuffle(markets).slice(0, 100)) {
    for (const categorySlug of priorityCategories) {
      const category = categories[categorySlug];

      if (!category) {
        continue;
      }

      const subcategorySlug = category.subcategories[0] ?? null;
      const marketPath = getMarketUrlPath(market);

      topics.push({
        countryCode: market.countryCode.toLowerCase(),
        market,
        categorySlug,
        subcategorySlug,
        intentSlug: "near-me",
        targetUrl: `${marketPath}/${categorySlug}`,
        searchQuery: `${category.shortTitle} near me ${market.city}`,
        priorityScore: 40,
      });
    }
  }

  return topics;
}

async function getRecentSeededRequestCounts() {
  const admin = createSupabaseAdminClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);

  const { data, error } = await admin
    .from("service_requests")
    .select("market_slug, category_slug, subcategory_slug")
    .eq("is_seeded", true)
    .gte("created_at", since.toISOString())
    .limit(10000);

  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<string, number>();

  for (const row of (data ?? []) as ExistingRequestRow[]) {
    const key = [
      row.market_slug ?? "",
      row.category_slug ?? "",
      row.subcategory_slug ?? "",
    ].join(":");

    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return map;
}

async function getTodaySeededRequestCount() {
  const admin = createSupabaseAdminClient();

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const { count, error } = await admin
    .from("service_requests")
    .select("id", { count: "exact", head: true })
    .eq("is_seeded", true)
    .gte("created_at", dayStart.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

function buildTopicKey(topic: {
  market: Market;
  categorySlug: string;
  subcategorySlug: string | null;
}) {
  return [topic.market.slug, topic.categorySlug, topic.subcategorySlug ?? ""].join(
    ":"
  );
}

function dedupeTopics<T extends RequestTopicBase>(items: T[]) {
  const map = new Map<string, T>();

  for (const item of items) {
    const key = [
      item.market.slug,
      item.categorySlug,
      item.subcategorySlug ?? "",
      item.intentSlug ?? "",
    ].join(":");

    if (!map.has(key)) {
      map.set(key, item);
      continue;
    }

    const existing = map.get(key);

    if (existing && item.priorityScore > existing.priorityScore) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

async function finishRun(
  runId: string,
  status: "completed" | "failed",
  summary: string,
  metadata: Record<string, unknown>
) {
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("ai_agent_runs")
    .update({
      status,
      summary,
      metadata,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (error) {
    throw new Error(error.message);
  }
}

function makePublicSlug(args: {
  city: string;
  state: string;
  categorySlug: string;
  subcategorySlug: string | null;
  title: string;
  index: number;
}) {
  const base = [
    args.city,
    args.state,
    args.categorySlug,
    args.subcategorySlug,
    args.title,
    Date.now().toString(36),
    String(args.index + 1),
  ]
    .filter(Boolean)
    .join(" ");

  return slugify(base).slice(0, 140);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function cleanPublicText(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getEnvList(key: string, fallback: string[]) {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function getEnvNumber(key: string, fallback: number) {
  const value = Number(process.env[key]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}