import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { categories } from "@/lib/services/categories";
import { getAllMarketsByCountry, getMarketUrlPath } from "@/lib/geo";
import { supportedCountryCodes } from "@/lib/geo/country-options";
import type { SeoOpportunity } from "./types";

type ExistingOpportunityRow = {
  country_code: string | null;
  market_slug: string | null;
  category_slug: string | null;
  subcategory_slug: string | null;
  intent_slug: string | null;
  target_url: string | null;
};

type GeneratedPageRow = {
  target_url: string | null;
  status: string | null;
};

type ExpansionCandidate = SeoOpportunity & {
  sortScore: number;
};

const DEFAULT_COUNTRIES = supportedCountryCodes;

const INTENTS = [
  {
    slug: "price",
    label: "price",
    priority: 90,
    searchModifier: "cost",
    recommendationFocus:
      "Include a direct cost answer, price ranges, factors that affect price, local context, FAQ, internal links, and a strong CTA.",
  },
  {
    slug: "same-day",
    label: "same-day",
    priority: 86,
    searchModifier: "same day",
    recommendationFocus:
      "Include same-day availability context, urgent-but-not-emergency use cases, what customers should prepare, FAQ, internal links, and CTA.",
  },
  {
    slug: "emergency",
    label: "emergency",
    priority: 84,
    searchModifier: "emergency",
    recommendationFocus:
      "Include emergency scenarios, when to call immediately, safety guidance, local response context, FAQ, internal links, and CTA.",
  },
  {
    slug: "near-me",
    label: "near me",
    priority: 80,
    searchModifier: "near me",
    recommendationFocus:
      "Include local matching context, nearby service availability, how Fixly connects customers with pros, FAQ, internal links, and CTA.",
  },
] as const;

const CATEGORY_PRIORITY: Record<string, number> = {
  plumbing: 10,
  electrical: 10,
  handyman: 9,
  cleaning: 9,
  roofing: 9,
  hvac: 9,
  "appliance-repair": 8,
  "lawn-care": 8,
  painting: 8,
  remodeling: 7,
  flooring: 7,
  "garage-door": 7,
  "pest-control": 7,
  "junk-removal": 6,
  "pressure-washing": 6,
};

