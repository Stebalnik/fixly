export const AI_AGENT_JOB_NAMES = [
  "auto-generate-drafts",
  "auto-publish-generated-pages",
  "bigquery-trends-ingest",
  "fix-rejected-pages",
  "generate-service-requests",
  "internal-seo-expansion",
  "search-console-ingest",
  "seo-growth-orchestrator",
  "seo-opportunities",
] as const;

export type AiAgentJobName = (typeof AI_AGENT_JOB_NAMES)[number];

export function isAiAgentJobName(value: string): value is AiAgentJobName {
  return AI_AGENT_JOB_NAMES.includes(value as AiAgentJobName);
}
