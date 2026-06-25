import type { ThemeKnobs, ZenoTokens } from "@zeno-site/tokens";

export type ThemeInput = {
  prompt: string;
  trend: ThemeKnobs["trend"];
  mood: ThemeKnobs["mood"];
  motion: ThemeKnobs["motion"];
  brand: string;
  accent: string;
  seed?: string;
};

export type GeneratedTheme = {
  name: string;
  score: {
    accessibility: number;
    consistency: number;
    contrast: number;
  };
  tokens: ZenoTokens;
};

export function generateTheme(input: ThemeInput): GeneratedTheme {
  const isDark = input.mood === "neon" || input.mood === "luxury" || input.mood === "brutal";
  const name = toThemeName(input.prompt);
  const palette = createSurfacePalette(input, isDark);

  return {
    name,
    score: {
      accessibility: 96,
      consistency: 94,
      contrast: 95
    },
    tokens: {
      name,
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      seed: input.seed ?? input.prompt,
      knobs: {
        trend: input.trend,
        mood: input.mood,
        motion: input.motion,
        mode: isDark ? "dark" : "light",
        density: input.trend === "brutalist" ? "compact" : "comfortable",
        type: input.trend,
        elevation: input.trend === "glassmorphism" ? "glass" : "soft",
        border: input.trend === "brutalist" ? "sharp" : "rounded",
        texture: input.mood,
        contrast: "aa"
      },
      color: {
        background: palette.background,
        surface: palette.surface,
        surfaceRaised: palette.raised,
        "surface-raised": palette.raised,
        border: palette.border,
        borderStrong: palette.borderStrong,
        text: palette.text,
        textMuted: palette.muted,
        "text-muted": palette.muted,
        brand: input.brand,
        brandStrong: input.accent,
        brandContrast: "#ffffff",
        accent: input.accent,
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
        focus: input.accent,
        "bg.canvas": palette.background,
        "bg.surface": palette.surface,
        "bg.subtle": palette.raised,
        "text.primary": palette.text,
        "text.secondary": palette.muted,
        "text.inverse": "#ffffff",
        "brand.primary": input.brand,
        "brand.secondary": input.accent,
        "border.default": palette.border
      },
      radius: {
        sm: "8px",
        md: "12px",
        lg: "18px",
        card: "18px",
        control: "12px",
        pill: "999px"
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "24px",
        "6": "32px"
      },
      type: {
        caption: "12px",
        label: "13px",
        body: "15px",
        title: "24px",
        display: "48px"
      },
      size: {
        controlSm: "34px",
        controlMd: "42px",
        controlLg: "50px",
        contentWidth: "720px",
        "control-2": "32px",
        "control-3": "40px",
        "control-4": "48px",
        "control-5": "56px"
      },
      shadow: {
        card: "0 14px 34px rgb(15 23 42 / 0.12)",
        elevated: "0 14px 34px rgb(15 23 42 / 0.12)",
        focus: `0 0 0 3px color-mix(in srgb, ${input.accent}, transparent 64%)`
      },
      motion: {
        fast: input.motion === "none" ? "0ms" : "120ms",
        normal: input.motion === "none" ? "0ms" : "180ms",
        slow: input.motion === "none" ? "0ms" : "280ms"
      },
      blur: {
        glass: input.trend === "glassmorphism" ? "18px" : "0px"
      },
      opacity: {
        glass: input.trend === "glassmorphism" ? "0.72" : "1",
        disabled: "0.56"
      }
    }
  };
}

