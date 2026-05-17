"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AiOpportunityActionsProps = {
  opportunityId: string;
  status: string;
};

type GenerateDraftResult = {
  ok?: boolean;
  error?: string;
  pageId?: string;
  created?: boolean;
};

export function AiOpportunityActions({
  opportunityId,
  status,
}: AiOpportunityActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isApproved = status === "approved";
  const isBusy = Boolean(loadingAction);

  async function updateStatus(statusValue: "approved" | "ignored" | "in_progress") {
    if (isBusy) return;

    setLoadingAction(statusValue);

    try {
      const response = await fetch(
        `/api/internal/ai-agents/seo-opportunities/${opportunityId}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: statusValue }),
        }
      );

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        alert(result.error ?? "Unable to update opportunity status.");
        return;
      }

      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  async function generateDraft() {
    if (isBusy || !isApproved) return;

    setLoadingAction("generate_draft");

    try {
      const response = await fetch(
        `/api/internal/ai-agents/seo-opportunities/${opportunityId}/generate-draft`,
        {
          method: "POST",
        }
      );

      const result = (await response.json().catch(() => ({}))) as GenerateDraftResult;

      if (!response.ok || !result.ok) {
        alert(result.error ?? "Unable to generate draft.");
        return;
      }

      alert(result.created ? "Draft generated." : "Draft already exists.");
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex gap-sm">
      <button
        type="button"
        className="button button-primary"
        disabled={isBusy || status === "approved"}
        onClick={() => updateStatus("approved")}
      >
        {loadingAction === "approved" ? "Approving..." : "Approve"}
      </button>

      <button
        type="button"
        className="button button-secondary"
        disabled={isBusy || !isApproved}
        onClick={generateDraft}
        title={
          isApproved
            ? "Generate a draft page from this opportunity"
            : "Approve this opportunity before generating a draft"
        }
      >
        {loadingAction === "generate_draft"
          ? "Generating..."
          : "Generate draft"}
      </button>

      <button
        type="button"
        className="button button-secondary"
        disabled={isBusy || status === "in_progress"}
        onClick={() => updateStatus("in_progress")}
      >
        {loadingAction === "in_progress" ? "Starting..." : "Start"}
      </button>

      <button
        type="button"
        className="button button-outline"
        disabled={isBusy || status === "ignored"}
        onClick={() => updateStatus("ignored")}
      >
        {loadingAction === "ignored" ? "Ignoring..." : "Ignore"}
      </button>
    </div>
  );
}