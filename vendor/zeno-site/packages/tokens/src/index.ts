export type ThemeKnobs = {
  trend: "minimal" | "glassmorphism" | "bento" | "editorial" | "brutalist" | "clay";
  mood: "clear" | "rainy" | "foggy" | "neon" | "warm" | "cold" | "luxury" | "brutal";
  motion: "minimal" | "smooth" | "playful" | "energetic" | "none";
};

export type ZenoTokenConfigInput = {
  metadata?: {
    name?: string;
    description?: string;
    projectId?: string;
    environment?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  tokens: ZenoTokens;
  assets?: Record<string, unknown>;
  publishedVersion?: string;
};

export type ZenoTokenConfig = ZenoTokenConfigInput & {
  schemaVersion: "1.0.0";
  metadata: NonNullable<ZenoTokenConfigInput["metadata"]>;
  assets: Record<string, unknown>;
  modes: Record<string, Partial<ZenoTokens>>;
  validation: {
    valid: boolean;
    issues: string[];
    score: {
      accessibility: number;
      consistency: number;
      contrast: number;
    };
  };
};

export type ZenoTokenReadResult = {
  valid: boolean;
  config: ZenoTokenConfig;
  issues: string[];
};

export type ZenoTokens = {
  name: string;
  id: string;
  seed: string;
  knobs: Record<string, string>;
  color: Record<string, string>;
  radius: Record<string, string>;
  spacing: Record<string, string>;
  type: Record<string, string>;
  size: Record<string, string>;
  shadow: Record<string, string>;
  motion: Record<string, string>;
  blur: { glass: string };
  opacity: { glass: string; disabled: string };
};

type ThemePreset = {
  name: string;
  prompt: string;
  trend?: ThemeKnobs["trend"];
  mood?: ThemeKnobs["mood"];
  motion?: ThemeKnobs["motion"];
  brand?: string;
  accent?: string;
};

export const themePresets: Record<string, ThemePreset> = {
  rainyGlass: {
    name: "Rainy Glass",
    prompt: "rainy glassmorphism fintech dashboard",
    trend: "glassmorphism",
    mood: "rainy",
    motion: "smooth",
    brand: "#38bdf8",
    accent: "#22d3ee"
  },
  neonCommand: {
    name: "Neon Command",
    prompt: "neon command center for security operations",
    trend: "glassmorphism",
    mood: "neon",
    motion: "energetic",
    brand: "#a855f7",
    accent: "#22d3ee"
  },
  foggyStudio: {
    name: "Foggy Studio",
    prompt: "foggy creative studio for content planning",
    trend: "minimal",
    mood: "foggy",
    motion: "smooth",
    brand: "#64748b",
    accent: "#8b5cf6"
  },
  coldOps: {
    name: "Cold Ops",
    prompt: "cold operations dashboard with precise controls",
    trend: "minimal",
    mood: "cold",
    motion: "minimal",
    brand: "#2563eb",
    accent: "#06b6d4"
  },
  calmBento: {
    name: "Calm Bento",
    prompt: "calm bento analytics workspace",
    trend: "bento",
    mood: "clear",
    motion: "minimal",
    brand: "#4f46e5",
    accent: "#14b8a6"
  },
  clearBento: {
    name: "Clear Bento",
    prompt: "clear bento developer console with warm cloud controls",
    trend: "bento",
    mood: "clear",
    motion: "smooth",
    brand: "#eb4b29",
    accent: "#06b6d4"
  },
  financeBento: {
    name: "Finance Bento",
    prompt: "compact bento finance console for portfolio review",
    trend: "bento",
    mood: "clear",
    motion: "minimal",
    brand: "#0f766e",
    accent: "#f59e0b"
  },
  warmBento: {
    name: "Warm Bento",
    prompt: "warm bento workspace for customer success teams",
    trend: "bento",
    mood: "warm",
    motion: "smooth",
    brand: "#ea580c",
    accent: "#14b8a6"
  },
  warmEditorial: {
    name: "Warm Editorial",
    prompt: "warm editorial product console",
    trend: "editorial",
    mood: "warm",
    motion: "smooth",
    brand: "#ea580c",
    accent: "#d946ef"
  },
  luxuryEditorial: {
    name: "Luxury Editorial",
    prompt: "luxury editorial commerce dashboard with refined rhythm",
    trend: "editorial",
    mood: "luxury",
    motion: "smooth",
    brand: "#b45309",
    accent: "#eab308"
  },
  magazineOps: {
    name: "Magazine Ops",
    prompt: "editorial operations suite for publishing teams",
    trend: "editorial",
    mood: "clear",
    motion: "minimal",
    brand: "#be123c",
    accent: "#2563eb"
  },
  brutalLedger: {
    name: "Brutal Ledger",
    prompt: "brutalist ledger app with sharp dense controls",
    trend: "brutalist",
    mood: "brutal",
    motion: "none",
    brand: "#111827",
    accent: "#ef4444"
  },
  clayPlanner: {
    name: "Clay Planner",
    prompt: "clay project planner with soft tactile cards",
    trend: "clay",
    mood: "warm",
    motion: "playful",
    brand: "#f97316",
    accent: "#84cc16"
  },
  rainyLedger: {
    name: "Rainy Ledger",
    prompt: "rainy fintech ledger with glass cards and calm focus",
    trend: "glassmorphism",
    mood: "rainy",
    motion: "smooth",
    brand: "#0ea5e9",
    accent: "#10b981"
  },
  neonStudio: {
    name: "Neon Studio",
    prompt: "neon media studio for creative asset review",
    trend: "glassmorphism",
    mood: "neon",
    motion: "playful",
    brand: "#db2777",
    accent: "#06b6d4"
  },
  clearMinimal: {
    name: "Clear Minimal",
    prompt: "clear minimal admin dashboard for focused workflows",
    trend: "minimal",
    mood: "clear",
    motion: "minimal",
    brand: "#2563eb",
    accent: "#16a34a"
  },
  coldMinimal: {
    name: "Cold Minimal",
    prompt: "cold minimal infrastructure console with high clarity",
    trend: "minimal",
    mood: "cold",
    motion: "minimal",
    brand: "#0f172a",
    accent: "#38bdf8"
  },
  foggyBento: {
    name: "Foggy Bento",
    prompt: "foggy bento knowledge base for research teams",
    trend: "bento",
    mood: "foggy",
    motion: "smooth",
    brand: "#475569",
    accent: "#a78bfa"
  },
  neonBento: {
    name: "Neon Bento",
    prompt: "neon bento launch dashboard with energetic metrics",
    trend: "bento",
    mood: "neon",
    motion: "energetic",
    brand: "#7c3aed",
    accent: "#22c55e"
  },
  coldEditorial: {
    name: "Cold Editorial",
    prompt: "cold editorial analytics for market intelligence",
    trend: "editorial",
    mood: "cold",
    motion: "smooth",
    brand: "#1d4ed8",
    accent: "#06b6d4"
  },
  brutalOps: {
    name: "Brutal Ops",
    prompt: "brutalist incident ops board with assertive alerts",
    trend: "brutalist",
    mood: "brutal",
    motion: "none",
    brand: "#18181b",
    accent: "#f97316"
  },
  clearBrutalist: {
    name: "Clear Brutalist",
    prompt: "clear brutalist issue tracker with strong structure",
    trend: "brutalist",
    mood: "clear",
    motion: "minimal",
    brand: "#0f172a",
    accent: "#eab308"
  },
  clayCommerce: {
    name: "Clay Commerce",
    prompt: "clay commerce manager with friendly inventory cards",
    trend: "clay",
    mood: "warm",
    motion: "playful",
    brand: "#dc2626",
    accent: "#facc15"
  },
  coldClay: {
    name: "Cold Clay",
    prompt: "cold clay analytics workspace with rounded depth",
    trend: "clay",
    mood: "cold",
    motion: "smooth",
    brand: "#0284c7",
    accent: "#8b5cf6"
  },
  luxuryGlass: {
    name: "Luxury Glass",
    prompt: "luxury glass portfolio dashboard with polished depth",
    trend: "glassmorphism",
    mood: "luxury",
    motion: "smooth",
    brand: "#9333ea",
    accent: "#f59e0b"
  },
  warmMinimal: {
    name: "Warm Minimal",
    prompt: "warm minimal productivity suite with calm controls",
    trend: "minimal",
    mood: "warm",
    motion: "smooth",
    brand: "#c2410c",
    accent: "#0d9488"
  },
  rainyEditorial: {
    name: "Rainy Editorial",
    prompt: "rainy editorial planning tool with soft contrast",
    trend: "editorial",
    mood: "rainy",
    motion: "smooth",
    brand: "#0369a1",
    accent: "#c084fc"
  },
  neonBrutalist: {
    name: "Neon Brutalist",
    prompt: "neon brutalist campaign board with loud actions",
    trend: "brutalist",
    mood: "neon",
    motion: "energetic",
    brand: "#be185d",
    accent: "#84cc16"
  },
  foggyClay: {
    name: "Foggy Clay",
    prompt: "foggy clay planning room for design operations",
    trend: "clay",
    mood: "foggy",
    motion: "playful",
    brand: "#7c2d12",
    accent: "#38bdf8"
  }
};

export function createZenoTokenConfig(input: ZenoTokenConfigInput): ZenoTokenConfig {
  const config: ZenoTokenConfig = {
    schemaVersion: "1.0.0",
    metadata: input.metadata ?? {},
    tokens: input.tokens,
    assets: input.assets ?? {},
    modes: {},
    validation: {
      valid: true,
      issues: [],
      score: {
        accessibility: 96,
        consistency: 94,
        contrast: 95
      }
    }
  };

  if (input.publishedVersion) {
    config.publishedVersion = input.publishedVersion;
  }

  return config;
}

export function readZenoTokenConfig(value: unknown): ZenoTokenReadResult {
  if (!value || typeof value !== "object" || !("tokens" in value)) {
    return {
      valid: false,
      config: createZenoTokenConfig({
        metadata: { name: "Invalid theme" },
        tokens: createFallbackTokens()
      }),
      issues: ["Invalid Zeno token config."]
    };
  }

  return {
    valid: true,
    config: createZenoTokenConfig(value as ZenoTokenConfigInput),
    issues: []
  };
}

function createFallbackTokens(): ZenoTokens {
  return {
    name: "Invalid theme",
    id: "invalid-theme",
    seed: "invalid-theme",
    knobs: {},
    color: {},
    radius: {},
    spacing: {},
    type: {},
    size: {},
    shadow: {},
    motion: {},
    blur: { glass: "0px" },
    opacity: { glass: "1", disabled: ".55" }
  };
}
