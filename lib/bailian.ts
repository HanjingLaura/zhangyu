type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatOptions = {
  maxTokens?: number;
  temperature?: number;
};

const DEFAULT_BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const TIMEOUT_MS = 3500;

export function bailianEnabled() {
  return Boolean(process.env.DASHSCOPE_API_KEY?.trim());
}

export function parseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const tryParse = (raw: string) => {
    try {
      const value = JSON.parse(raw) as unknown;
      return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  };
  return tryParse(trimmed) ?? (trimmed.match(/\{[\s\S]*\}/) ? tryParse(trimmed.match(/\{[\s\S]*\}/)![0]) : null);
}

export function clipText(text: string, max: number) {
  return [...text.replace(/\s+/g, " ").trim()].slice(0, max).join("");
}

export async function bailianChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string | null> {
  const key = process.env.DASHSCOPE_API_KEY?.trim();
  if (!key) return null;

  const base = (process.env.DASHSCOPE_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const model = process.env.DASHSCOPE_MODEL?.trim() || "qwen-turbo";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 80,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
