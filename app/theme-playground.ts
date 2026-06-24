import type { ThemeInput } from "@zeno-ui/theme-engine";
import { themePresets, type ThemeKnobs } from "@zeno-ui/tokens";

export type ThemeFormState = {
  prompt: string;
  trend: ThemeKnobs["trend"];
  mood: ThemeKnobs["mood"];
  motion: ThemeKnobs["motion"];
  brand: string;
  accent: string;
};

export const trends: ThemeKnobs["trend"][] = ["minimal", "glassmorphism", "bento", "editorial", "brutalist", "clay"];
export const moods: ThemeKnobs["mood"][] = ["clear", "rainy", "foggy", "neon", "warm", "cold", "luxury", "brutal"];
export const motions: ThemeKnobs["motion"][] = ["minimal", "smooth", "playful", "energetic", "none"];
export const presetThemes = Object.values(themePresets);
export const featuredPresetThemes = presetThemes;
export const examples = presetThemes.map((preset) => preset.prompt);

export const defaultThemeForm: ThemeFormState = {
  prompt: examples[0] ?? "rainy glassmorphism fintech dashboard",
  trend: "glassmorphism",
  mood: "rainy",
  motion: "smooth",
  brand: "#38bdf8",
  accent: "#22d3ee"
};

export function createThemeInput(form: ThemeFormState): ThemeInput {
  return {
    ...form,
    seed: `${form.prompt}-${form.trend}-${form.mood}-${form.motion}-${form.brand}-${form.accent}`
  };
}

export function createDetailsHref(form: ThemeFormState): string {
  const params = new URLSearchParams({
    prompt: form.prompt,
    trend: form.trend,
    mood: form.mood,
    motion: form.motion,
    brand: form.brand,
    accent: form.accent
  });

  return `/app/details?${params.toString()}`;
}

export function themeFormFromSearchParams(params: URLSearchParams): ThemeFormState {
  const trend = readOption(params, "trend", trends, defaultThemeForm.trend);
  const mood = readOption(params, "mood", moods, defaultThemeForm.mood);
  const motion = readOption(params, "motion", motions, defaultThemeForm.motion);

  return {
    prompt: params.get("prompt") || defaultThemeForm.prompt,
    trend,
    mood,
    motion,
    brand: readHex(params.get("brand"), defaultThemeForm.brand),
    accent: readHex(params.get("accent"), defaultThemeForm.accent)
  };
}

function readOption<T extends string>(params: URLSearchParams, key: string, values: T[], fallback: T): T {
  const value = params.get(key);
  return value && values.includes(value as T) ? value as T : fallback;
}

function readHex(value: string | null, fallback: string): string {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}
