import { requireAdminUser } from "@/lib/auth/admin";
import {
  getInternalAiAgentToken,
  internalAiAgentTokenMissingResponse,
} from "@/lib/ai-agents/internal-auth";
import { getRequestOrigin } from "@/lib/http/request-origin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdminUser();

  const token = getInternalAiAgentToken();

  if (!token) {
    return internalAiAgentTokenMissingResponse();
  }

  const body = await request.text();
  const internalUrl = new URL(
    "/api/internal/ai-agents/gsc-url-issue-audit",
    getRequestOrigin(request)
  );
  const requestUrl = new URL(request.url);

  requestUrl.searchParams.forEach((value, key) => {
    internalUrl.searchParams.set(key, value);
  });

  const response = await fetch(internalUrl, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type":
        request.headers.get("content-type") ?? "application/json",
    },
    body,
  });

  return forwardInternalResponse(response);
}

async function forwardInternalResponse(response: Response) {
  const headers = new Headers();
  const contentType = response.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  return new Response(await response.text(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
