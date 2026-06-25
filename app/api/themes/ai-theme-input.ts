import type { ThemeInput } from "@zeno-site/theme-engine";
import type { ThemeKnobs } from "@zeno-site/tokens";

type GeminiInteractionResponse = {
  output_text?: string;
};

export type ThemeGenerationSource = {
  enabled: boolean;
  model: string | null;
  provider: "deterministic" | "gemini";
  error?: string;
};

const trends: ThemeKnobs["trend"][] = ["minimal", "glassmorphism", "bento", "editorial", "brutalist", "clay"];
const moods: ThemeKnobs["mood"][] = ["clear", "rainy", "foggy", "neon", "warm", "cold", "luxury", "brutal"];
const motions: ThemeKnobs["motion"][] = ["minimal", "smooth", "playful", "energetic", "none"];

const themeInputSchema = {
  type: "object",
  properties: {
    trend: {
      type: "string",
      enum: trends,
      description: "The UI style direction."
    },
    mood: {
      type: "string",
      enum: moods,
      description: "The emotional tone of the interface."
    },
    motion: {
      type: "string",
      enum: motions,
      description: "The motion intensity for small UI transitions."
    },
    brand: {
      type: "string",
      pattern: "^#[0-9a-fA-F]{6}$",
      description: "Primary brand color as a six-digit hex color."
    },
    accent: {
      type: "string",
      pattern: "^#[0-9a-fA-F]{6}$",
      description: "Secondary accent color as a six-digit hex color."
    }
  },
  required: ["trend", "mood", "motion", "brand", "accent"]
};

function readGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || null;
}

function readGeminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-3.5-flash";
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function isOneOf<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function normalizeThemeInput(base: ThemeInput, patch: unknown): ThemeInput {
  const record = patch && typeof patch === "object" && !Array.isArray(patch)
    ? patch as Record<string, unknown>
    : {};

  const normalized: ThemeInput = {
    prompt: base.prompt,
    trend: isOneOf(record.trend, trends) ? record.trend : base.trend,
    mood: isOneOf(record.mood, moods) ? record.mood : base.mood,
    motion: isOneOf(record.motion, motions) ? record.motion : base.motion,
    brand: isHexColor(record.brand) ? record.brand : base.brand,
    accent: isHexColor(record.accent) ? record.accent : base.accent
  };

  if (base.seed) {
    normalized.seed = base.seed;
  }

  return normalized;
}

function isThemePatch(value: unknown): value is Record<string, unknown> {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;

  return Boolean(record && (
    isOneOf(record.trend, trends) ||
    isOneOf(record.mood, moods) ||
    isOneOf(record.motion, motions) ||
    isHexColor(record.brand) ||
    isHexColor(record.accent)
  ));
}

function parseJsonText(text: string): unknown {
  const trimmed = text.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const objectMatch = /\{[\s\S]*\}/.exec(trimmed);
    if (!objectMatch) throw new Error("Gemini returned text instead of JSON.");
    return JSON.parse(objectMatch[0]) as unknown;
  }
}

function collectGeminiTextBlocks(value: unknown, depth = 0): string[] {
  if (depth > 6 || !value || typeof value !== "object") return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectGeminiTextBlocks(item, depth + 1));
  }

  const record = value as Record<string, unknown>;
  const directText = ["output_text", "text"]
    .map((key) => record[key])
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
  const nestedText = ["output", "steps", "parts", "content", "candidates", "delta", "response"]
    .flatMap((key) => collectGeminiTextBlocks(record[key], depth + 1));

  return [...directText, ...nestedText];
}

function extractStructuredThemeOutput(result: unknown): unknown {
  if (isThemePatch(result)) return result;

  for (const text of collectGeminiTextBlocks(result)) {
    const parsed = parseJsonText(text);
    if (isThemePatch(parsed)) return parsed;
  }

  throw new Error("Gemini returned no usable theme JSON.");
}

async function callGeminiThemeParser(input: ThemeInput, apiKey: string, model: string): Promise<unknown> {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      model,
      system_instruction: [
        "You convert product theme prompts into Zeno theme knobs.",
        "Return only JSON matching the schema.",
        "Use brand and accent colors that fit the prompt, product category, and intended surface atmosphere.",
        "The theme engine tints background, surface, raised cards, borders, and focus from these colors, so choose colors that should influence the whole interface.",
        "When a prompt names a background, canvas, surface, environment, or dominant scene color, put that dominant surface color in brand.",
        "When a prompt names highlights, glow, actions, or decorative accents, put that highlight color in accent.",
        "Map dark, black, cinematic, luxury, neon, cyber, command center, and terminal prompts to a dark-capable mood such as neon, luxury, or brutal.",
        "Map airy, clean, calm, office, SaaS, health, finance, and admin prompts to clear, foggy, rainy, cold, or warm as appropriate.",
        "Keep contrast practical for product UI.",
        "Do not invent fields."
      ].join(" "),
      input: [
        `Prompt: ${input.prompt}`,
        `Current trend: ${input.trend}`,
        `Current mood: ${input.mood}`,
        `Current motion: ${input.motion}`,
        `Current brand: ${input.brand}`,
        `Current accent: ${input.accent}`
      ].join("\n"),
      generation_config: {
        temperature: 0.35
      },
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: themeInputSchema
      }
    }),
    cache: "no-store"
  });

  const result = await response.json().catch(() => null) as GeminiInteractionResponse & { error?: { message?: string } } | null;
  if (!response.ok) {
    throw new Error(result?.error?.message || `Gemini request failed with ${response.status}.`);
  }

  return extractStructuredThemeOutput(result);
}

export async function createAIThemeInput(input: ThemeInput): Promise<{
  input: ThemeInput;
  source: ThemeGenerationSource;
}> {
  const apiKey = readGeminiApiKey();
  const model = readGeminiModel();

  if (!apiKey) {
    return {
      input,
      source: {
        enabled: false,
        model: null,
        provider: "deterministic"
      }
    };
  }

  try {
    const parsed = await callGeminiThemeParser(input, apiKey, model);
    return {
      input: normalizeThemeInput(input, parsed),
      source: {
        enabled: true,
        model,
        provider: "gemini"
      }
    };
  } catch (error) {
    return {
      input,
      source: {
        enabled: true,
        model,
        provider: "deterministic",
        error: error instanceof Error ? error.message : "Gemini theme generation failed."
      }
    };
  }
}
