import {
  dispatchAiAgentResponse,
  isAuthorizedAiAgentRequest,
  unauthorizedAiAgentResponse,
} from "@/lib/ai-agents/internal-route";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedAiAgentRequest(request)) {
    return unauthorizedAiAgentResponse();
  }

  return dispatchAiAgentResponse("seo-growth-orchestrator");
}
