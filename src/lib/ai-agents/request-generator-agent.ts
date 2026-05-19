import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAllMarketsByCountry } from "@/lib/geo";
import { categories } from "@/lib/services/categories";
import { generateJson } from "@/lib/llm/provider";

type GeneratedRequest = {
  categorySlug: string;
  subcategorySlug: string | null;
  title: string;
  description: string;
  urgency: "flexible" | "this_week" | "same_day" | "emergency";
};

type GeneratedRequestsResponse = {
  requests: GeneratedRequest[];
};

const DEFAULT_COUNTRIES = ["us", "ca", "gb", "au", "nz"];

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

      return {
        ok: true,
        runId: run.id,
        disabled: true,
        createdCount: 0,
      };
    }

    const count = getEnvNumber("SERVICE_REQUEST_GENERATOR_LIMIT", 10);
    const countries = getEnvList(
      "SERVICE_REQUEST_GENERATOR_COUNTRIES",
      DEFAULT_COUNTRIES
    );

    const markets = countries
      .flatMap((country) => getAllMarketsByCountry(country))
      .filter((market) => market.city && market.slug && market.countryCode)
      .slice(0, 500);

    if (markets.length === 0) {
      throw new Error("No markets available for service request generation.");
    }

    const selectedMarkets = shuffle(markets).slice(0, Math.max(count, 1));
    const categoryList = Object.values(categories).slice(0, 30);

    const prompt = [
      `Generate ${count} realistic but fully synthetic homeowner service requests for Fixly.work.`,
      "",
      "Rules:",
      "- Do NOT use real people, real phone numbers, real emails, or real addresses.",
      "- Do NOT include personal contact information.",
      "- Make each request sound like a real homeowner wrote it.",
      "- Descriptions must be useful for SEO and public request pages.",
      "- Each description should be 90-180 words.",
      "- Keep requests varied across categories, urgency, cities, and home situations.",
      "- Use only the provided categorySlug and optional subcategorySlug values.",
      "",
      "Available markets:",
      JSON.stringify(
        selectedMarkets.map((market) => ({
          city: market.city,
          state: market.state,
          countryCode: market.countryCode.toLowerCase(),
          marketSlug: market.slug,
        }))
      ),
      "",
      "Available categories:",
      JSON.stringify(
        categoryList.map((category) => ({
          categorySlug: category.slug,
          title: category.title,
          subcategories: category.subcategories,
        }))
      ),
      "",
      "Return JSON only.",
    ].join("\n");

    const generated = await generateJson<GeneratedRequestsResponse>({
      temperature: 0.55,
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
                required: [
                  "categorySlug",
                  "subcategorySlug",
                  "title",
                  "description",
                  "urgency",
                ],
                properties: {
                  categorySlug: { type: "string" },
                  subcategorySlug: {
                    anyOf: [{ type: "string" }, { type: "null" }],
                  },
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
    const rows = generated.requests
      .slice(0, count)
      .map((request, index) => {
        const market = selectedMarkets[index % selectedMarkets.length];
        const category = categories[request.categorySlug];

        if (!market || !category) {
          return null;
        }

        const subcategorySlug =
          request.subcategorySlug &&
          category.subcategories.includes(request.subcategorySlug)
            ? request.subcategorySlug
            : null;

        const title = cleanPublicText(request.title);
        const description = cleanPublicText(
          `${title}. ${request.description}`
        );

        if (description.length < 80) {
          return null;
        }

        return {
          public_slug: makePublicSlug({
            city: market.city,
            state: market.state,
            categorySlug: category.slug,
            subcategorySlug,
            title,
            index,
          }),
          category_slug: category.slug,
          subcategory_slug: subcategorySlug,
          market_slug: market.slug,
          city: market.city,
          state: market.state,
          country_code: market.countryCode.toLowerCase(),
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
      `Generated ${createdCount} synthetic service requests.`,
      {
        source: "llm_synthetic_requests",
        createdCount,
        requestedCount: count,
        countries,
      }
    );

    return {
      ok: true,
      runId: run.id,
      createdCount,
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