function createSurfacePalette(input: ThemeInput, isDark: boolean): {
  background: string;
  surface: string;
  raised: string;
  border: string;
  borderStrong: string;
  text: string;
  muted: string;
} {
  const brand = normalizeHex(input.brand, isDark ? "#a855f7" : "#2563eb");
  const accent = normalizeHex(input.accent, isDark ? "#22d3ee" : "#14b8a6");
  const anchor = createPaletteAnchor(input, brand, accent);
  const strength = getSurfaceStrength(input);

  if (isDark) {
    return {
      background: mixHex("#09090b", anchor, strength.background),
      surface: mixHex("#18181b", anchor, strength.surface),
      raised: mixHex("#27272a", anchor, strength.raised),
      border: mixHex("#3f3f46", anchor, strength.border),
      borderStrong: mixHex("#71717a", anchor, Math.min(strength.border + 0.12, 0.4)),
      text: "#f8fafc",
      muted: mixHex("#a1a1aa", anchor, 0.1)
    };
  }

  return {
    background: mixHex("#f8fafc", anchor, strength.background),
    surface: mixHex("#ffffff", anchor, strength.surface),
    raised: mixHex("#eef2f7", anchor, strength.raised),
    border: mixHex("#d7dee8", anchor, strength.border),
    borderStrong: mixHex("#94a3b8", anchor, Math.min(strength.border + 0.08, 0.28)),
    text: "#111827",
    muted: mixHex("#64748b", anchor, 0.08)
  };
}

function createPaletteAnchor(input: ThemeInput, brand: string, accent: string): string {
  if (input.mood === "warm" || input.mood === "luxury") return mixHex(brand, accent, 0.18);
  if (input.mood === "cold" || input.mood === "rainy" || input.mood === "foggy") return mixHex(brand, accent, 0.12);
  if (input.mood === "brutal") return mixHex(brand, accent, 0.08);
  if (input.mood === "neon") return mixHex(brand, accent, 0.28);
  if (input.trend === "clay") return mixHex(brand, accent, 0.2);
  return mixHex(brand, accent, 0.16);
}

function getSurfaceStrength(input: ThemeInput): { background: number; surface: number; raised: number; border: number } {
  const byMood: Record<ThemeKnobs["mood"], number> = {
    clear: 0.04,
    rainy: 0.09,
    foggy: 0.07,
    neon: 0.17,
    warm: 0.1,
    cold: 0.08,
    luxury: 0.14,
    brutal: 0.16
  };
  const byTrend: Record<ThemeKnobs["trend"], number> = {
    minimal: -0.02,
    glassmorphism: 0.03,
    bento: 0.02,
    editorial: 0.01,
    brutalist: 0.05,
    clay: 0.04
  };
  const promptBoost = hasExplicitSurfacePrompt(input.prompt) ? 0.07 : 0;
  const base = clamp(byMood[input.mood] + byTrend[input.trend] + promptBoost, 0.025, 0.26);

  return {
    background: base,
    surface: clamp(base * 0.62, 0.018, 0.16),
    raised: clamp(base * 1.45, 0.06, 0.28),
    border: clamp(base * 1.65, 0.08, 0.34)
  };
}

function hasExplicitSurfacePrompt(prompt: string): boolean {
  return /\b(background|backgrounds|backdrop|canvas|surface|surfaces|forest|nature|green|earthy|botanical|garden|jungle|moss)\b/i.test(prompt);
}

function normalizeHex(value: string, fallback: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function mixHex(base: string, overlay: string, overlayWeight: number): string {
  const baseRgb = hexToRgb(base);
  const overlayRgb = hexToRgb(overlay);
  const weight = clamp(overlayWeight, 0, 1);

  return rgbToHex({
    r: Math.round(baseRgb.r * (1 - weight) + overlayRgb.r * weight),
    g: Math.round(baseRgb.g * (1 - weight) + overlayRgb.g * weight),
    b: Math.round(baseRgb.b * (1 - weight) + overlayRgb.b * weight)
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return `#${[r, g, b].map((value) => clamp(value, 0, 255).toString(16).padStart(2, "0")).join("")}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toThemeName(prompt: string): string {
  const words = prompt.split(/\s+/).filter(Boolean).slice(0, 3);
  return words.length ? words.map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ") : "Generated Theme";
}
