import type { AiAgentJobName } from "./worker-jobs";
import { dispatchAiAgentJob } from "./worker-dispatch";

export function isAuthorizedAiAgentRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.INTERNAL_AI_AGENT_TOKEN;

  return Boolean(expectedToken && authHeader === `Bearer ${expectedToken}`);
}

export function unauthorizedAiAgentResponse() {
  return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
}

export function dispatchAiAgentResponse(job: AiAgentJobName) {
  const result = dispatchAiAgentJob(job);
  return Response.json(result);
}
