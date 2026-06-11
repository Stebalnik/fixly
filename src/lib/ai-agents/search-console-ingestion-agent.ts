import { google } from "googleapis";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SearchConsoleRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

export async function runSearchConsoleIngestionAgent() {
  const admin = createSupabaseAdminClient();

  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
  const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;

  if (!siteUrl || !clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google Search Console env variables.");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const searchconsole = google.searchconsole({
    version: "v1",
    auth: oauth2Client,
  });

  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 14);

  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: toDateString(startDate),
      endDate: toDateString(endDate),
      dimensions: ["query"],
      rowLimit: 250,
    },
  });

  const rows = (response.data.rows ?? []) as SearchConsoleRow[];

  const trendRows = rows
    .filter((row) => {
      const query = row.keys?.[0]?.trim();
      return Boolean(query) && (row.impressions ?? 0) >= 1;
    })
    .map((row) => {
      const query = row.keys?.[0]?.trim() ?? "";
      const impressions = row.impressions ?? 0;
      const clicks = row.clicks ?? 0;
      const position = row.position ?? 0;

      return {
        source: "google_search_console",
        country_code: "us",
        region: null,
        raw_query: query,
        normalized_query: query.toLowerCase(),
        trend_score: calculateTrendScore({
          impressions,
          clicks,
          position,
        }),
        growth_type: "observed",
        related_queries: [],
        metadata: {
          clicks,
          impressions,
          ctr: row.ctr ?? 0,
          position,
          startDate: toDateString(startDate),
          endDate: toDateString(endDate),
        },
      };
    });

  if (trendRows.length > 0) {
    const { error } = await admin.from("ai_trend_signals").insert(trendRows);

    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    ok: true,
    signalsCreated: trendRows.length,
    startDate: toDateString(startDate),
    endDate: toDateString(endDate),
  };
}

function calculateTrendScore(args: {
  impressions: number;
  clicks: number;
  position: number;
}) {
  const impressionScore = Math.min(Math.round(args.impressions / 5), 50);
  const clickScore = Math.min(args.clicks * 10, 30);
  const positionScore =
    args.position > 0 && args.position <= 20
      ? 20
      : args.position <= 50
        ? 10
        : 5;

  return Math.min(impressionScore + clickScore + positionScore, 100);
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}