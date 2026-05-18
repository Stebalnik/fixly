"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AiGeneratedPageActionsProps = {
  pageId: string;
  targetUrl: string;
  status: string;
};

type ActionResult = {
  ok?: boolean;
  error?: string;
  status?: string;
  qualityScore?: number;
  qualityStatus?: string;
};

export function AiGeneratedPageActions({
  pageId,
  targetUrl,
  status,
}: AiGeneratedPageActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function reviewAndPublishPage() {
    if (loadingAction) return;

    setLoadingAction("review_publish");

    try {
      const response = await fetch(
        `/api/internal/ai-agents/generated-pages/${pageId}/review-and-publish`,
        {
          method: "POST",
        }
      );

      const result = (await response.json().catch(() => ({}))) as ActionResult;

      if (!response.ok || !result.ok) {
        alert(result.error ?? "Unable to review and publish page.");
        return;
      }

      alert(
        result.qualityStatus === "approved"
          ? `Published. Quality score: ${result.qualityScore}`
          : `Needs review. Quality score: ${result.qualityScore}`
      );

      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex gap-sm">
      {status !== "published" ? (
        <button
          type="button"
          className="button button-primary"
          disabled={Boolean(loadingAction)}
          onClick={reviewAndPublishPage}
        >
          {loadingAction === "review_publish"
            ? "Reviewing..."
            : "Review & Publish"}
        </button>
      ) : (
        <a href={targetUrl} className="button button-primary">
          Open published page
        </a>
      )}
    </div>
  );
}