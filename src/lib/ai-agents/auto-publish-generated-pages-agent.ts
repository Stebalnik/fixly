import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { reviewAndPublishGeneratedPage } from "@/lib/ai-agents/page-quality-review-agent";

type GeneratedPageRow = {
  id: string;
};

export async function runAutoPublishGeneratedPagesAgent() {
  const admin = createSupabaseAdminClient();

  const { data: run, error: runError } = await admin
    .from("ai_agent_runs")
    .insert({
      agent_name: "auto_publish_generated_pages_agent",
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
      .select("id")
      .in("status", ["draft", "needs_review"])
      .order("created_at", { ascending: true })
      .limit(25);

    if (error) {
      throw new Error(error.message);
    }

    let publishedCount = 0;
    let rejectedCount = 0;

    for (const page of (pages ?? []) as GeneratedPageRow[]) {
      const result = await reviewAndPublishGeneratedPage(page.id);

      if (result.qualityStatus === "approved") {
        publishedCount += 1;
      } else {
        rejectedCount += 1;
      }
    }

    await admin
      .from("ai_agent_runs")
      .update({
        status: "completed",
        summary: `Reviewed ${
          pages?.length ?? 0
        } generated pages. Published ${publishedCount}. Rejected ${rejectedCount}.`,
        finished_at: new Date().toISOString(),
        metadata: {
          source: "ai_generated_pages",
          reviewedCount: pages?.length ?? 0,
          publishedCount,
          rejectedCount,
        },
      })
      .eq("id", run.id);

    return {
      ok: true,
      runId: run.id,
      reviewedCount: pages?.length ?? 0,
      publishedCount,
      rejectedCount,
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