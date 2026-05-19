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

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
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
            content: `${args.system}\nReturn only valid JSON.`,
          },
          {
            role: "user",
            content: [
              args.prompt,
              "",
              "JSON schema description:",
              JSON.stringify(args.schema.schema),
            ].join("\n"),
          },
        ],
        response_format: {
          type: "json_object",
        },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("Groq response did not include JSON content.");
  }

  return parseJsonResponse<T>(content);
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