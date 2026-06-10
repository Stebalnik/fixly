import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type BigQueryTrendRow = {
  refresh_date?: { value?: string } | string;
  country_code?: string;
  region_name?: string | null;
  term?: string;
  rank?: number | string | null;
  score?: number | string | null;
};

const CATEGORY_TERMS = [
  "handyman",
  "home repair",
  "property maintenance",
  "home maintenance",
  "furniture assembly",
  "tv mounting",
  "door repair",
  "window repair",
  "drywall",
  "wall repair",
  "caulking",

  "plumber",
  "plumbing",
  "leak repair",
  "water leak",
  "pipe leak",
  "burst pipe",
  "drain cleaning",
  "clogged drain",
  "clogged toilet",
  "toilet repair",
  "faucet",
  "sink repair",
  "garbage disposal",
  "sump pump",
  "water heater",
  "sewer line",
  "backflow",

  "electrician",
  "electrical",
  "breaker panel",
  "electrical panel",
  "panel upgrade",
  "outlet",
  "light fixture",
  "ceiling fan",
  "ev charger",
  "generator",
  "wiring",
  "power outage",

  "cleaning",
  "cleaner",
  "house cleaning",
  "deep clean",
  "deep cleaning",
  "maid service",
  "move out cleaning",
  "move-in cleaning",
  "post construction cleaning",
  "carpet cleaning",
  "upholstery cleaning",
  "window cleaning",

  "painting",
  "painter",
  "interior painting",
  "exterior painting",
  "cabinet painting",
  "ceiling painting",
  "popcorn ceiling",
  "wallpaper removal",

  "lawn",
  "lawn care",
  "lawn mowing",
  "landscaping",
  "yard cleanup",
  "leaf removal",
  "sod",
  "mulch",
  "hedge trimming",
  "sprinkler",
  "tree removal",
  "stump removal",
  "snow removal",

  "pool cleaning",
  "pool maintenance",
  "pool pump",
  "pool filter",
  "pool heater",
  "green pool",
  "pool leak",

  "roof",
  "roofing",
  "roofer",
  "roof repair",
  "roof leak",
  "roof replacement",
  "storm damage",
  "shingles",
  "metal roof",
  "flat roof",
  "gutter",
  "gutter cleaning",
  "gutter repair",

  "appliance",
  "appliance repair",
  "washer repair",
  "dryer repair",
  "refrigerator repair",
  "freezer repair",
  "dishwasher repair",
  "oven repair",
  "stove repair",
  "microwave repair",
  "dryer vent",

  "pressure washing",
  "power washing",
  "soft washing",
  "driveway cleaning",
  "house washing",
  "junk",
  "junk removal",
  "furniture removal",
  "mattress removal",
  "appliance removal",
  "garage cleanout",
  "construction debris",

  "fence",
  "fencing",
  "fence repair",
  "fence installation",
  "gate repair",
  "awning",
  "retractable awning",
  "canopy",

  "remodel",
  "remodeling",
  "renovation",
  "kitchen remodel",
  "bathroom remodel",
  "basement remodel",
  "home addition",
  "cabinet",
  "countertop",
  "backsplash",
  "flooring",
  "floor installation",
  "floor repair",
  "hardwood floor",
  "vinyl plank",
  "laminate flooring",
  "tile installation",
  "carpet installation",

  "hvac",
  "ac repair",
  "air conditioning",
  "furnace",
  "furnace repair",
  "heat pump",
  "mini split",
  "thermostat",
  "ductwork",

  "garage door",
  "garage door repair",
  "garage door opener",
  "spring replacement",
  "pest",
  "pest control",
  "exterminator",
  "termite",
  "bed bug",
  "rodent",
  "mosquito",
  "wasp",
  "mold",

  "movers",
  "moving",
  "moving service",
  "packing",
  "loading help",
];

const EXCLUDED_TERMS = [
  "song",
  "lyrics",
  "movie",
  "film",
  "game",
  "video game",
  "celebrity",
  "actor",
  "actress",
  "football",
  "basketball",
  "baseball",
  "nfl",
  "nba",
  "mlb",
  "stock",
  "crypto",
  "coin",
];

