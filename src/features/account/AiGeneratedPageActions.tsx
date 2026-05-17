"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AiGeneratedPageActionsProps = {
  pageId: string;
  targetUrl: string;
  status: string;
};

export function AiGeneratedPageActions({
  pageId,
  targetUrl,
  status,
}: AiGeneratedPageActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function publishPage() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/internal/ai-agents/generated-pages/${pageId}/publish`,
        {
          method: "POST",
        }
      );

      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        alert(result.error ?? "Unable to publish page.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-sm">
      {status !== "published" ? (
        <button
          type="button"
          className="button button-primary"
          disabled={loading}
          onClick={publishPage}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      ) : (
        <a href={targetUrl} className="button button-primary">
          Open published page
        </a>
      )}
    </div>
  );
}