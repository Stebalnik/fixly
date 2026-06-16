import { GoogleGenerativeAI } from "@google/generative-ai";

type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
};

type GenerateJsonArgs = {
  system: string;
  prompt: string;
  schema: JsonSchema;
  temperature?: number;
};

type GroqResponseFormat =
  | { type: "json_object" }
  | {
      type: "json_schema";
      json_schema: {
        name: string;
        schema: Record<string, unknown>;
        strict: true;
      };
    };

const GROQ_STRUCTURED_OUTPUT_MODELS = new Set([
  "moonshotai/kimi-k2-instruct",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "meta-llama/llama-4-scout-17b-16e-instruct",
]);

export async function generateJson<T>(args: GenerateJsonArgs): Promise<T> {
  const provider = (process.env.LLM_PROVIDER ?? "gemini").toLowerCase();

  if (provider === "gemini") {
    return generateGeminiJson<T>(args);
  }

  if (provider === "groq") {
    return generateGroqJson<T>(args);
  }

  if (provider === "xai" || provider === "grok") {
    return generateXaiJson<T>(args);
  }

  throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
}

async function generateGeminiJson<T>(args: GenerateJsonArgs): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: args.system,
    generationConfig: {
      temperature: args.temperature ?? 0.4,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent([
    [
      "Return only valid JSON.",
      "The JSON must match this schema description:",
      JSON.stringify(args.schema.schema),
      "",
      args.prompt,
    ].join("\n"),
  ]);

  const text = result.response.text();

  if (!text) {
    throw new Error("Gemini response did not include JSON content.");
  }

  return parseJsonResponse<T>(text);
}

async function generateGroqJson<T>(args: GenerateJsonArgs): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY.");
  }

  const content = await requestGroqJsonContent({
    apiKey,
    model,
    args,
    responseFormat: getGroqResponseFormat(model, args.schema),
  });

  try {
    return parseJsonResponse<T>(content);
  } catch (parseError) {
    const repaired = await repairGroqJsonContent({
      apiKey,
      model,
      args,
      invalidContent: content,
      parseError,
      responseFormat: getGroqResponseFormat(model, args.schema),
    });

    try {
      return parseJsonResponse<T>(repaired);
    } catch (repairParseError) {
      throw new Error(
        [
          "Groq returned invalid JSON after retry/repair.",
          `Initial parse error: ${getErrorMessage(parseError)}`,
          `Repair parse error: ${getErrorMessage(repairParseError)}`,
        ].join(" ")
      );
    }
  }
}

async function requestGroqJsonContent(args: {
  apiKey: string;
  model: string;
  args: GenerateJsonArgs;
  responseFormat: GroqResponseFormat;
}) {
  const first = await requestGroqCompletion({
    ...args,
    retry: false,
    temperature: args.args.temperature ?? 0.4,
  });

  if (first.ok) {
    return first.content;
  }

  if (shouldRetryGroqJsonFailure(first.status, first.text)) {
    const retry = await requestGroqCompletion({
      ...args,
      retry: true,
      temperature: Math.min(args.args.temperature ?? 0.4, 0.2),
      responseFormat:
        args.responseFormat.type === "json_schema"
          ? { type: "json_object" }
          : args.responseFormat,
    });

    if (retry.ok) {
      return retry.content;
    }

    throw new Error(`Groq request failed: ${retry.status} ${retry.text}`);
  }

  throw new Error(`Groq request failed: ${first.status} ${first.text}`);
}

async function requestGroqCompletion(args: {
  apiKey: string;
  model: string;
  args: GenerateJsonArgs;
  responseFormat: GroqResponseFormat;
  retry: boolean;
  temperature: number;
}): Promise<
  | {
      ok: true;
      content: string;
    }
  | {
      ok: false;
      status: number;
      text: string;
    }
> {
  const retryInstruction = args.retry
    ? [
        "The previous attempt failed JSON validation.",
        "Regenerate from scratch as valid JSON only.",
        "Escape every quote inside strings.",
        "Avoid raw inch notation such as 42\"; write 42-inch or escape the quote.",
      ].join(" ")
    : "";

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: args.model,
        temperature: args.temperature,
        messages: [
          {
            role: "system",
            content: [
              args.args.system,
              "Return only one valid JSON object.",
              "Do not include markdown, prose, comments, or code fences.",
              "All strings must be valid JSON strings with escaped internal quotes.",
              "For measurements, prefer wording like 42-inch instead of raw inch marks.",
              retryInstruction,
            ]
              .filter(Boolean)
              .join("\n"),
          },
          {
            role: "user",
            content: [
              args.args.prompt,
              "",
              "JSON schema description:",
              JSON.stringify(args.args.schema.schema),
            ].join("\n"),
          },
        ],
        response_format: args.responseFormat,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    return {
      ok: false,
      status: response.status,
      text,
    };
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("Groq response did not include JSON content.");
  }

  return {
    ok: true,
    content,
  };
}

async function repairGroqJsonContent(args: {
  apiKey: string;
  model: string;
  args: GenerateJsonArgs;
  invalidContent: string;
  parseError: unknown;
  responseFormat: GroqResponseFormat;
}) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: args.model,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: [
              "You repair malformed JSON.",
              "Return only one valid JSON object matching the schema.",
              "Do not include markdown, prose, comments, or code fences.",
              "Preserve the original data where possible.",
              "Escape internal quotes in strings and prefer 42-inch style measurements.",
            ].join("\n"),
          },
          {
            role: "user",
            content: [
              `Parse error: ${getErrorMessage(args.parseError)}`,
              "",
              "Malformed JSON:",
              truncateForPrompt(args.invalidContent),
              "",
              "JSON schema description:",
              JSON.stringify(args.args.schema.schema),
            ].join("\n"),
          },
        ],
        response_format:
          args.responseFormat.type === "json_schema"
            ? { type: "json_object" }
            : args.responseFormat,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq JSON repair failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("Groq JSON repair did not include JSON content.");
  }

  return content;
}

function getGroqResponseFormat(
  model: string,
  schema: JsonSchema
): GroqResponseFormat {
  const configured = process.env.GROQ_RESPONSE_FORMAT?.toLowerCase();

  if (
    configured === "json_schema" ||
    GROQ_STRUCTURED_OUTPUT_MODELS.has(model)
  ) {
    return {
      type: "json_schema",
      json_schema: {
        name: schema.name,
        schema: schema.schema,
        strict: true,
      },
    };
  }

  return {
    type: "json_object",
  };
}

function shouldRetryGroqJsonFailure(status: number, text: string) {
  if (status !== 400 && status !== 422) {
    return false;
  }

  const normalized = text.toLowerCase();

  return (
    normalized.includes("json_validate_failed") ||
    normalized.includes("failed to generate json") ||
    normalized.includes("response_format") ||
    normalized.includes("json_schema")
  );
}

async function generateXaiJson<T>(args: GenerateJsonArgs): Promise<T> {
  const apiKey = process.env.XAI_API_KEY;
  const model = process.env.XAI_MODEL ?? "grok-4.3";

  if (!apiKey) {
    throw new Error("Missing XAI_API_KEY.");
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: args.temperature ?? 0.4,
      messages: [
        {
          role: "system",
          content: args.system,
        },
        {
          role: "user",
          content: args.prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: args.schema.name,
          schema: args.schema.schema,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`xAI request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("xAI response did not include JSON content.");
  }

  return parseJsonResponse<T>(content);
}

function parseJsonResponse<T>(value: string): T {
  const cleaned = value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned) as T;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function truncateForPrompt(value: string) {
  return value.length > 12_000 ? `${value.slice(0, 12_000)}\n...` : value;
}