export async function runBigQueryTrendsIngestAgent() {
  const admin = createSupabaseAdminClient();

  const { data: run, error: runError } = await admin
    .from("ai_agent_runs")
    .insert({
      agent_name: "bigquery_trends_ingest_agent",
      status: "running",
      metadata: {
        source: "bigquery_google_trends",
      },
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(runError?.message ?? "Unable to create agent run.");
  }

  try {
    if (process.env.BIGQUERY_TRENDS_ENABLED !== "true") {
      await finishRun(run.id, {
        status: "completed",
        summary: "BigQuery Trends ingest is disabled.",
        metadata: {
          source: "bigquery_google_trends",
          disabled: true,
        },
      });

      return {
        ok: true,
        runId: run.id,
        disabled: true,
        signalsCreated: 0,
      };
    }

    const projectId = requireEnv("GOOGLE_CLOUD_PROJECT_ID");
    const countries = getEnvList("BIGQUERY_TRENDS_COUNTRIES", ["US"]);
    const lookbackDays = getEnvNumber("BIGQUERY_TRENDS_LOOKBACK_DAYS", 1);
    const limit = getEnvNumber("BIGQUERY_TRENDS_LIMIT", 500);
    const maxBytesPerRun = getEnvNumber(
      "BIGQUERY_TRENDS_MAX_BYTES_PER_RUN",
      2_147_483_648
    );
    const monthlyMaxBytes = getEnvNumber(
      "BIGQUERY_TRENDS_MONTHLY_MAX_BYTES",
      536_870_912_000
    );

    const monthlyBytes = await getCurrentMonthBytesProcessed();

    if (monthlyBytes >= monthlyMaxBytes) {
      await finishRun(run.id, {
        status: "completed",
        summary: "Monthly BigQuery Trends byte cap reached. Skipping run.",
        metadata: {
          source: "bigquery_google_trends",
          monthlyBytes,
          monthlyMaxBytes,
          skipped: true,
          reason: "monthly_cap_reached",
        },
      });

      return {
        ok: true,
        runId: run.id,
        skipped: true,
        reason: "monthly_cap_reached",
        signalsCreated: 0,
      };
    }

    const { BigQuery } = await import("@google-cloud/bigquery");
    const bigquery = new BigQuery({ projectId });
    const query = buildQuery({ countries, lookbackDays, limit });

    const [dryRunJob] = await bigquery.createQueryJob({
      query,
      location: "US",
      dryRun: true,
      useLegacySql: false,
    });

    const bytesProcessed = Number(
      dryRunJob.metadata.statistics?.totalBytesProcessed ?? 0
    );

    if (bytesProcessed > maxBytesPerRun) {
      await finishRun(run.id, {
        status: "completed",
        summary: `Dry run estimated ${bytesProcessed} bytes, above per-run cap ${maxBytesPerRun}. Skipping query.`,
        metadata: {
          source: "bigquery_google_trends",
          bytesProcessed,
          maxBytesPerRun,
          monthlyBytes,
          monthlyMaxBytes,
          skipped: true,
          reason: "per_run_cap_exceeded",
        },
      });

      return {
        ok: true,
        runId: run.id,
        skipped: true,
        reason: "per_run_cap_exceeded",
        bytesProcessed,
        signalsCreated: 0,
      };
    }

    const [rows] = await bigquery.query({
      query,
      location: "US",
      useLegacySql: false,
    });

    const signals = ((rows ?? []) as BigQueryTrendRow[])
      .map(mapTrendRowToSignal)
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .filter((item) => isHomeServiceQuery(item.normalized_query));

    const dedupedSignals = dedupeSignals(signals);

    let signalsCreated = 0;

    if (dedupedSignals.length > 0) {
      const { error: insertError } = await admin
        .from("ai_trend_signals")
        .insert(dedupedSignals);

      if (insertError) {
        throw new Error(insertError.message);
      }

      signalsCreated = dedupedSignals.length;
    }

    await finishRun(run.id, {
      status: "completed",
      summary: `Imported ${signalsCreated} BigQuery Google Trends signals.`,
      metadata: {
        source: "bigquery_google_trends",
        countries,
        lookbackDays,
        limit,
        rowsReturned: rows.length,
        filteredSignals: signals.length,
        signalsCreated,
        bytesProcessed,
        monthlyBytesBeforeRun: monthlyBytes,
        monthlyMaxBytes,
      },
    });

    return {
      ok: true,
      runId: run.id,
      rowsReturned: rows.length,
      filteredSignals: signals.length,
      signalsCreated,
      bytesProcessed,
    };
  } catch (error) {
    await finishRun(run.id, {
      status: "failed",
      summary: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        source: "bigquery_google_trends",
      },
    });

    throw error;
  }
}