export async function runInternalSeoExpansionAgent() {
  const admin = createSupabaseAdminClient();

  const { data: run, error: runError } = await admin
    .from("ai_agent_runs")
    .insert({
      agent_name: "internal_seo_expansion_agent",
      status: "running",
      metadata: {
        source: "internal_geo_service_architecture",
      },
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message ?? "Unable to create agent run.");
  }

  try {
    const countries = getEnvList("INTERNAL_SEO_EXPANSION_COUNTRIES", DEFAULT_COUNTRIES);
    const limit = getEnvNumber("INTERNAL_SEO_EXPANSION_LIMIT", 50);
    const includeSubcategories =
      process.env.INTERNAL_SEO_EXPANSION_INCLUDE_SUBCATEGORIES !== "false";
    const maxMarketsPerCountry = getEnvNumber(
      "INTERNAL_SEO_EXPANSION_MAX_MARKETS_PER_COUNTRY",
      250
    );

    const existingKeys = await getExistingOpportunityKeys();
    const existingPublishedUrls = await getExistingPublishedTargetUrls();

    const candidates = generateCandidates({
      countries,
      includeSubcategories,
      maxMarketsPerCountry,
      existingKeys,
      existingPublishedUrls,
    });

    const selected = candidates
      .sort((a, b) => b.sortScore - a.sortScore)
      .slice(0, limit);

    let opportunitiesCreated = 0;

    if (selected.length > 0) {
      const rows = selected.map((item) => ({
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

      opportunitiesCreated = rows.length;
    }

    await admin
      .from("ai_agent_runs")
      .update({
        status: "completed",
        summary: `Generated ${opportunitiesCreated} internal SEO expansion opportunities.`,
        finished_at: new Date().toISOString(),
        metadata: {
          source: "internal_geo_service_architecture",
          countries,
          limit,
          includeSubcategories,
          maxMarketsPerCountry,
          candidatesFound: candidates.length,
          opportunitiesCreated,
        },
      })
      .eq("id", run.id);

    return {
      ok: true,
      runId: run.id,
      candidatesFound: candidates.length,
      opportunitiesCreated,
    };
  } catch (error) {
    await admin
      .from("ai_agent_runs")
      .update({
        status: "failed",
        summary: error instanceof Error ? error.message : "Unknown error",
        finished_at: new Date().toISOString(),
        metadata: {
          source: "internal_geo_service_architecture",
        },
      })
      .eq("id", run.id);

    throw error;
  }
}

function generateCandidates(args: {
  countries: string[];
  includeSubcategories: boolean;
  maxMarketsPerCountry: number;
  existingKeys: Set<string>;
  existingPublishedUrls: Set<string>;
}) {
  const candidates: ExpansionCandidate[] = [];
  const categoryList = Object.values(categories);

  for (const country of args.countries) {
    const markets = getAllMarketsByCountry(country)
      .filter((market) => Boolean(market.slug && market.city))
      .slice(0, args.maxMarketsPerCountry);

    for (const market of markets) {
      const marketPath = getMarketUrlPath(market);

      for (const category of categoryList) {
        for (const intent of INTENTS) {
          const targetUrl = `${marketPath}/${category.slug}/${intent.slug}`;
          const key = buildKey({
            countryCode: country,
            marketSlug: market.slug,
            categorySlug: category.slug,
            subcategorySlug: null,
            intentSlug: intent.slug,
          });

          if (args.existingKeys.has(key)) {
            continue;
          }

          if (args.existingPublishedUrls.has(targetUrl)) {
            continue;
          }

          candidates.push({
            countryCode: country,
            marketSlug: market.slug,
            categorySlug: category.slug,
            subcategorySlug: undefined,
            intentSlug: intent.slug,
            opportunityType: "missing_intent_page",
            title: `${category.shortTitle} ${intent.label} page in ${market.city}`,
            targetUrl,
            searchQuery: `${category.shortTitle} ${intent.searchModifier} ${market.city}`,
            priorityScore: getPriorityScore(category.slug, intent.priority),
            recommendation: `Create or improve a ${intent.label} intent page for ${category.shortTitle} in ${market.city}. ${intent.recommendationFocus}`,
            proposedAction: {
              pageType: "geo_category_intent",
              source: "internal_seo_expansion_agent",
              countryCode: country,
              marketSlug: market.slug,
              categorySlug: category.slug,
              intentSlug: intent.slug,
            },
            sortScore: getSortScore({
              countryCode: country,
              categorySlug: category.slug,
              intentSlug: intent.slug,
              basePriority: intent.priority,
            }),
          });
        }

        if (!args.includeSubcategories) {
          continue;
        }

        for (const subcategorySlug of category.subcategories ?? []) {
          for (const intent of INTENTS) {
            const targetUrl = `${marketPath}/${category.slug}/${subcategorySlug}/${intent.slug}`;
            const key = buildKey({
              countryCode: country,
              marketSlug: market.slug,
              categorySlug: category.slug,
              subcategorySlug,
              intentSlug: intent.slug,
            });

            if (args.existingKeys.has(key)) {
              continue;
            }

            if (args.existingPublishedUrls.has(targetUrl)) {
              continue;
            }

            candidates.push({
              countryCode: country,
              marketSlug: market.slug,
              categorySlug: category.slug,
              subcategorySlug,
              intentSlug: intent.slug,
              opportunityType: "missing_intent_page",
              title: `${humanizeSlug(subcategorySlug)} ${intent.label} page in ${market.city}`,
              targetUrl,
              searchQuery: `${humanizeSlug(subcategorySlug)} ${intent.searchModifier} ${market.city}`,
              priorityScore: Math.max(getPriorityScore(category.slug, intent.priority) - 4, 1),
              recommendation: `Create or improve a ${intent.label} intent page for ${humanizeSlug(
                subcategorySlug
              )} in ${market.city}. ${intent.recommendationFocus}`,
              proposedAction: {
                pageType: "geo_subcategory_intent",
                source: "internal_seo_expansion_agent",
                countryCode: country,
                marketSlug: market.slug,
                categorySlug: category.slug,
                subcategorySlug,
                intentSlug: intent.slug,
              },
              sortScore:
                getSortScore({
                  countryCode: country,
                  categorySlug: category.slug,
                  intentSlug: intent.slug,
                  basePriority: intent.priority,
                }) - 5,
            });
          }
        }
      }
    }
  }

  return dedupeCandidates(candidates);
}

async function getExistingOpportunityKeys() {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("ai_seo_opportunities")
    .select(
      "country_code, market_slug, category_slug, subcategory_slug, intent_slug, target_url"
    );

  if (error) {
    throw new Error(error.message);
  }

  const keys = new Set<string>();

  for (const row of (data ?? []) as ExistingOpportunityRow[]) {
    keys.add(
      buildKey({
        countryCode: row.country_code,
        marketSlug: row.market_slug,
        categorySlug: row.category_slug,
        subcategorySlug: row.subcategory_slug,
        intentSlug: row.intent_slug,
      })
    );

    if (row.target_url) {
      keys.add(`url:${row.target_url}`);
    }
  }

  return keys;
}

async function getExistingPublishedTargetUrls() {
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("ai_generated_pages")
    .select("target_url, status")
    .eq("status", "published");

  if (error) {
    throw new Error(error.message);
  }

  const urls = new Set<string>();

  for (const row of (data ?? []) as GeneratedPageRow[]) {
    if (row.target_url) {
      urls.add(row.target_url);
    }
  }

  return urls;
}

function buildKey(args: {
  countryCode: string | null | undefined;
  marketSlug: string | null | undefined;
  categorySlug: string | null | undefined;
  subcategorySlug: string | null | undefined;
  intentSlug: string | null | undefined;
}) {
  return [
    args.countryCode ?? "",
    args.marketSlug ?? "",
    args.categorySlug ?? "",
    args.subcategorySlug ?? "",
    args.intentSlug ?? "",
  ].join(":");
}

function dedupeCandidates(items: ExpansionCandidate[]) {
  const map = new Map<string, ExpansionCandidate>();

  for (const item of items) {
    const key = buildKey({
      countryCode: item.countryCode,
      marketSlug: item.marketSlug,
      categorySlug: item.categorySlug,
      subcategorySlug: item.subcategorySlug,
      intentSlug: item.intentSlug,
    });

    if (!map.has(key)) {
      map.set(key, item);
      continue;
    }

    const existing = map.get(key);

    if (existing && item.sortScore > existing.sortScore) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

function getPriorityScore(categorySlug: string, intentPriority: number) {
  const categoryBoost = CATEGORY_PRIORITY[categorySlug] ?? 5;

  return Math.min(intentPriority + categoryBoost, 100);
}

function getSortScore(args: {
  countryCode: string;
  categorySlug: string;
  intentSlug: string;
  basePriority: number;
}) {
  const countryBoost =
    args.countryCode === "us"
      ? 20
      : args.countryCode === "ca"
        ? 14
        : args.countryCode === "gb"
          ? 14
          : args.countryCode === "au"
            ? 12
            : args.countryCode === "nz"
              ? 8
              : 4;

  const categoryBoost = CATEGORY_PRIORITY[args.categorySlug] ?? 5;

  const intentBoost =
    args.intentSlug === "price"
      ? 12
      : args.intentSlug === "same-day"
        ? 10
        : args.intentSlug === "emergency"
          ? 9
          : args.intentSlug === "near-me"
            ? 7
            : 0;

  return args.basePriority + countryBoost + categoryBoost + intentBoost;
}

function humanizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
