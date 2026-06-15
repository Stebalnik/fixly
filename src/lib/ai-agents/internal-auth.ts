import { NextResponse } from "next/server";

type InternalAiAgentAuthResult =
  | {
      ok: true;
      token: string;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export function getInternalAiAgentToken() {
  const token = process.env.INTERNAL_AI_AGENT_TOKEN;

  return token && token.length > 0 ? token : null;
}

export function internalAiAgentTokenMissingResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "INTERNAL_AI_AGENT_TOKEN is not configured on server.",
    },
    { status: 500 }
  );
}

export function requireInternalAiAgentAuth(
  request: Request
): InternalAiAgentAuthResult {
  const expectedToken = getInternalAiAgentToken();

  if (!expectedToken) {
    return {
      ok: false,
      response: internalAiAgentTokenMissingResponse(),
    };
  }

  if (request.headers.get("authorization") !== `Bearer ${expectedToken}`) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true,
    token: expectedToken,
  };
}
