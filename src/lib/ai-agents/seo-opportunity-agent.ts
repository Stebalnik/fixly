import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { categories } from "@/lib/services/categories";
import { getAllMarketsByCountry, getMarketUrlPath } from "@/lib/geo";
import type { SeoOpportunity } from "./types";

type TrendSignal = {
  id: string;
  country_code: string;
  region: string | null;
  raw_query: string;
  normalized_query: string;
  trend_score: number | null;
  growth_type: string | null;
  metadata: Record<string, unknown> | null;
};


export async function runSeoOpportunityAgent() {
  const admin = createSupabaseAdminClient();

  const { data: run, error: runError } = await admin
    .from("ai_agent_runs")
    .insert({
      agent_name: "seo_opportunity_agent",
      status: "running",
      metadata: {
        source: "trend_signals",
      },
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message ?? "Unable to create agent run.");
  }

  try {
    const opportunities = await generateSeoOpportunitiesFromTrends();

    if (opportunities.length > 0) {
      const rows = opportunities.map((item) => ({
        agent_run_id: run.id,
        country_code: item.countryCode,
        market_slug: item.marketSlug ?? null,
        category_slug: item.categorySlug ?? null,
        subcategory_slug: item.subcategorySlug ?? null,
        intent_slug: item.intentSlug ?? null,
        opportunity_type: item.opportunityType,
        title: item.title,
        target_url: item.targetUrl ?? null,
        search_query: item.searchQuery ?? null,
        priority_score: item.priorityScore,
        recommendation: item.recommendation,
        proposed_action: item.proposedAction ?? {},
      }));

      const { error: insertError } = await admin
        .from("ai_seo_opportunities")
        .insert(rows);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    await admin
      .from("ai_agent_runs")
      .update({
        status: "completed",
        summary: `Generated ${opportunities.length} SEO opportunities from trend signals.`,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    return {
      ok: true,
      runId: run.id,
      opportunitiesCreated: opportunities.length,
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

async function generateSeoOpportunitiesFromTrends(): Promise<SeoOpportunity[]> {
  const admin = createSupabaseAdminClient();

  const { data: trendSignals, error } = await admin
    .from("ai_trend_signals")
    .select(
      "id, country_code, region, raw_query, normalized_query, trend_score, growth_type, metadata"
    )
    .eq("country_code", "us")
    .order("trend_score", { ascending: false })
    .order("observed_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const opportunities: SeoOpportunity[] = [];

  for (const signal of trendSignals ?? []) {
    const mapped = mapTrendSignalToOpportunity(signal as TrendSignal);

    if (mapped) {
      opportunities.push(mapped);
    }
  }

  return dedupeOpportunities(opportunities)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 200);
}

function mapTrendSignalToOpportunity(
  signal: TrendSignal
): SeoOpportunity | null {
  const query = signal.normalized_query.toLowerCase();

  const category = findCategoryFromQuery(query);
  const intent = findIntentFromQuery(query);
  const market = findMarketFromQuery(query);

  if (!category || !intent || !market) {
    return null;
  }

  const marketPath = getMarketUrlPath(market);
  const targetUrl = `${marketPath}/${category.slug}/${intent}`;

  return {
    countryCode: signal.country_code,
    marketSlug: market.slug,
    categorySlug: category.slug,
    intentSlug: intent,
    opportunityType: "missing_intent_page",
    title: `${category.shortTitle} ${intent} page in ${market.city}`,
    targetUrl,
    searchQuery: signal.raw_query,
    priorityScore: getPriorityScore({
      intent,
      trendScore: signal.trend_score ?? 0,
      growthType: signal.growth_type,
    }),
    recommendation: `Create or improve a ${intent} intent page for ${category.shortTitle} in ${market.city}. This opportunity came from trend query "${signal.raw_query}". Include direct answer, pricing guidance, FAQ, internal links, local context, and CTA.`,
    proposedAction: {
      pageType: "geo_category_intent",
      source: "trend_signal",
      trendSignalId: signal.id,
      rawQuery: signal.raw_query,
      normalizedQuery: signal.normalized_query,
      categorySlug: category.slug,
      intentSlug: intent,
      marketSlug: market.slug,
    },
  };
}

function findCategoryFromQuery(query: string) {
  const categoryList = Object.values(categories);

  return categoryList.find((category) => {
    const categoryTerms = [
      category.slug,
      category.shortTitle,
      category.title,
      ...category.subcategories,
    ].map((value) => value.toLowerCase().replace(/-/g, " "));

    return categoryTerms.some((term) => query.includes(term));
  });
}

function findIntentFromQuery(query: string) {
  if (
    query.includes("cost") ||
    query.includes("price") ||
    query.includes("pricing") ||
    query.includes("how much")
  ) {
    return "price";
  }

  if (
    query.includes("same day") ||
    query.includes("same-day") ||
    query.includes("today")
  ) {
    return "same-day";
  }

  if (
    query.includes("emergency") ||
    query.includes("urgent") ||
    query.includes("24 hour") ||
    query.includes("24/7")
  ) {
    return "emergency";
  }

  if (query.includes("near me") || query.includes("nearby")) {
    return "near-me";
  }

  return null;
}

function findMarketFromQuery(query: string) {
  const markets = getAllMarketsByCountry("us");

  return markets.find((market) => {
    const city = market.city.toLowerCase();
    const state = market.state.toLowerCase();
    const stateFull = market.stateFull.toLowerCase();

    return (
      query.includes(city) ||
      query.includes(`${city} ${state}`) ||
      query.includes(`${city} ${stateFull}`)
    );
  });
}

function getPriorityScore(args: {
  intent: string;
  trendScore: number;
  growthType: string | null;
}) {
  const intentScore =
    args.intent === "price"
      ? 40
      : args.intent === "same-day"
        ? 36
        : args.intent === "emergency"
          ? 34
          : args.intent === "near-me"
            ? 30
            : 20;

  const growthScore =
    args.growthType === "breakout"
      ? 35
      : args.growthType === "rising"
        ? 25
        : 10;

  const trendScore = Math.min(args.trendScore, 25);

  return Math.min(intentScore + growthScore + trendScore, 100);
}

function dedupeOpportunities(items: SeoOpportunity[]) {
  const map = new Map<string, SeoOpportunity>();

  for (const item of items) {
    const key = [
      item.countryCode,
      item.marketSlug,
      item.categorySlug,
      item.subcategorySlug,
      item.intentSlug,
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