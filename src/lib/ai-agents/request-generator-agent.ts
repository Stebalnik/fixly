import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "crypto";
import {
  getAllCountryCodes,
  getAllMarketsByCountry,
  getMarketUrlPath,
} from "@/lib/geo";
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

type ExistingRequestRow = {
  market_slug: string | null;
  category_slug: string | null;
  subcategory_slug: string | null;
  public_slug?: string | null;
  public_description?: string | null;
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

type CountrySelection = {
  countries: string[];
  supportedCountries: string[];
  skippedCountries: string[];
  source: "env" | "fallback";
};

type GenerationLog = {
  countriesEnabled: string[];
  supportedCountries: string[];
  skippedCountries: string[];
  limitMode: "global" | "per_country";
  requestedCountryQuotas: Record<string, number>;
  countryQuotas: Record<string, number>;
  perCountryDailyMax: number | null;
  skippedDailyMaxByCountry: Record<string, number>;
  marketsSampled: Record<string, string[]>;
  requestsCreatedByCountry: Record<string, number>;
  skippedReasons: Record<string, number>;
  errorsByCountry: Record<string, string[]>;
};

type GenerationPlan = {
  limitMode: "global" | "per_country";
  requestedCount: number;
  effectiveCount: number;
  countryQuotas: Map<string, number>;
  requestedCountryQuotas: Map<string, number>;
  todayCreated: number;
  todayCreatedByCountry: Record<string, number>;
  dailyMax: number;
  perCountryDailyMax: number | null;
  skippedDailyMaxByCountry: Record<string, number>;
};

const FALLBACK_COUNTRIES = ["us"];
const PUBLIC_SLUG_RETRY_COUNT = 4;

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

    const globalRequestedCount = getEnvNumber(
      "SERVICE_REQUEST_GENERATOR_LIMIT",
      25
    );
    const limitPerCountry = getOptionalEnvNumber(
      "SERVICE_REQUEST_GENERATOR_LIMIT_PER_COUNTRY"
    );
    const dailyMax = getEnvNumber("SERVICE_REQUEST_GENERATOR_DAILY_MAX", 75);
    const dailyMaxPerCountry = getOptionalEnvNumber(
      "SERVICE_REQUEST_GENERATOR_DAILY_MAX_PER_COUNTRY"
    );
    const requestsPerTopic = getEnvNumber("SERVICE_REQUESTS_PER_TOPIC", 3);
    const countrySelection = getEnabledCountries(
      process.env.SERVICE_REQUEST_GENERATOR_COUNTRIES
    );
    const countries = countrySelection.countries;
    const todayCreated = await getTodaySeededRequestCount();
    const todayCreatedByCountry =
      limitPerCountry || dailyMaxPerCountry
        ? await getTodaySeededRequestCountsByCountry()
        : {};
    const plan = buildGenerationPlan({
      countries,
      globalRequestedCount,
      limitPerCountry,
      dailyMax,
      dailyMaxPerCountry,
      todayCreated,
      todayCreatedByCountry,
    });

    if (plan.effectiveCount <= 0) {
      await finishRun(run.id, "completed", "Daily synthetic request cap reached.", {
        source: "llm_synthetic_requests",
        skipped: true,
        countries,
        limitMode: plan.limitMode,
        requestedCount: plan.requestedCount,
        dailyMax: plan.dailyMax,
        perCountryDailyMax: plan.perCountryDailyMax,
        todayCreated: plan.todayCreated,
        todayCreatedByCountry: plan.todayCreatedByCountry,
        requestedCountryQuotas: Object.fromEntries(plan.requestedCountryQuotas),
        countryQuotas: Object.fromEntries(plan.countryQuotas),
        skippedDailyMaxByCountry: plan.skippedDailyMaxByCountry,
      });

      return {
        ok: true,
        runId: run.id,
        skipped: true,
        reason: "daily_cap_reached",
        createdCount: 0,
        countries,
        limitMode: plan.limitMode,
        requestedCountryQuotas: Object.fromEntries(plan.requestedCountryQuotas),
        countryQuotas: Object.fromEntries(plan.countryQuotas),
        skippedDailyMaxByCountry: plan.skippedDailyMaxByCountry,
      };
    }

    const topics = await getPrioritizedRequestTopics({
      countries,
      requestCount: plan.effectiveCount,
      requestsPerTopic,
      countryQuotas: plan.countryQuotas,
    });

    if (topics.length === 0) {
      throw new Error("No request topics available.");
    }

    const prompt = [
      `Generate ${plan.effectiveCount} realistic but fully synthetic homeowner service requests for Fixly.work.`,
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
      "- Spread requests across the provided countries according to the country quotas.",
      "- Keep the text public-safe and SEO-useful.",
      "",
      "Country quotas:",
      JSON.stringify(Object.fromEntries(plan.countryQuotas)),
      "",
      "Topics:",
      JSON.stringify(
        topics.map((topic) => ({
          topicIndex: topic.index,
          city: topic.market.city,
          state: topic.market.state,
          region: topic.market.region,
          countryCode: topic.countryCode,
          currency: topic.market.currency,
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
              maxItems: plan.effectiveCount,
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
    const existingFingerprints = await getRecentSeededRequestFingerprints();
    const seenFingerprints = new Set(existingFingerprints.descriptionFingerprints);
    const seenPublicSlugs = new Set(existingFingerprints.publicSlugs);
    const seenCityServiceKeys = new Set<string>();
    const createdByCountry = new Map(countries.map((country) => [country, 0]));
    const skippedReasons = new Map<string, number>();

    const rows = generated.requests
      .slice(0, plan.effectiveCount)
      .map((request, index) => {
        const topic = topicMap.get(request.topicIndex);

        if (!topic) {
          incrementMap(skippedReasons, "missing_topic");
          return null;
        }

        const category = categories[topic.categorySlug];

        if (!category) {
          incrementMap(skippedReasons, "invalid_category");
          return null;
        }

        const title = cleanPublicText(request.title);
        const description = cleanPublicText(`${title}. ${request.description}`);

        if (description.length < 80) {
          incrementMap(skippedReasons, "description_too_short");
          return null;
        }

        const cityServiceKey = [
          topic.market.slug,
          topic.categorySlug,
          topic.subcategorySlug ?? "",
        ].join(":");

        if (seenCityServiceKeys.has(cityServiceKey)) {
          incrementMap(skippedReasons, "duplicate_city_service");
          return null;
        }

        const countryQuota = plan.countryQuotas.get(topic.countryCode) ?? 0;
        const countryCreated = createdByCountry.get(topic.countryCode) ?? 0;

        if (countryCreated >= countryQuota) {
          incrementMap(skippedReasons, "country_quota_reached");
          return null;
        }

        const fingerprint = buildDescriptionFingerprint(description);

        if (seenFingerprints.has(fingerprint)) {
          incrementMap(skippedReasons, "duplicate_description");
          return null;
        }

        const publicSlug = makeUniquePublicSlug(
          {
            city: topic.market.city,
            state: topic.market.state,
            countryCode: topic.countryCode,
            categorySlug: topic.categorySlug,
            subcategorySlug: topic.subcategorySlug,
            title,
            index,
          },
          seenPublicSlugs
        );

        seenFingerprints.add(fingerprint);
        seenPublicSlugs.add(publicSlug);
        seenCityServiceKeys.add(cityServiceKey);
        createdByCountry.set(topic.countryCode, countryCreated + 1);

        return {
          public_slug: publicSlug,
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
    let insertedRows: Array<{
      id: string;
      public_slug: string | null;
      country_code: string | null;
    }> = [];

    if (rows.length > 0) {
      const { data, error: insertError } = await admin
        .from("service_requests")
        .upsert(rows, {
          onConflict: "public_slug",
          ignoreDuplicates: true,
        })
        .select("id, public_slug, country_code");

      if (insertError) {
        throw new Error(insertError.message);
      }

      insertedRows = (data ?? []) as Array<{
        id: string;
        public_slug: string | null;
        country_code: string | null;
      }>;
      createdCount = insertedRows?.length ?? 0;

      if (insertedRows.length > 0) {
        const { error: contactInsertError } = await admin
          .from("request_contacts")
          .insert(insertedRows.map(buildSyntheticContactRow));

        if (contactInsertError) {
          await admin
            .from("service_requests")
            .update({ status: "deleted", lead_status: "closed" })
            .in(
              "id",
              insertedRows.map((row) => row.id)
            );

          throw new Error(contactInsertError.message);
        }
      }
    }

    const createdByInsertedCountry = insertedRows.reduce<Record<string, number>>(
      (acc, row) => {
        const country = row.country_code ?? "unknown";
        acc[country] = (acc[country] ?? 0) + 1;
        return acc;
      },
      {}
    );
    const generationLog: GenerationLog = {
      countriesEnabled: countries,
      supportedCountries: countrySelection.supportedCountries,
      skippedCountries: countrySelection.skippedCountries,
      limitMode: plan.limitMode,
      requestedCountryQuotas: Object.fromEntries(plan.requestedCountryQuotas),
      countryQuotas: Object.fromEntries(plan.countryQuotas),
      perCountryDailyMax: plan.perCountryDailyMax,
      skippedDailyMaxByCountry: plan.skippedDailyMaxByCountry,
      marketsSampled: getMarketsSampledByCountry(topics),
      requestsCreatedByCountry: createdByInsertedCountry,
      skippedReasons: Object.fromEntries(skippedReasons),
      errorsByCountry: {},
    };

    await finishRun(
      run.id,
      "completed",
      `Generated ${createdCount} synthetic service requests across ${countries.length} countries.`,
      {
        source: "llm_synthetic_requests",
        createdCount,
        requestedCount: plan.requestedCount,
        effectiveCount: plan.effectiveCount,
        dailyMax: plan.dailyMax,
        perCountryDailyMax: plan.perCountryDailyMax,
        todayCreated: plan.todayCreated,
        todayCreatedByCountry: plan.todayCreatedByCountry,
        requestsPerTopic,
        topicsUsed: topics.length,
        countries,
        countrySelectionSource: countrySelection.source,
        generationLog,
      }
    );

    return {
      ok: true,
      runId: run.id,
      createdCount,
      topicsUsed: topics.length,
      todayCreated: plan.todayCreated,
      todayCreatedByCountry: plan.todayCreatedByCountry,
      dailyMax: plan.dailyMax,
      perCountryDailyMax: plan.perCountryDailyMax,
      countries,
      limitMode: plan.limitMode,
      requestedCountryQuotas: Object.fromEntries(plan.requestedCountryQuotas),
      countryQuotas: Object.fromEntries(plan.countryQuotas),
      skippedDailyMaxByCountry: plan.skippedDailyMaxByCountry,
      requestsCreatedByCountry: createdByInsertedCountry,
      skippedReasons: Object.fromEntries(skippedReasons),
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
  countryQuotas: Map<string, number>;
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

  return selectBalancedTopics(deduped, args.countryQuotas, args.requestsPerTopic)
    .slice(0, args.requestCount + args.countries.length * 2)
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
        countryCode: market.countryCode.toLowerCase(),
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
    "appliance-repair-installation",
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
  const marketsByCountry = new Map<string, Market[]>();

  for (const market of markets) {
    const country = market.countryCode.toLowerCase();
    const countryMarkets = marketsByCountry.get(country) ?? [];
    countryMarkets.push(market);
    marketsByCountry.set(country, countryMarkets);
  }

  for (const countryMarkets of marketsByCountry.values()) {
    for (const market of shuffle(countryMarkets).slice(0, 80)) {
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

async function getRecentSeededRequestFingerprints() {
  const admin = createSupabaseAdminClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 90);

  const { data, error } = await admin
    .from("service_requests")
    .select("public_slug, public_description")
    .eq("is_seeded", true)
    .gte("created_at", since.toISOString())
    .limit(10000);

  if (error) {
    throw new Error(error.message);
  }

  return {
    publicSlugs: new Set(
      ((data ?? []) as ExistingRequestRow[])
        .map((row) => row.public_slug)
        .filter((slug): slug is string => Boolean(slug))
    ),
    descriptionFingerprints: new Set(
      ((data ?? []) as ExistingRequestRow[])
        .map((row) => row.public_description)
        .filter((description): description is string => Boolean(description))
        .map(buildDescriptionFingerprint)
    ),
  };
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

async function getTodaySeededRequestCountsByCountry() {
  const admin = createSupabaseAdminClient();

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const { data, error } = await admin
    .from("service_requests")
    .select("country_code")
    .eq("is_seeded", true)
    .gte("created_at", dayStart.toISOString())
    .limit(10000);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Array<{ country_code: string | null }>).reduce<
    Record<string, number>
  >((acc, row) => {
    const country = row.country_code?.toLowerCase() ?? "unknown";
    acc[country] = (acc[country] ?? 0) + 1;
    return acc;
  }, {});
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

function getEnabledCountries(value?: string | null): CountrySelection {
  const supportedCountries = getAllCountryCodes();
  const supportedSet = new Set(supportedCountries);
  const raw = value?.trim();

  if (!raw) {
    return {
      countries: FALLBACK_COUNTRIES.filter((country) => supportedSet.has(country)),
      supportedCountries,
      skippedCountries: [],
      source: "fallback",
    };
  }

  if (raw.toLowerCase() === "all") {
    return {
      countries: supportedCountries,
      supportedCountries,
      skippedCountries: [],
      source: "env",
    };
  }

  const requested = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const countries = Array.from(
    new Set(requested.filter((country) => supportedSet.has(country)))
  );
  const skippedCountries = Array.from(
    new Set(requested.filter((country) => !supportedSet.has(country)))
  );

  return {
    countries: countries.length > 0 ? countries : FALLBACK_COUNTRIES,
    supportedCountries,
    skippedCountries,
    source: "env",
  };
}

function buildGenerationPlan(args: {
  countries: string[];
  globalRequestedCount: number;
  limitPerCountry: number | null;
  dailyMax: number;
  dailyMaxPerCountry: number | null;
  todayCreated: number;
  todayCreatedByCountry: Record<string, number>;
}): GenerationPlan {
  const limitMode = args.limitPerCountry ? "per_country" : "global";

  if (limitMode === "per_country") {
    const requestedCountryQuotas = new Map(
      args.countries.map((country) => [country, args.limitPerCountry ?? 0])
    );
    const skippedDailyMaxByCountry: Record<string, number> = {};
    let countryQuotas = new Map(requestedCountryQuotas);

    if (args.dailyMaxPerCountry) {
      countryQuotas = new Map(
        args.countries.map((country) => {
          const today = args.todayCreatedByCountry[country] ?? 0;
          const remaining = Math.max(0, args.dailyMaxPerCountry! - today);
          const requested = requestedCountryQuotas.get(country) ?? 0;
          const effective = Math.min(requested, remaining);

          if (effective < requested) {
            skippedDailyMaxByCountry[country] = requested - effective;
          }

          return [country, effective] as const;
        })
      );
    } else {
      const remainingGlobal = Math.max(0, args.dailyMax - args.todayCreated);
      countryQuotas = capCountryQuotasToTotal(countryQuotas, remainingGlobal);

      for (const country of args.countries) {
        const requested = requestedCountryQuotas.get(country) ?? 0;
        const effective = countryQuotas.get(country) ?? 0;

        if (effective < requested) {
          skippedDailyMaxByCountry[country] = requested - effective;
        }
      }
    }

    return {
      limitMode,
      requestedCount: sumMapValues(requestedCountryQuotas),
      effectiveCount: sumMapValues(countryQuotas),
      countryQuotas,
      requestedCountryQuotas,
      todayCreated: args.todayCreated,
      todayCreatedByCountry: args.todayCreatedByCountry,
      dailyMax: args.dailyMax,
      perCountryDailyMax: args.dailyMaxPerCountry,
      skippedDailyMaxByCountry,
    };
  }

  const requestedCountryQuotas = distributeRequestCount(
    args.countries,
    args.globalRequestedCount
  );
  const skippedDailyMaxByCountry: Record<string, number> = {};
  let countryQuotas: Map<string, number>;
  let effectiveCount: number;

  if (args.dailyMaxPerCountry) {
    countryQuotas = new Map(
      args.countries.map((country) => {
        const today = args.todayCreatedByCountry[country] ?? 0;
        const remaining = Math.max(0, args.dailyMaxPerCountry! - today);
        const requested = requestedCountryQuotas.get(country) ?? 0;
        const effective = Math.min(requested, remaining);

        if (effective < requested) {
          skippedDailyMaxByCountry[country] = requested - effective;
        }

        return [country, effective] as const;
      })
    );
    effectiveCount = sumMapValues(countryQuotas);
  } else {
    const remainingGlobal = Math.max(0, args.dailyMax - args.todayCreated);
    effectiveCount = Math.min(args.globalRequestedCount, remainingGlobal);
    countryQuotas = distributeRequestCount(args.countries, effectiveCount);

    if (effectiveCount < args.globalRequestedCount) {
      const requestedTotal = Math.max(args.globalRequestedCount, 1);

      for (const country of args.countries) {
        const requested = requestedCountryQuotas.get(country) ?? 0;
        const estimatedSkipped = Math.round(
          (requested / requestedTotal) *
            (args.globalRequestedCount - effectiveCount)
        );

        if (estimatedSkipped > 0) {
          skippedDailyMaxByCountry[country] = estimatedSkipped;
        }
      }
    }
  }

  return {
    limitMode,
    requestedCount: args.globalRequestedCount,
    effectiveCount,
    countryQuotas,
    requestedCountryQuotas,
    todayCreated: args.todayCreated,
    todayCreatedByCountry: args.todayCreatedByCountry,
    dailyMax: args.dailyMax,
    perCountryDailyMax: args.dailyMaxPerCountry,
    skippedDailyMaxByCountry,
  };
}

function capCountryQuotasToTotal(quotas: Map<string, number>, maxTotal: number) {
  const capped = new Map<string, number>();
  const countries = Array.from(quotas.keys());
  let remaining = Math.max(0, maxTotal);

  for (const country of countries) {
    capped.set(country, 0);
  }

  while (remaining > 0) {
    let assignedInPass = false;

    for (const country of countries) {
      if (remaining <= 0) break;

      const requested = quotas.get(country) ?? 0;
      const current = capped.get(country) ?? 0;

      if (current >= requested) {
        continue;
      }

      capped.set(country, current + 1);
      remaining -= 1;
      assignedInPass = true;
    }

    if (!assignedInPass) {
      break;
    }
  }

  return capped;
}

function sumMapValues(map: Map<string, number>) {
  return Array.from(map.values()).reduce((sum, value) => sum + value, 0);
}

function distributeRequestCount(countries: string[], requestCount: number) {
  const quotas = new Map<string, number>();
  const countryWeights = countries.map((country) => ({
    country,
    weight: Math.max(1, Math.sqrt(getAllMarketsByCountry(country).length)),
  }));
  const totalWeight = countryWeights.reduce((sum, item) => sum + item.weight, 0);

  for (const { country } of countryWeights) {
    quotas.set(country, 0);
  }

  let remaining = requestCount;

  if (requestCount >= countries.length) {
    for (const country of countries) {
      quotas.set(country, 1);
      remaining -= 1;
    }
  }

  const fractional = countryWeights
    .map((item) => {
      const exact = totalWeight > 0 ? (remaining * item.weight) / totalWeight : 0;
      const base = Math.floor(exact);
      quotas.set(item.country, (quotas.get(item.country) ?? 0) + base);
      return { country: item.country, fraction: exact - base };
    })
    .sort((a, b) => b.fraction - a.fraction);

  let assigned = Array.from(quotas.values()).reduce((sum, item) => sum + item, 0);
  let cursor = 0;

  while (assigned < requestCount && fractional.length > 0) {
    const country = fractional[cursor % fractional.length].country;
    quotas.set(country, (quotas.get(country) ?? 0) + 1);
    assigned += 1;
    cursor += 1;
  }

  return quotas;
}

function selectBalancedTopics<T extends RequestTopicBase>(
  topics: T[],
  countryQuotas: Map<string, number>,
  requestsPerTopic: number
) {
  const byCountry = new Map<string, T[]>();

  for (const topic of topics) {
    const items = byCountry.get(topic.countryCode) ?? [];
    items.push(topic);
    byCountry.set(topic.countryCode, items);
  }

  const selected: T[] = [];

  for (const [country, quota] of countryQuotas) {
    if (quota <= 0) {
      continue;
    }

    const countryTopics = byCountry.get(country) ?? [];
    const topicTarget = Math.max(1, Math.ceil(quota / requestsPerTopic) + 2);
    selected.push(...countryTopics.slice(0, topicTarget));
  }

  return selected;
}

function getMarketsSampledByCountry(topics: RequestTopic[]) {
  const result: Record<string, string[]> = {};

  for (const topic of topics) {
    const markets = result[topic.countryCode] ?? [];
    if (!markets.includes(topic.market.slug)) {
      markets.push(topic.market.slug);
    }
    result[topic.countryCode] = markets.slice(0, 25);
  }

  return result;
}

function incrementMap(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function buildSyntheticContactRow(row: {
  id: string;
  public_slug: string | null;
  country_code: string | null;
}) {
  const phoneCountryCode = getSyntheticPhoneCountryCode(row.country_code);
  const phoneNumber = "0000000000";

  return {
    request_id: row.id,
    customer_name: "Synthetic Homeowner",
    street_address: "Synthetic request - address withheld",
    phone_country_code: phoneCountryCode,
    phone_number: phoneNumber,
    full_phone: `${phoneCountryCode} ${phoneNumber}`,
    email: `synthetic-${(row.public_slug ?? row.id)
      .replace(/[^a-z0-9-]/gi, "")
      .slice(0, 80)}@example.invalid`,
    create_account_requested: false,
  };
}

function getSyntheticPhoneCountryCode(countryCode: string | null | undefined) {
  const country = countryCode?.toLowerCase();

  if (country === "gb") return "+44";
  if (country === "au") return "+61";
  if (country === "nz") return "+64";
  return "+1";
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

function makeUniquePublicSlug(
  args: {
    city: string;
    state: string;
    countryCode: string;
    categorySlug: string;
    subcategorySlug: string | null;
    title: string;
    index: number;
  },
  existingSlugs: Set<string>
) {
  for (let attempt = 0; attempt < PUBLIC_SLUG_RETRY_COUNT; attempt += 1) {
    const slug = makePublicSlug({
      ...args,
      nonce: `${Date.now().toString(36)}-${attempt}`,
    });

    if (!existingSlugs.has(slug)) {
      return slug;
    }
  }

  return makePublicSlug({
    ...args,
    nonce: `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`,
  });
}

function makePublicSlug(args: {
  city: string;
  state: string;
  countryCode: string;
  categorySlug: string;
  subcategorySlug: string | null;
  title: string;
  index: number;
  nonce: string;
}) {
  const base = [
    args.city,
    args.state,
    args.countryCode,
    args.categorySlug,
    args.subcategorySlug,
    args.title,
    args.nonce,
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

function buildDescriptionFingerprint(value: string) {
  return cleanPublicText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .slice(0, 32)
    .join(" ");
}

function getEnvNumber(key: string, fallback: number) {
  const value = Number(process.env[key]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getOptionalEnvNumber(key: string) {
  const value = process.env[key];

  if (!value) {
    return null;
  }

  const numeric = Number(value);

  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
