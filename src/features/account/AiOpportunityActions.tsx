"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AiOpportunityActionsProps = {
  opportunityId: string;
};

export function AiOpportunityActions({
  opportunityId,
}: AiOpportunityActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function updateStatus(status: "approved" | "ignored" | "in_progress") {
    setLoadingAction(status);

    try {
      const response = await fetch(
        `/api/internal/ai-agents/seo-opportunities/${opportunityId}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        alert("Unable to update opportunity status.");
        return;
      }

      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  async function generateDraft() {
    setLoadingAction("generate_draft");

    try {
      const response = await fetch(
        `/api/internal/ai-agents/seo-opportunities/${opportunityId}/generate-draft`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        alert("Unable to generate draft.");
        return;
      }

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
        disabled={Boolean(loadingAction)}
        onClick={() => updateStatus("approved")}
      >
        {loadingAction === "approved" ? "Approving..." : "Approve"}
      </button>

      <button
        type="button"
        className="button button-secondary"
        disabled={Boolean(loadingAction)}
        onClick={generateDraft}
      >
        {loadingAction === "generate_draft"
          ? "Generating..."
          : "Generate draft"}
      </button>

      <button
        type="button"
        className="button button-secondary"
        disabled={Boolean(loadingAction)}
        onClick={() => updateStatus("in_progress")}
      >
        {loadingAction === "in_progress" ? "Starting..." : "Start"}
      </button>

      <button
        type="button"
        className="button button-outline"
        disabled={Boolean(loadingAction)}
        onClick={() => updateStatus("ignored")}
      >
        {loadingAction === "ignored" ? "Ignoring..." : "Ignore"}
      </button>
    </div>
  );
}