function buildQuery(args: {
  countries: string[];
  lookbackDays: number;
  limit: number;
}) {
  const countriesSql = args.countries
    .map((country) => `'${country.replace(/'/g, "")}'`)
    .join(", ");

  return `
    select
      refresh_date,
      country_code,
      region_name,
      term,
      rank,
      score
    from \`bigquery-public-data.google_trends.international_top_rising_terms\`
    where refresh_date >= date_sub(current_date(), interval ${args.lookbackDays} day)
      and country_code in (${countriesSql})
    order by refresh_date desc, country_code asc, rank asc
    limit ${args.limit}
  `;
}

function mapTrendRowToSignal(row: BigQueryTrendRow) {
  const rawQuery = row.term?.trim();

  if (!rawQuery) {
    return null;
  }

  const countryCode = row.country_code?.toLowerCase() ?? "us";
  const normalizedQuery = normalizeQuery(rawQuery);
  const trendScore = normalizeTrendScore(row.score, row.rank);

  return {
    country_code: countryCode,
    region: row.region_name ?? null,
    raw_query: rawQuery,
    normalized_query: normalizedQuery,
    trend_score: trendScore,
    growth_type: "rising",
    source: "bigquery_google_trends",
    observed_at: getRefreshDate(row.refresh_date),
    metadata: {
      source: "bigquery_google_trends",
      rank: row.rank ?? null,
      score: row.score ?? null,
      regionName: row.region_name ?? null,
    },
  };
}

function normalizeQuery(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function isHomeServiceQuery(query: string) {
  const normalized = query.toLowerCase();

  if (EXCLUDED_TERMS.some((term) => hasPhrase(normalized, term))) {
    return false;
  }

  return CATEGORY_TERMS.some((term) => hasPhrase(normalized, term));
}

function hasPhrase(value: string, phrase: string) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|\\W)${escaped}(\\W|$)`, "i");

  return pattern.test(value);
}

function normalizeTrendScore(
  score: number | string | null | undefined,
  rank: number | string | null | undefined
) {
  const numericScore = Number(score);

  if (Number.isFinite(numericScore) && numericScore > 0) {
    return Math.min(Math.round(numericScore), 100);
  }

  const numericRank = Number(rank);

  if (Number.isFinite(numericRank) && numericRank > 0) {
    return Math.max(1, 26 - numericRank);
  }

  return 10;
}

function getRefreshDate(value: BigQueryTrendRow["refresh_date"]) {
  if (!value) {
    return new Date().toISOString();
  }

  if (typeof value === "string") {
    return new Date(value).toISOString();
  }

  if (typeof value.value === "string") {
    return new Date(value.value).toISOString();
  }

  return new Date().toISOString();
}

function dedupeSignals<
  T extends {
    normalized_query: string;
    country_code: string;
    region: string | null;
  },
>(items: T[]) {
  const map = new Map<string, T>();

  for (const item of items) {
    const key = [
      item.country_code,
      item.region ?? "",
      item.normalized_query,
    ].join(":");

    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

async function getCurrentMonthBytesProcessed() {
  const admin = createSupabaseAdminClient();

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data, error } = await admin
    .from("ai_agent_runs")
    .select("metadata")
    .eq("agent_name", "bigquery_trends_ingest_agent")
    .gte("started_at", monthStart.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce((sum, row) => {
    const metadata = row.metadata as Record<string, unknown> | null;
    const bytes = Number(metadata?.bytesProcessed ?? 0);

    return Number.isFinite(bytes) ? sum + bytes : sum;
  }, 0);
}

async function finishRun(
  runId: string,
  args: {
    status: "completed" | "failed";
    summary: string;
    metadata: Record<string, unknown>;
  }
) {
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("ai_agent_runs")
    .update({
      status: args.status,
      summary: args.summary,
      metadata: args.metadata,
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (error) {
    throw new Error(error.message);
  }
}

function getEnvList(key: string, fallback: string[]) {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function getEnvNumber(key: string, fallback: number) {
  const value = Number(process.env[key]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function requireEnv(key: string) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing ${key}`);
  }

  return value;
}
