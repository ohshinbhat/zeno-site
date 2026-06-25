"use client";

import { CheckCircle2, ChevronDown, Copy, Cpu, FileCode2, Gem, LayoutDashboard, Layers3, Palette, Search, Sparkles, SwatchBook, Wand2, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button, Card, Input, Stack, Text } from "@zeno-site/react";
import {
  Avatar as ZenoAvatar,
  Badge as ZenoBadge,
  Button as ZenoButton,
  Card as ZenoCard,
  Checkbox as ZenoCheckbox,
  Input as ZenoInput,
  Select as ZenoSelect,
  Stack as ZenoStack,
  Switch as ZenoSwitch,
  Text as ZenoText,
  ZenoThemeProvider,
  type ZenoTokenConfig as PackageZenoTokenConfig
} from "@zenoui/react";
import { generateNativeWindThemeCss } from "@zeno-site/nativewind-preset";
import { generateExportBundle, generateRuntimeThemeCss } from "@zeno-site/tailwind-preset";
import { generateTheme } from "@zeno-site/theme-engine";
import { createZenoTokenConfig } from "@zeno-site/tokens";
import { useAccountHistory } from "../site-chrome";
import {
  createThemeInput,
  defaultThemeForm,
  featuredPresetThemes,
  motions,
  moods,
  trends,
  type ThemeFormState
} from "../theme-playground";

type ProjectSummary = {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
};

type ThemeDraftSummary = {
  id: string;
  projectId: string;
  name: string;
  form: unknown;
  updatedAt: string;
};

type PublishResult = {
  projectId: string;
  environment: string;
  version: string;
  hash: string;
  createdAt: string;
  jsonUrl: string;
  cssUrl: string;
  versionUrl: string;
};

type PublishHistoryItem = {
  projectId: string;
  environment: string;
  version: string;
  hash: string;
  createdAt: string;
};

type GenerateThemeResult = {
  input?: Partial<ThemeFormState>;
  ai?: {
    enabled: boolean;
    model: string | null;
    provider: "deterministic" | "gemini";
    error?: string;
  };
  error?: string;
};

type UnknownRecord = Record<string, unknown>;
type PresetFilter = "all" | ThemeFormState["trend"];
type ConsoleView = "console" | "details";
const packageAvatarSrc = "/avatar-temp.png?v=1";

const presetFilterLabels: Record<PresetFilter, string> = {
  all: "All",
  minimal: "Minimal",
  glassmorphism: "Glass",
  bento: "Bento",
  editorial: "Editorial",
  brutalist: "Brutal",
  clay: "Clay"
};

const quickBriefChips: Array<{
  label: string;
  values: Partial<ThemeFormState>;
}> = [
  {
    label: "Bento clear",
    values: {
      prompt: "clear bento dashboard with calm cloud cards",
      trend: "bento",
      mood: "clear",
      motion: "smooth",
      brand: "#4f46e5",
      accent: "#14b8a6"
    }
  },
  {
    label: "Glass neon",
    values: {
      prompt: "neon glass command center with luminous panels",
      trend: "glassmorphism",
      mood: "neon",
      motion: "energetic",
      brand: "#a855f7",
      accent: "#22d3ee"
    }
  },
  {
    label: "Minimal cold",
    values: {
      prompt: "cold minimal infrastructure console with precise controls",
      trend: "minimal",
      mood: "cold",
      motion: "minimal",
      brand: "#2563eb",
      accent: "#06b6d4"
    }
  },
  {
    label: "Editorial warm",
    values: {
      prompt: "warm editorial product console with refined sections",
      trend: "editorial",
      mood: "warm",
      motion: "smooth",
      brand: "#ea580c",
      accent: "#d946ef"
    }
  },
  {
    label: "Clay playful",
    values: {
      prompt: "playful clay planning app with tactile cards",
      trend: "clay",
      mood: "warm",
      motion: "playful",
      brand: "#f97316",
      accent: "#84cc16"
    }
  }
];

function createPackagePreviewTheme({
  accessibility,
  form,
  themeConfig,
  themeName
}: {
  accessibility: number;
  form: ThemeFormState;
  themeConfig: unknown;
  themeName: string;
}): PackageZenoTokenConfig {
  const color = readThemeRecord(themeConfig, "color");
  const radius = readThemeRecord(themeConfig, "radius");
  const spacing = readThemeRecord(themeConfig, "spacing");
  const type = readThemeRecord(themeConfig, "type");
  const size = readThemeRecord(themeConfig, "size");
  const shadow = readThemeRecord(themeConfig, "shadow");
  const motion = readThemeRecord(themeConfig, "motion");
  const brand = readTokenValue(color, ["brand", "brand.primary"], form.brand);
  const accent = readTokenValue(color, ["accent", "brand.secondary"], form.accent);
  const background = readTokenValue(color, ["background", "bg.canvas"], "#f8fafc");
  const surface = readTokenValue(color, ["surface", "bg.surface"], "#ffffff");
  const subtle = readTokenValue(color, ["surfaceRaised", "surface-raised", "bg.subtle"], "#eef3f8");
  const text = readTokenValue(color, ["text", "text.primary"], "#111827");
  const muted = readTokenValue(color, ["textMuted", "text-muted", "text.secondary"], "#64748b");
  const border = readTokenValue(color, ["border", "border.default"], "#d7dee8");

  return {
    schemaVersion: "1.0.0",
    metadata: {
      name: themeName,
      description: form.prompt
    },
    tokens: {
      name: themeName,
      id: themeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "zeno-generated",
      seed: `${form.prompt}-${form.trend}-${form.mood}-${form.motion}-${form.brand}-${form.accent}`,
      knobs: {
        brand,
        accent,
        trend: form.trend,
        weather: form.mood,
        density: readTokenValue(readThemeRecord(themeConfig, "knobs"), ["density"], "comfortable"),
        type: readTokenValue(readThemeRecord(themeConfig, "knobs"), ["type"], "modern"),
        elevation: readTokenValue(readThemeRecord(themeConfig, "knobs"), ["elevation"], "soft"),
        border: readTokenValue(readThemeRecord(themeConfig, "knobs"), ["border"], "rounded"),
        motion: form.motion,
        texture: readTokenValue(readThemeRecord(themeConfig, "knobs"), ["texture"], "clean"),
        contrast: readTokenValue(readThemeRecord(themeConfig, "knobs"), ["contrast"], "aa"),
        mode: readTokenValue(readThemeRecord(themeConfig, "knobs"), ["mode"], "light"),
        mood: form.mood
      },
      color: {
        "bg.canvas": background,
        "bg.surface": surface,
        "bg.subtle": subtle,
        "bg.strong": text,
        "border.default": border,
        "border.strong": readTokenValue(color, ["borderStrong", "border.strong"], muted),
        "text.primary": text,
        "text.secondary": muted,
        "text.inverse": readTokenValue(color, ["brandContrast", "brand-contrast", "text.inverse"], "#ffffff"),
        "brand.primary": brand,
        "brand.secondary": accent,
        "brand.strong": readTokenValue(color, ["brandStrong", "brand.strong"], accent),
        "status.success": readTokenValue(color, ["success", "status.success"], "#16a34a"),
        "status.danger": readTokenValue(color, ["danger", "status.danger"], "#dc2626"),
        "focus.ring": readTokenValue(color, ["focus", "focus.ring"], accent)
      },
      radius: {
        sm: readTokenValue(radius, ["sm"], "8px"),
        md: readTokenValue(radius, ["md", "control"], "12px"),
        lg: readTokenValue(radius, ["lg", "card"], "18px"),
        pill: readTokenValue(radius, ["pill"], "999px")
      },
      spacing: {
        xs: readTokenValue(spacing, ["xs", "1"], "4px"),
        sm: readTokenValue(spacing, ["sm", "2"], "8px"),
        md: readTokenValue(spacing, ["md", "3"], "12px"),
        lg: readTokenValue(spacing, ["lg", "4"], "16px"),
        xl: readTokenValue(spacing, ["xl", "5"], "24px"),
        "2xl": readTokenValue(spacing, ["2xl", "6"], "32px")
      },
      type: {
        caption: readTokenValue(type, ["caption"], "12px"),
        label: readTokenValue(type, ["label"], "13px"),
        body: readTokenValue(type, ["body"], "15px"),
        title: readTokenValue(type, ["title"], "24px")
      },
      size: {
        controlSm: readTokenValue(size, ["controlSm", "control-2"], "34px"),
        controlMd: readTokenValue(size, ["controlMd", "control-3"], "42px"),
        controlLg: readTokenValue(size, ["controlLg", "control-4"], "50px"),
        contentWidth: readTokenValue(size, ["contentWidth"], "720px")
      },
      shadow: {
        card: readTokenValue(shadow, ["card", "elevated"], "0 14px 34px rgb(15 23 42 / 0.12)"),
        focus: readTokenValue(shadow, ["focus"], `0 0 0 3px color-mix(in srgb, ${accent}, transparent 64%)`)
      },
      motion: {
        fast: readTokenValue(motion, ["fast"], "120ms"),
        normal: readTokenValue(motion, ["normal"], "180ms"),
        slow: readTokenValue(motion, ["slow"], "280ms")
      },
      blur: {
        glass: readTokenValue(readThemeRecord(themeConfig, "blur"), ["glass"], "0px")
      },
      opacity: {
        glass: readTokenValue(readThemeRecord(themeConfig, "opacity"), ["glass"], "0.9"),
        disabled: readTokenValue(readThemeRecord(themeConfig, "opacity"), ["disabled"], "0.56")
      }
    },
    assets: {},
    modes: {},
    validation: {
      valid: true,
      issues: [],
      score: {
        accessibility,
        consistency: accessibility,
        contrast: accessibility
      }
    }
  };
}

function readThemeRecord(themeConfig: unknown, group: string): Record<string, string> {
  const root = asRecord(themeConfig);
  const tokens = asRecord(root?.tokens);
  const record = asRecord(tokens?.[group]);
  if (!record) return {};

  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, string] => typeof entry[1] === "string" && Boolean(entry[1]))
  );
}

function readTokenValue(record: Record<string, string>, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = record[key];
    if (value) return value;
  }

  return fallback;
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null;
}

function isThemeFormState(value: unknown): value is ThemeFormState {
  if (!value || typeof value !== "object") return false;
  const form = value as Partial<ThemeFormState>;
  return typeof form.prompt === "string"
    && trends.includes(form.trend as ThemeFormState["trend"])
    && moods.includes(form.mood as ThemeFormState["mood"])
    && motions.includes(form.motion as ThemeFormState["motion"])
    && typeof form.brand === "string"
    && typeof form.accent === "string";
}

export default function Page(): React.ReactElement {
  const [form, setForm] = React.useState<ThemeFormState>(defaultThemeForm);
  const [activeView, setActiveView] = React.useState<ConsoleView>("console");
  const [projects, setProjects] = React.useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState("");
  const [environment, setEnvironment] = React.useState("production");
  const [drafts, setDrafts] = React.useState<ThemeDraftSummary[]>([]);
  const [selectedDraftId, setSelectedDraftId] = React.useState("");
  const [publishResult, setPublishResult] = React.useState<PublishResult | null>(null);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishError, setPublishError] = React.useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [isGeneratingTheme, setIsGeneratingTheme] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [generateSource, setGenerateSource] = React.useState<GenerateThemeResult["ai"] | null>(null);
  const [draftError, setDraftError] = React.useState<string | null>(null);
  const [publishHistory, setPublishHistory] = React.useState<PublishHistoryItem[]>([]);
  const [historyError, setHistoryError] = React.useState<string | null>(null);

  const input = React.useMemo(() => createThemeInput(form), [form]);
  const generated = React.useMemo(() => generateTheme(input), [input]);
  const runtimeCss = React.useMemo(() => generateRuntimeThemeCss(generated.tokens, ".zeno-preview"), [generated.tokens]);
  const themeConfig = React.useMemo(() => createZenoTokenConfig({
    metadata: {
      name: generated.name,
      description: form.prompt
    },
    tokens: generated.tokens
  }), [form.prompt, generated.name, generated.tokens]);
  const packagePreviewTheme = React.useMemo(() => createPackagePreviewTheme({
    form,
    accessibility: generated.score.accessibility,
    themeConfig,
    themeName: generated.name
  }), [form, generated.name, generated.score.accessibility, themeConfig]);
  useAccountHistory(publishHistory, historyError);

  const updateForm = React.useCallback(<Key extends keyof ThemeFormState>(key: Key, value: ThemeFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  }, []);

  const changeProject = React.useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedDraftId("");
    setDrafts([]);
    setPublishHistory([]);
    setPublishResult(null);
    setPublishError(null);
    setHistoryError(null);
  }, []);

  React.useEffect(() => {
    async function loadProjects(): Promise<void> {
      const response = await fetch("/api/projects", { cache: "no-store" });
      if (response.status === 401) {
        window.location.href = "/login?next=/app";
        return;
      }
      const result = await response.json() as { projects?: ProjectSummary[]; error?: string };
      if (!response.ok) {
        setDraftError(result.error || "Projects failed to load.");
        return;
      }

      const nextProjects = result.projects ?? [];
      setProjects(nextProjects);
      setSelectedProjectId((current) => current || nextProjects[0]?.id || "");
    }

    void loadProjects();
  }, []);

  React.useEffect(() => {
    if (!selectedProjectId) return;

    async function loadDrafts(): Promise<void> {
      const response = await fetch(`/api/themes/drafts?projectId=${encodeURIComponent(selectedProjectId)}`, { cache: "no-store" });
      const result = await response.json() as { drafts?: ThemeDraftSummary[]; error?: string };
      if (!response.ok) {
        setDraftError(result.error || "Theme drafts failed to load.");
        return;
      }

      setDrafts(result.drafts ?? []);
    }

    void loadDrafts();
  }, [selectedProjectId]);

  const loadPublishHistory = React.useCallback(async (projectId: string) => {
    try {
      setHistoryError(null);
      const response = await fetch(`/api/themes/history?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
      const result = await response.json() as { history?: PublishHistoryItem[]; error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Publish history failed to load.");
      }

      setPublishHistory(result.history ?? []);
    } catch (error) {
      setPublishHistory([]);
      setHistoryError(error instanceof Error ? error.message : "Publish history failed to load.");
    }
  }, []);

  React.useEffect(() => {
    if (!selectedProjectId) {
      setPublishHistory([]);
      return;
    }

    void loadPublishHistory(selectedProjectId);
  }, [loadPublishHistory, selectedProjectId]);

  const selectDraft = React.useCallback((draftId: string) => {
    setSelectedDraftId(draftId);
    const draft = drafts.find((item) => item.id === draftId);
    if (draft && isThemeFormState(draft.form)) {
      setForm(draft.form);
      setPublishResult(null);
      setPublishError(null);
    }
  }, [drafts]);

  const generateThemeFromPrompt = React.useCallback(async () => {
    setIsGeneratingTheme(true);
    setGenerateError(null);
    setGenerateSource(null);
    setPublishResult(null);
    setPublishError(null);

    try {
      const response = await fetch("/api/themes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createThemeInput(form))
      });
      const result = await response.json() as GenerateThemeResult;

      if (!response.ok) {
        throw new Error(result.error || "Theme generation failed.");
      }

      if (result.input && isThemeFormState({ ...form, ...result.input })) {
        setForm((current) => ({ ...current, ...result.input }));
      }
      setGenerateSource(result.ai ?? null);
      if (result.ai?.error) {
        setGenerateError(result.ai.error);
      }
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : "Theme generation failed.");
    } finally {
      setIsGeneratingTheme(false);
    }
  }, [form]);

  const saveDraft = React.useCallback(async () => {
    if (!selectedProjectId) {
      setDraftError("Create or select a project first.");
      return;
    }

    setIsSavingDraft(true);
    setDraftError(null);

    try {
      const response = await fetch("/api/themes/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          name: generated.name,
          config: themeConfig,
          form,
          themeId: selectedDraftId || undefined
        })
      });
      const result = await response.json() as { draft?: ThemeDraftSummary; error?: string };

      if (!response.ok || !result.draft) {
        throw new Error(result.error || "Theme draft save failed.");
      }

      setDrafts((current) => [result.draft!, ...current.filter((draft) => draft.id !== result.draft!.id)]);
      setSelectedDraftId(result.draft.id);
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : "Theme draft save failed.");
    } finally {
      setIsSavingDraft(false);
    }
  }, [form, generated.name, selectedDraftId, selectedProjectId, themeConfig]);

  const publishTheme = React.useCallback(async () => {
    if (!selectedProjectId) {
      setPublishError("Create or select a project first.");
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishResult(null);

    try {
      const response = await fetch("/api/themes/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          environment,
          config: themeConfig,
          themeId: selectedDraftId || undefined
        })
      });
      const result = await response.json() as PublishResult | { error?: string };

      if (!response.ok) {
        throw new Error("error" in result && result.error ? result.error : "Theme publish failed.");
      }

      const published = result as PublishResult;
      setPublishResult(published);
      setPublishHistory((current) => [
        {
          projectId: published.projectId,
          environment: published.environment,
          version: published.version,
          hash: published.hash,
          createdAt: published.createdAt
        },
        ...current.filter((item) => item.version !== published.version)
      ].slice(0, 8));
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "Theme publish failed.");
    } finally {
      setIsPublishing(false);
    }
  }, [environment, selectedDraftId, selectedProjectId, themeConfig]);

  return (
    <>
      <style>{runtimeCss}</style>
      <main className="site-content mx-auto grid w-full max-w-[1500px] gap-4 px-4 pb-24 pt-5 md:px-6 md:pb-28 md:pt-7">
        <ConsoleNavigation activeView={activeView} onChange={setActiveView} themeName={generated.name} />

        {activeView === "console" ? (
          <div className="grid w-full gap-4 lg:grid-cols-[minmax(340px,0.95fr)_minmax(0,2.05fr)] lg:items-start">
            <PromptPanel
              form={form}
              updateForm={updateForm}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onProjectChange={changeProject}
              environment={environment}
              onEnvironmentChange={setEnvironment}
              drafts={drafts}
              selectedDraftId={selectedDraftId}
              onDraftChange={selectDraft}
              isSavingDraft={isSavingDraft}
              isGeneratingTheme={isGeneratingTheme}
              draftError={draftError}
              generateError={generateError}
              generateSource={generateSource}
              onGenerateTheme={generateThemeFromPrompt}
              onSaveDraft={saveDraft}
              isPublishing={isPublishing}
              publishError={publishError}
              publishResult={publishResult}
              onPublish={publishTheme}
            />
            <PreviewPanel
              packageTheme={packagePreviewTheme}
            />
          </div>
        ) : (
          <ThemeDetailsPanel form={form} generated={generated} />
        )}
      </main>
    </>
  );
}

function ConsoleNavigation({
  activeView,
  onChange,
  themeName
}: {
  activeView: ConsoleView;
  onChange: (view: ConsoleView) => void;
  themeName: string;
}): React.ReactElement {
  return (
    <section className="grid gap-3 rounded-xl border border-border bg-surface p-3 shadow-[0_14px_44px_rgb(15_23_42_/_0.07)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <Stack gap="none" className="min-w-0 gap-1">
        <Text as="p" size="label" tone="muted" weight="bold" className="text-[0.68rem] uppercase leading-3 tracking-[0.08em]">Console workspace</Text>
        <Text as="h1" size="title" weight="semibold" className="truncate text-[1.2rem] leading-6">{themeName}</Text>
      </Stack>
      <div className="grid grid-cols-2 rounded-lg border border-border bg-background p-1">
        {([
          ["console", "Console", <LayoutDashboard key="console-icon" className="size-4" />],
          ["details", "Details", <FileCode2 key="details-icon" className="size-4" />]
        ] as const).map(([view, label, icon]) => (
          <button
            key={view}
            className={[
              "inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:shadow-focus",
              activeView === view
                ? "bg-[var(--color-zeno-brand)] text-white shadow-[0_8px_22px_rgb(235_75_41_/_0.2)]"
                : "text-text-muted hover:bg-surface-raised hover:text-text"
            ].join(" ")}
            type="button"
            onClick={() => onChange(view)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PromptPanel({
  form,
  updateForm,
  projects,
  selectedProjectId,
  onProjectChange,
  environment,
  onEnvironmentChange,
  drafts,
  selectedDraftId,
  onDraftChange,
  isSavingDraft,
  isGeneratingTheme,
  draftError,
  generateError,
  generateSource,
  onGenerateTheme,
  onSaveDraft,
  isPublishing,
  publishError,
  publishResult,
  onPublish
}: {
  form: ThemeFormState;
  updateForm: <Key extends keyof ThemeFormState>(key: Key, value: ThemeFormState[Key]) => void;
  projects: ProjectSummary[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  environment: string;
  onEnvironmentChange: (environment: string) => void;
  drafts: ThemeDraftSummary[];
  selectedDraftId: string;
  onDraftChange: (draftId: string) => void;
  isSavingDraft: boolean;
  isGeneratingTheme: boolean;
  draftError: string | null;
  generateError: string | null;
  generateSource: GenerateThemeResult["ai"] | null;
  onGenerateTheme: () => void;
  onSaveDraft: () => void;
  isPublishing: boolean;
  publishError: string | null;
  publishResult: PublishResult | null;
  onPublish: () => void;
}): React.ReactElement {
  const [isPublishDialogOpen, setIsPublishDialogOpen] = React.useState(false);
  const [presetQuery, setPresetQuery] = React.useState("");
  const [presetFilter, setPresetFilter] = React.useState<PresetFilter>("all");
  const filteredPresetThemes = React.useMemo(() => {
    const query = presetQuery.trim().toLowerCase();
    const scopedThemes = presetFilter === "all"
      ? featuredPresetThemes
      : featuredPresetThemes.filter((preset) => preset.trend === presetFilter);
    if (!query) return scopedThemes;

    return scopedThemes.filter((preset) => [
      preset.name,
      preset.prompt,
      preset.trend,
      preset.mood,
      preset.motion
    ].some((value) => value?.toLowerCase().includes(query)));
  }, [presetFilter, presetQuery]);

  const applyPreset = React.useCallback((preset: (typeof featuredPresetThemes)[number]) => {
    updateForm("prompt", preset.prompt);
    if (preset.trend) updateForm("trend", preset.trend);
    if (preset.mood) updateForm("mood", preset.mood);
    if (preset.motion) updateForm("motion", preset.motion);
    if (preset.brand) updateForm("brand", preset.brand);
    if (preset.accent) updateForm("accent", preset.accent);
  }, [updateForm]);
  const applyQuickBrief = React.useCallback((values: Partial<ThemeFormState>) => {
    if (values.prompt !== undefined) updateForm("prompt", values.prompt);
    if (values.trend !== undefined) updateForm("trend", values.trend);
    if (values.mood !== undefined) updateForm("mood", values.mood);
    if (values.motion !== undefined) updateForm("motion", values.motion);
    if (values.brand !== undefined) updateForm("brand", values.brand);
    if (values.accent !== undefined) updateForm("accent", values.accent);
  }, [updateForm]);

  React.useEffect(() => {
    if (!isPublishDialogOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsPublishDialogOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isPublishDialogOpen]);

  return (
    <aside className="order-1 min-w-0 lg:sticky lg:top-[96px] lg:h-[calc(100dvh-188px)] lg:max-h-[860px] lg:min-h-[560px]">
      <Card variant="surface" className="min-w-0 max-w-full flex h-full flex-col overflow-hidden rounded-xl border-text/10 bg-surface p-0 shadow-[0_18px_54px_rgb(15_23_42_/_0.08)]">
        <div className="border-b border-border px-5 py-4">
          <Stack direction="row" align="center" justify="space-between" gap="$3">
            <Stack gap="$2" className="min-w-0">
              <Text as="p" size="label" tone="muted" weight="bold" className="text-[0.68rem] uppercase leading-3 tracking-[0.08em]">Theme brief</Text>
              <Text as="h1" size="title" weight="semibold" className="text-[1.35rem] leading-7">Shape the system</Text>
            </Stack>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-raised text-text">
              <Wand2 className="size-5" />
            </span>
          </Stack>
        </div>

        <div className="zeno-soft-scroll min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain pb-20 pl-5 pr-2 pt-5">
          <Stack gap="none" className="min-w-0 gap-4 pr-2">
            <section className="grid min-w-0 gap-4 rounded-xl border border-[color-mix(in_srgb,var(--color-border),var(--color-zeno-brand)_18%)] bg-background p-4 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)]">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <Stack gap="$2" className="min-w-0">
                  <Text size="label" tone="muted" weight="bold" className="text-[0.72rem] uppercase leading-3 tracking-[0.08em]">Prompt composer</Text>
                  <Text tone="muted" className="text-sm leading-5">Describe the product surface, then tune the generated direction.</Text>
                </Stack>
                <span className="shrink-0 rounded-pill border border-border bg-surface px-2.5 py-1 text-[0.66rem] font-bold uppercase leading-none text-text-muted">Live</span>
              </div>

              <label className="grid min-w-0 gap-2">
                <Text as="span" size="label" tone="muted" weight="medium" className="text-xs leading-4">Prompt</Text>
                <textarea
                  className="h-36 w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-[0.92rem] leading-6 text-text outline-none transition placeholder:text-text-muted focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_3px_rgb(235_75_41_/_0.12)]"
                  value={form.prompt}
                  placeholder="rainy glassmorphism fintech dashboard"
                  onChange={(event) => updateForm("prompt", event.target.value)}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {quickBriefChips.map((chip) => (
                  <button
                    key={chip.label}
                    className="inline-flex h-8 items-center rounded-pill border border-border bg-surface px-3 text-xs font-bold text-text-muted transition hover:border-[var(--color-zeno-brand)] hover:text-text focus-visible:outline-none focus-visible:shadow-focus"
                    onClick={() => applyQuickBrief(chip.values)}
                    type="button"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-2.5">
                <button
                  type="button"
                  disabled={isGeneratingTheme}
                  onClick={onGenerateTheme}
                  className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-border),var(--color-zeno-brand)_24%)] bg-surface px-3.5 py-3 text-left transition hover:border-[var(--color-zeno-brand)] hover:bg-surface-raised focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-zeno-brand)] text-white shadow-[0_8px_18px_rgb(235_75_41_/_0.22)] transition group-hover:scale-[1.03]">
                      <Wand2 className="size-4" />
                    </span>
                    <span className="grid min-w-0 gap-0.5">
                      <span className="truncate text-sm font-bold leading-5 text-text">{isGeneratingTheme ? "Generating theme" : "Generate with AI"}</span>
                      <span className="truncate text-xs font-medium leading-4 text-text-muted">Turn the prompt into a token system</span>
                    </span>
                  </span>
                  <span className="shrink-0 rounded-pill border border-border bg-background px-2.5 py-1 text-[0.65rem] font-bold uppercase leading-none text-text-muted">AI</span>
                </button>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={isSavingDraft || !selectedProjectId}
                    onClick={onSaveDraft}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-bold text-text-muted transition hover:bg-surface-raised hover:text-text focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="size-4" />
                    <span className="truncate">{isSavingDraft ? "Saving draft" : "Save draft"}</span>
                  </button>
                  <button
                    type="button"
                    disabled={!selectedProjectId}
                    onClick={() => setIsPublishDialogOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-zeno-brand),var(--color-text)_8%)] bg-[var(--color-zeno-brand)] px-3 text-sm font-bold text-white shadow-[0_8px_18px_rgb(235_75_41_/_0.18)] transition hover:brightness-95 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="size-4" />
                    <span className="truncate">Publish</span>
                  </button>
                </div>
              </div>
              {generateSource ? (
                <Text size="label" tone={generateSource.error ? "danger" : "muted"} weight="medium">
                  {generateSource.provider === "gemini"
                    ? `Generated with ${generateSource.model}`
                    : generateSource.enabled
                      ? "AI unavailable; used deterministic generator."
                      : "Using deterministic generator until GEMINI_API_KEY is set."}
                </Text>
              ) : null}
              {generateError ? <Text size="label" tone="danger" weight="medium">{generateError}</Text> : null}
              {draftError ? <Text size="label" tone="danger" weight="medium">{draftError}</Text> : null}
            </section>

            <BriefGroup title="Destination" icon={<Layers3 className="size-4" />}>
              <div className="grid gap-3">
                <ProjectSelect projects={projects} value={selectedProjectId} onChange={onProjectChange} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <CompactInput
                    label="Environment"
                    value={environment}
                    onChange={(event) => onEnvironmentChange(event.target.value)}
                  />
                  <DraftSelect drafts={drafts} value={selectedDraftId} onChange={onDraftChange} />
                </div>
              </div>
            </BriefGroup>

            <div className="grid gap-4">
              <BriefGroup title="Theme controls" icon={<Wand2 className="size-4" />}>
                <div className="grid gap-3">
                  <SelectControl label="Trend" value={form.trend} values={trends} onChange={(value) => updateForm("trend", value)} />
                  <SelectControl label="Mood" value={form.mood} values={moods} onChange={(value) => updateForm("mood", value)} />
                  <SelectControl label="Motion" value={form.motion} values={motions} onChange={(value) => updateForm("motion", value)} />
                </div>
              </BriefGroup>

              <BriefGroup title="Palette" icon={<Palette className="size-4" />}>
                <div className="grid gap-3">
                  <ColorControl label="Brand" value={form.brand} onChange={(value) => updateForm("brand", value)} />
                  <ColorControl label="Accent" value={form.accent} onChange={(value) => updateForm("accent", value)} />
                </div>
              </BriefGroup>
            </div>

            <section className="grid min-w-0 gap-3 rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Text size="label" tone="muted" weight="bold" className="text-[0.72rem] uppercase leading-3 tracking-[0.08em]">Preset library</Text>
                  <span className="shrink-0 rounded-pill border border-border bg-surface px-2 py-1 text-[0.64rem] font-bold leading-none text-text-muted">
                    {filteredPresetThemes.length}/{featuredPresetThemes.length}
                  </span>
                </div>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-raised text-text-muted">
                  <SwatchBook className="size-4" />
                </span>
              </div>

              <label className="relative block min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <input
                  aria-label="Search predefined themes"
                  className="h-10 w-full rounded-lg border border-border/80 bg-surface pl-9 pr-3 text-sm font-semibold text-text outline-none transition placeholder:text-text-muted hover:border-text/35 hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_3px_rgb(235_75_41_/_0.12)]"
                  placeholder="Search presets"
                  value={presetQuery}
                  onChange={(event) => setPresetQuery(event.target.value)}
                />
              </label>

              <div className="flex max-w-full flex-wrap gap-1.5">
                {(["all", ...trends] as PresetFilter[]).map((filter) => (
                  <button
                    key={filter}
                    className={[
                      "inline-flex h-8 min-w-0 items-center rounded-pill border px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:shadow-focus",
                      presetFilter === filter ? "border-[var(--color-zeno-brand)] bg-surface-raised text-text" : "border-border bg-surface text-text-muted hover:text-text"
                    ].join(" ")}
                    onClick={() => setPresetFilter(filter)}
                    type="button"
                  >
                    {presetFilterLabels[filter]}
                  </button>
                ))}
              </div>

              <div className="rounded-lg border border-border/80 bg-surface p-2">
                <div className="grid min-w-0 gap-2 xl:grid-cols-2">
                  {filteredPresetThemes.length > 0 ? filteredPresetThemes.map((preset) => {
                    const isSelected = preset.prompt === form.prompt &&
                      (!preset.trend || preset.trend === form.trend) &&
                      (!preset.mood || preset.mood === form.mood) &&
                      (!preset.motion || preset.motion === form.motion) &&
                      (!preset.brand || preset.brand === form.brand) &&
                      (!preset.accent || preset.accent === form.accent);

                    return (
                      <button
                        key={preset.name}
                        className={[
                          "group grid min-h-[5.25rem] content-start overflow-hidden rounded-lg border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:shadow-focus",
                          isSelected ? "border-[var(--color-zeno-brand)] bg-background shadow-[inset_3px_0_0_var(--color-zeno-brand)]" : "border-border bg-background hover:border-text/50 hover:bg-surface-raised"
                        ].join(" ")}
                        onClick={() => applyPreset(preset)}
                        type="button"
                      >
                        <span className="flex min-w-0 items-center justify-between gap-2">
                          <span className="min-w-0 truncate text-sm font-bold leading-5 text-text">{preset.name}</span>
                          <span
                            className="flex shrink-0 items-center gap-1 rounded-pill border border-border/70 bg-surface px-1.5 py-0.5"
                          >
                            <input aria-label={`${preset.name} brand color`} className="size-3 shrink-0 appearance-none rounded-pill border border-border/70 bg-transparent p-0 disabled:opacity-100 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0" disabled type="color" value={preset.brand ?? "#111111"} />
                            <input aria-label={`${preset.name} accent color`} className="size-3 shrink-0 appearance-none rounded-pill border border-border/70 bg-transparent p-0 disabled:opacity-100 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0" disabled type="color" value={preset.accent ?? "#737373"} />
                            <span className="size-3 rounded-pill border border-border/70 bg-background" />
                          </span>
                        </span>
                        <span className="mt-0.5 flex min-w-0 items-center gap-1.5">
                          <span className="shrink-0 rounded-pill bg-surface px-2 py-1 text-[0.62rem] font-bold uppercase leading-none text-text-muted">{preset.trend ?? "theme"}</span>
                          <span className="min-w-0 overflow-hidden text-xs font-medium leading-4 text-text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{preset.prompt}</span>
                        </span>
                      </button>
                    );
                  }) : (
                    <div className="grid min-h-[5rem] place-items-center rounded-md border border-dashed border-border bg-background px-3 text-center">
                      <Text size="label" tone="muted" weight="medium">No presets found</Text>
                    </div>
                  )}
                </div>
              </div>
            </section>
            <div aria-hidden="true" className="h-8 shrink-0" />
          </Stack>
        </div>
      </Card>

      {isPublishDialogOpen && typeof document !== "undefined"
        ? createPortal(
          <PublishDialog
            project={projects.find((item) => item.id === selectedProjectId) ?? null}
            environment={environment}
            isPublishing={isPublishing}
            publishError={publishError}
            publishResult={publishResult}
            onClose={() => setIsPublishDialogOpen(false)}
            onPublish={onPublish}
          />,
          document.body
        )
        : null}
    </aside>
  );
}

function PublishDialog({
  project,
  environment,
  isPublishing,
  publishError,
  publishResult,
  onClose,
  onPublish
}: {
  project: ProjectSummary | null;
  environment: string;
  isPublishing: boolean;
  publishError: string | null;
  publishResult: PublishResult | null;
  onClose: () => void;
  onPublish: () => void;
}): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6" role="dialog" aria-modal="true" aria-labelledby="publish-theme-title">
      <button className="absolute inset-0 cursor-default" aria-label="Close publish dialog" onClick={onClose} type="button" />
      <div className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-[420px] flex-col overflow-hidden rounded-xl border border-border bg-surface text-text shadow-floating">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          <Stack direction="row" align="start" justify="between" gap="$3">
            <Stack gap="$2" className="min-w-0">
              <Text id="publish-theme-title" size="label" tone="muted" weight="bold" className="text-[0.68rem] uppercase leading-3">Hosted publish</Text>
              <Text as="h2" size="title" weight="semibold" className="text-[1.05rem] leading-6">Publish theme</Text>
              <Text tone="muted" className="text-[0.68rem] leading-4">Publish the approved config to the active environment alias.</Text>
            </Stack>
            <button
              aria-label="Close publish dialog"
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface-raised text-text-muted transition hover:text-text focus-visible:outline-none focus-visible:shadow-focus"
              onClick={onClose}
              type="button"
            >
              <X className="size-4" />
            </button>
          </Stack>

          <div className="mt-4 grid gap-2.5 rounded-lg border border-border bg-background p-2.5">
            <ReadOnlyMeta label="Project" value={project ? `${project.name} (${project.id})` : "No project selected"} />
            <ReadOnlyMeta label="Environment" value={environment || "production"} />
          </div>

          {publishError ? (
            <Text size="label" tone="danger" weight="medium" className="mt-3">{publishError}</Text>
          ) : null}

          {publishResult ? (
            <div className="mt-3 grid gap-1.5 rounded-lg border border-border bg-background p-2.5">
              <Text size="label" tone="success" weight="bold">Published {publishResult.version}</Text>
              <HostedLink label="JSON" href={publishResult.jsonUrl} />
              <HostedLink label="CSS" href={publishResult.cssUrl} />
              <HostedLink label="Version" href={publishResult.versionUrl} />
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-border bg-surface p-3">
          {publishResult ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-raised px-4 text-sm font-bold text-text shadow-[0_10px_24px_rgb(15_23_42_/_0.12)] transition hover:bg-background focus-visible:outline-none focus-visible:shadow-focus"
            >
              <CheckCircle2 className="size-4 shrink-0 text-success" />
              <span>Done</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={isPublishing || !project}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-zeno-brand),var(--color-text)_10%)] bg-[var(--color-zeno-brand)] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgb(235_75_41_/_0.24)] transition hover:brightness-95 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="size-4 shrink-0" />
              <span>{isPublishing ? "Publishing" : "Publish theme"}</span>
            </button>
          )}
          {!project && !publishResult ? (
            <Text size="label" tone="muted" weight="medium" className="mt-2 text-center">Select a project before publishing.</Text>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function HostedLink({ label, href }: { label: string; href: string }): React.ReactElement {
  return (
    <a className="min-w-0 truncate font-mono text-xs font-semibold text-brand underline-offset-4 hover:underline" href={href} target="_blank" rel="noreferrer">
      {label}: {href}
    </a>
  );
}

function ReadOnlyMeta({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-2 text-xs">
      <span className="font-bold text-text-muted">{label}</span>
      <span className="truncate font-mono font-semibold text-text">{value}</span>
    </div>
  );
}

function ThemeDetailsPanel({
  form,
  generated
}: {
  form: ThemeFormState;
  generated: ReturnType<typeof generateTheme>;
}): React.ReactElement {
  const runtimeThemeCss = React.useMemo(() => generateRuntimeThemeCss(generated.tokens), [generated.tokens]);
  const bundle = React.useMemo(() => generateExportBundle(generated.tokens), [generated.tokens]);
  const nativeWindCss = React.useMemo(() => generateNativeWindThemeCss(generated.tokens), [generated.tokens]);
  const tokenJson = React.useMemo(() => JSON.stringify(generated.tokens, null, 2), [generated.tokens]);

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-[0_14px_44px_rgb(15_23_42_/_0.07)]">
        <Stack gap="$2" className="min-w-0">
          <Text as="p" size="label" tone="muted" weight="bold" className="text-[0.68rem] uppercase leading-3 tracking-[0.08em]">Generated details</Text>
          <Text as="h2" size="title" weight="semibold" className="truncate text-[1.35rem] leading-7">{generated.name}</Text>
          <Text tone="muted" className="max-w-3xl text-sm leading-6">Inspect the live token contract, runtime CSS, Tailwind output, and NativeWind-ready CSS for the active console theme.</Text>
        </Stack>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <DetailSummaryCard icon={<CheckCircle2 className="size-4" />} label="Accessibility" value={String(generated.score.accessibility)} />
        <DetailSummaryCard icon={<Palette className="size-4" />} label="Palette" value={`${form.brand} / ${form.accent}`} />
        <DetailSummaryCard icon={<Layers3 className="size-4" />} label="Mode" value={generated.tokens.knobs.mode ?? "light"} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card variant="surface" className="min-w-0 rounded-xl p-4">
          <Card.Header>
            <Stack gap="$2">
              <Text size="title" weight="semibold" className="text-[1.05rem] leading-6">Theme anatomy</Text>
              <Text tone="muted" className="text-sm leading-6">The prompt resolves into knobs and semantic tokens used by the component runtime.</Text>
            </Stack>
          </Card.Header>
          <Card.Content>
            <div className="grid gap-2">
              {[
                ["Prompt", form.prompt || "No prompt yet"],
                ["Trend", generated.tokens.knobs.trend],
                ["Mood", generated.tokens.knobs.mood],
                ["Motion", generated.tokens.knobs.motion],
                ["Density", generated.tokens.knobs.density],
                ["Texture", generated.tokens.knobs.texture]
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 rounded-lg border border-border bg-background p-3">
                  <Text size="label" tone="muted" weight="medium">{label}</Text>
                  <Text weight="semibold" className="break-words capitalize">{value}</Text>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Card variant="raised" className="min-w-0 rounded-xl p-4">
          <Card.Header>
            <Stack gap="$2">
              <Text size="title" weight="semibold" className="text-[1.05rem] leading-6">Color tokens</Text>
              <Text tone="muted" className="text-sm leading-6">Surface, text, brand, accent, status, focus, and runtime color aliases.</Text>
            </Stack>
          </Card.Header>
          <Card.Content>
            <div className="grid max-h-[28rem] min-w-0 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {Object.entries(generated.tokens.color).map(([name, value]) => (
                <DetailColorTokenRow key={name} name={name} value={value} />
              ))}
            </div>
          </Card.Content>
        </Card>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-2">
        <DetailCodeCard title="Tailwind @theme" value={bundle.tailwindThemeCss} />
        <DetailCodeCard title="Runtime scoped CSS" value={runtimeThemeCss} />
        <DetailCodeCard title="NativeWind-ready CSS" value={nativeWindCss} />
        <DetailCodeCard title="Token JSON" value={tokenJson} />
      </section>
    </section>
  );
}

function DetailSummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }): React.ReactElement {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-surface-raised text-text">
        {icon}
      </div>
      <div className="grid min-w-0 gap-2">
        <Text size="label" tone="muted" weight="medium" className="block leading-4">{label}</Text>
        <Text size="title" weight="semibold" className="block truncate text-[1.05rem] leading-6">{value}</Text>
      </div>
    </div>
  );
}

function DetailColorTokenRow({ name, value }: { name: string; value: string }): React.ReactElement {
  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border bg-background p-3">
      <input aria-label={`${name} color`} className="size-8 shrink-0 appearance-none rounded-md border border-border bg-transparent p-0 disabled:opacity-100 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0" disabled type="color" value={colorInputValue(value)} />
      <div className="grid min-w-0 gap-1">
        <Text size="label" weight="bold" className="truncate">{name}</Text>
        <Text size="label" tone="muted" className="break-all font-mono text-[0.72rem] leading-4">{value}</Text>
      </div>
    </div>
  );
}

function DetailCodeCard({ title, value }: { title: string; value: string }): React.ReactElement {
  const [copied, setCopied] = React.useState(false);

  return (
    <Card variant="surface" className="min-w-0 rounded-xl p-0">
      <Card.Header className="mb-0 border-b border-border px-4 py-3">
        <Stack direction="row" align="center" gap="$2" className="min-w-0">
          <FileCode2 className="size-4 shrink-0 text-brand" />
          <Text weight="semibold" className="truncate">{title}</Text>
        </Stack>
        <Button
          size="$2"
          circular
          tone="neutral"
          variant="ghost"
          onClick={() => {
            void navigator.clipboard?.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
          aria-label={`Copy ${title}`}
        >
          <Button.Icon><Copy className="size-4" /></Button.Icon>
        </Button>
      </Card.Header>
      <Card.Content>
        <pre className="max-h-[420px] min-w-0 overflow-auto p-4 font-mono text-xs leading-5 text-text">{value}</pre>
        {copied ? <Text size="label" tone="success" weight="medium" className="px-4 pb-4">Copied</Text> : null}
      </Card.Content>
    </Card>
  );
}

function BriefGroup({
  title,
  icon,
  children
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="grid gap-3 rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <Text size="label" tone="muted" weight="bold" className="text-[0.72rem] uppercase leading-3 tracking-[0.08em]">{title}</Text>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-raised text-text-muted">{icon}</span>
      </div>
      {children}
    </section>
  );
}

function ProjectSelect({
  projects,
  value,
  onChange
}: {
  projects: ProjectSummary[];
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <Stack gap="none" className="min-w-0 gap-1.5">
      <Text as="label" size="label" tone="muted" weight="medium" className="text-xs leading-4">Project</Text>
      <div className="group relative min-w-0">
        <select
          className="h-10 w-full min-w-0 appearance-none rounded-lg border border-border/80 bg-surface px-3 pr-8 text-sm font-semibold leading-none text-text outline-none transition hover:border-text/35 hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_3px_rgb(235_75_41_/_0.12)]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {projects.length === 0 ? <option value="">Loading project</option> : null}
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded bg-surface-raised text-text-muted transition group-hover:text-text">
          <ChevronDown className="size-3" />
        </span>
      </div>
    </Stack>
  );
}

function DraftSelect({
  drafts,
  value,
  onChange
}: {
  drafts: ThemeDraftSummary[];
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <Stack gap="none" className="min-w-0 gap-1.5">
      <Text as="label" size="label" tone="muted" weight="medium" className="text-xs leading-4">Saved themes</Text>
      <div className="group relative min-w-0">
        <select
          className="h-10 w-full min-w-0 appearance-none rounded-lg border border-border/80 bg-surface px-3 pr-8 text-sm font-semibold leading-none text-text outline-none transition hover:border-text/35 hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_3px_rgb(235_75_41_/_0.12)]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Current generated theme</option>
          {drafts.map((draft) => (
            <option key={draft.id} value={draft.id}>{draft.name}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded bg-surface-raised text-text-muted transition group-hover:text-text">
          <ChevronDown className="size-3" />
        </span>
      </div>
    </Stack>
  );
}

function CompactInput({
  label,
  hint,
  className,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}): React.ReactElement {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <Stack gap="none" className="min-w-0 gap-1.5">
      <Text as="label" htmlFor={inputId} size="label" tone="muted" weight="medium" className="text-xs leading-4">
        {label}
      </Text>
      <input
        id={inputId}
        className={[
          "h-10 w-full rounded-lg border border-border/80 bg-surface px-3 py-1 text-sm font-semibold text-text outline-none transition placeholder:text-text-muted hover:border-text/35 hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_3px_rgb(235_75_41_/_0.12)]",
          className
        ].filter(Boolean).join(" ")}
        {...props}
      />
      {hint ? (
        <Text size="label" tone="muted" className="text-xs leading-4">
          {hint}
        </Text>
      ) : null}
    </Stack>
  );
}

function SelectControl<T extends string>({
  label,
  value,
  values,
  onChange
}: {
  label: string;
  value: T;
  values: T[];
  onChange: (value: T) => void;
}): React.ReactElement {
  return (
    <Stack gap="none" className="min-w-0 gap-1.5">
      <Text as="label" size="label" tone="muted" weight="medium" className="text-xs leading-4">{label}</Text>
      <div className="group relative min-w-0">
        <select
          className="h-10 w-full min-w-0 appearance-none rounded-lg border border-border/80 bg-surface px-3 pr-8 text-sm font-semibold capitalize leading-none text-text outline-none transition hover:border-text/35 hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_3px_rgb(235_75_41_/_0.12)]"
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
        >
          {values.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded bg-surface-raised text-text-muted transition group-hover:text-text">
          <ChevronDown className="size-3" />
        </span>
      </div>
    </Stack>
  );
}

function ColorControl({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <Stack gap="none" className="min-w-0 gap-1.5">
      <Text as="label" size="label" tone="muted" weight="medium" className="text-xs leading-4">{label}</Text>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-border/80 bg-surface px-3 transition hover:border-text/35 hover:bg-surface-raised focus-within:border-[var(--color-zeno-brand)] focus-within:shadow-[0_0_0_3px_rgb(235_75_41_/_0.12)]">
        <input
          aria-label={`${label} color swatch`}
          className="size-5 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          aria-label={`${label} hex value`}
          className="min-w-0 flex-1 bg-transparent font-mono text-sm font-semibold leading-none text-text outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </Stack>
  );
}

function PreviewPanel({
  packageTheme
}: {
  packageTheme: PackageZenoTokenConfig;
}): React.ReactElement {
  return (
    <section className="zeno-preview order-2 min-w-0 overflow-hidden rounded-xl border border-border bg-background shadow-[0_18px_54px_rgb(15_23_42_/_0.10)] transition-theme lg:sticky lg:top-[96px] lg:flex lg:h-[calc(100dvh-188px)] lg:max-h-[860px] lg:min-h-[560px] lg:flex-col">
      <div className="shrink-0 border-b border-border bg-surface px-3.5 py-3">
        <Stack direction="row" align="center" gap="$2" className="min-w-0">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-brand-contrast shadow-glow">
            <LayoutDashboard className="size-4" />
          </span>
          <Stack gap="none" className="min-w-0 gap-1">
            <Text as="p" size="label" tone="muted" weight="bold" className="text-[0.64rem] uppercase leading-3">Sandbox</Text>
            <Text as="h2" size="title" weight="semibold" className="truncate text-[1.05rem] leading-5">Package primitives</Text>
          </Stack>
        </Stack>
      </div>

      <div className="zeno-soft-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 pb-20">
        <div className="grid min-w-0 gap-3">
          <div className="grid gap-2 md:grid-cols-3">
            <MetricTile icon={<Layers3 className="size-4" />} label="Primitives" value="10" />
            <MetricTile icon={<Palette className="size-4" />} label="Semantic tokens" value="48" />
            <MetricTile icon={<Cpu className="size-4" />} label="Exports" value="Web + RN" />
          </div>

          <PublishedPackagePlayground packageTheme={packageTheme} />

          <SizeSpecimen />
        </div>
      </div>
    </section>
  );
}

function PublishedPackagePlayground({
  packageTheme
}: {
  packageTheme: PackageZenoTokenConfig;
}): React.ReactElement {
  return (
    <ZenoThemeProvider source={{ type: "static", theme: packageTheme }} fallbackTheme={packageTheme} runtimePolicy="static-only">
      <div className="rounded-xl border border-[var(--zeno-color-border-default)] bg-[linear-gradient(135deg,var(--zeno-color-bg-canvas),var(--zeno-color-bg-subtle))] p-2.5 text-[var(--zeno-color-text-primary)] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.08),0_18px_54px_rgb(0_0_0_/_0.16)]">
        <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)]">
          <ZenoCard tone="subtle" padding="md" className="min-w-0 border border-[color-mix(in_srgb,var(--zeno-color-border-default),var(--zeno-color-text-primary)_12%)] bg-[color-mix(in_srgb,var(--zeno-color-bg-surface),var(--zeno-color-bg-canvas)_24%)] shadow-[0_16px_42px_rgb(0_0_0_/_0.14)]">
            <ZenoStack gap="md">
              <ZenoStack direction="row" gap="sm" align="flex-start" justify="space-between">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--zeno-color-brand-secondary)] text-[var(--zeno-color-text-inverse)]">
                  <Gem className="size-4" />
                </span>
                <ZenoBadge tone="brand" variant="solid">Rendered</ZenoBadge>
              </ZenoStack>

              <ZenoStack gap="xs">
                <ZenoText variant="title" weight={700}>Package primitives</ZenoText>
                <ZenoText tone="muted">Read-only examples rendered from the published token contract.</ZenoText>
              </ZenoStack>

              <div className="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
                <PackagePrimitiveDemo name="Avatar">
                  <ZenoStack direction="row" gap="sm" align="center">
                    <ZenoAvatar alt="Zeno UI placeholder avatar" name="Zeno UI" src={packageAvatarSrc} />
                    <ZenoAvatar alt="Theme Cloud placeholder avatar" name="Theme Cloud" size="sm" src={packageAvatarSrc} />
                    <ZenoAvatar alt="Design System placeholder avatar" name="Design System" size="lg" src={packageAvatarSrc} />
                  </ZenoStack>
                </PackagePrimitiveDemo>

                <PackagePrimitiveDemo name="Badge">
                  <ZenoStack direction="row" gap="xs" wrap="wrap">
                    <ZenoBadge tone="brand" variant="solid">Brand</ZenoBadge>
                    <ZenoBadge tone="success" variant="soft">Synced</ZenoBadge>
                    <ZenoBadge tone="muted" variant="outline">Preview</ZenoBadge>
                  </ZenoStack>
                </PackagePrimitiveDemo>

                <PackagePrimitiveDemo name="Button">
                  <ZenoStack direction="row" gap="xs" wrap="wrap">
                    <ZenoButton size="sm">Primary</ZenoButton>
                    <ZenoButton size="sm" variant="secondary">Secondary</ZenoButton>
                    <ZenoButton size="sm" variant="ghost">Ghost</ZenoButton>
                  </ZenoStack>
                </PackagePrimitiveDemo>

                <PackagePrimitiveDemo name="Checkbox">
                  <ZenoCheckbox defaultChecked label="Runtime alias" description="Published contract active." />
                </PackagePrimitiveDemo>

                <PackagePrimitiveDemo name="Card">
                  <ZenoCard padding="md" tone="surface" className="shadow-none">
                    <ZenoText weight={700}>Runtime card</ZenoText>
                    <ZenoText variant="caption" tone="muted">Surface, border, radius, and shadow come from tokens.</ZenoText>
                  </ZenoCard>
                </PackagePrimitiveDemo>

                <PackagePrimitiveDemo name="Input">
                  <ZenoInput label="Project" value="acme-dashboard" readOnly />
                </PackagePrimitiveDemo>

                <PackagePrimitiveDemo name="Select">
                  <ZenoSelect
                    label="Environment"
                    defaultValue="production"
                    options={[
                      { label: "Production", value: "production" },
                      { label: "Preview", value: "preview" },
                      { label: "Staging", value: "staging" }
                    ]}
                  />
                </PackagePrimitiveDemo>

                <PackagePrimitiveDemo name="Stack">
                  <ZenoStack direction="row" gap="sm" wrap="wrap">
                    <ZenoBadge tone="muted" variant="outline">One</ZenoBadge>
                    <ZenoBadge tone="muted" variant="outline">Two</ZenoBadge>
                    <ZenoBadge tone="muted" variant="outline">Three</ZenoBadge>
                  </ZenoStack>
                </PackagePrimitiveDemo>

                <PackagePrimitiveDemo name="Switch">
                  <ZenoSwitch defaultChecked label="Runtime theme" description="Static provider enabled." />
                </PackagePrimitiveDemo>

                <PackagePrimitiveDemo name="Text">
                  <ZenoStack gap="xs">
                    <ZenoText variant="title" weight={700}>Tokenized title</ZenoText>
                    <ZenoText tone="muted">Body copy follows the same semantic type scale.</ZenoText>
                  </ZenoStack>
                </PackagePrimitiveDemo>
              </div>
            </ZenoStack>
          </ZenoCard>

          <ZenoCard tone="subtle" padding="md" className="min-w-0 border border-[color-mix(in_srgb,var(--zeno-color-border-default),var(--zeno-color-text-primary)_12%)] bg-[color-mix(in_srgb,var(--zeno-color-bg-surface),var(--zeno-color-bg-canvas)_24%)] shadow-[0_16px_42px_rgb(0_0_0_/_0.14)]">
            <ZenoStack gap="md">
              <ZenoStack gap="xs">
                <ZenoText variant="title" weight={700}>Token map</ZenoText>
                <ZenoText tone="muted">Values currently applied to the package components.</ZenoText>
              </ZenoStack>
              <ZenoStack gap="xs">
                <PackageTokenRow label="Brand" value={packageTheme.tokens.color["brand.primary"]} swatch={packageTheme.tokens.color["brand.primary"]} />
                <PackageTokenRow label="Accent" value={packageTheme.tokens.color["brand.secondary"]} swatch={packageTheme.tokens.color["brand.secondary"]} />
                <PackageTokenRow label="Surface" value={packageTheme.tokens.color["bg.surface"]} swatch={packageTheme.tokens.color["bg.surface"]} />
                <PackageTokenRow label="Canvas" value={packageTheme.tokens.color["bg.canvas"]} swatch={packageTheme.tokens.color["bg.canvas"]} />
              </ZenoStack>
            </ZenoStack>
          </ZenoCard>
        </div>
      </div>
    </ZenoThemeProvider>
  );
}

function PackagePrimitiveDemo({ children, name }: { children: React.ReactNode; name: string }): React.ReactElement {
  return (
    <div className="grid min-w-0 gap-2 rounded-[var(--zeno-radius-lg)] border border-[color-mix(in_srgb,var(--zeno-color-border-default),var(--zeno-color-text-primary)_10%)] bg-[color-mix(in_srgb,var(--zeno-color-bg-surface),var(--zeno-color-bg-canvas)_32%)] p-3">
      <ZenoText variant="caption" tone="muted" weight={700} className="uppercase">{name}</ZenoText>
      <div className="min-w-0">
        {children}
      </div>
    </div>
  );
}

function PackageTokenRow({ label, swatch, value }: { label: string; swatch: string | undefined; value: string | undefined }): React.ReactElement {
  const resolvedValue = value ?? "n/a";

  return (
    <ZenoCard padding="md" className="shadow-none">
      <ZenoStack direction="row" align="center" justify="space-between" gap="md">
        <ZenoStack direction="row" align="center" gap="sm" className="min-w-0">
          <input aria-label={`${label} swatch`} className="size-7 shrink-0 appearance-none rounded-md border border-border bg-transparent p-0 disabled:opacity-100 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-0" disabled type="color" value={colorInputValue(swatch)} />
          <ZenoText weight={700}>{label}</ZenoText>
        </ZenoStack>
        <ZenoText variant="caption" tone="muted" className="break-words text-right font-mono">{resolvedValue}</ZenoText>
      </ZenoStack>
    </ZenoCard>
  );
}

function colorInputValue(value: string | undefined): string {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
}

function SizeSpecimen(): React.ReactElement {
  return (
    <Card variant="surface" className="rounded-lg border-border/80 p-3.5">
      <div className="mb-3 grid gap-1.5">
        <Text size="label" tone="muted" weight="bold" className="text-[0.68rem] uppercase leading-3">Fixed system scale</Text>
        <Text size="title" weight="semibold" className="text-[1rem] leading-5">Typography and controls</Text>
      </div>
      <div className="grid gap-3">
        <div className="grid min-w-0 gap-2">
          {[
            ["Label", "text-label", "0.8125rem / 1rem"],
            ["Body", "text-body", "0.9375rem / 1.5rem"],
            ["Title", "text-title", "1.5rem / 1.875rem"]
          ].map(([name, className, value]) => (
            <div key={name} className="grid min-w-0 gap-1.5 rounded-lg border border-border bg-background p-2.5">
              <Text size="label" tone="muted" weight="medium">{name}</Text>
              <p className={`${className} min-w-0 truncate font-semibold text-text`}>Aa Zeno system</p>
              <Text size="label" tone="muted" className="font-mono text-[0.66rem]">{value}</Text>
            </div>
          ))}
        </div>
        <div className="grid min-w-0 gap-2">
          {[
            ["$2", "$2", "32px"],
            ["$3", "$3", "40px"],
            ["$4", "$4", "48px"]
          ].map(([label, size, value]) => (
            <div key={label} className="grid min-w-0 gap-1.5 rounded-lg border border-border bg-background p-2.5">
              <Text size="label" tone="muted" weight="medium">{label}</Text>
              <Button size={size as "$2" | "$3" | "$4" | "$5"} tone="neutral" variant="outline" className="w-fit">
                <Button.Text>Control {label}</Button.Text>
              </Button>
              <Text size="label" tone="muted" className="font-mono text-[0.66rem]">{value}</Text>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function PreviewSidebar({ form }: { form: ThemeFormState }): React.ReactElement {
  return (
    <aside className="hidden rounded-lg border border-border bg-surface p-3 2xl:block">
      <Stack gap="$2">
        {[
          ["Overview", "Active"],
          ["Components", "5 primitives"],
          ["Tokens", "48 values"],
          ["Motion", form.motion]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg px-3 py-3 transition hover:bg-surface-raised">
            <Text weight="semibold">{label}</Text>
            <Text size="label" tone="muted" className="mt-1 capitalize">{value}</Text>
          </div>
        ))}
      </Stack>
    </aside>
  );
}

function MetricTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }): React.ReactElement {
  return (
    <div className="grid min-w-0 content-start gap-3 rounded-lg border border-border bg-surface p-3">
      <div className="flex size-8 items-center justify-center rounded-lg bg-surface-raised text-brand">
        {icon}
      </div>
      <div className="grid min-w-0 gap-1.5">
        <Text size="label" tone="muted" weight="medium" className="block text-[0.72rem] leading-4">{label}</Text>
        <Text size="title" weight="semibold" className="block break-words text-[1.08rem] leading-6">{value}</Text>
      </div>
    </div>
  );
}

function PaletteRow({
  name,
  value,
  tone
}: {
  name: string;
  value: string;
  tone: "brand" | "accent" | "surface" | "text";
}): React.ReactElement {
  const className = {
    brand: "bg-brand",
    accent: "bg-accent",
    surface: "bg-surface",
    text: "bg-text"
  }[tone];

  return (
    <div className="grid gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <Stack direction="row" align="center" gap="$3" className="min-w-0">
        <span className={`size-8 rounded-md border border-border ${className}`} />
        <Text weight="semibold">{name}</Text>
      </Stack>
      <Text size="label" tone="muted" weight="medium" className="break-all font-mono">{value}</Text>
    </div>
  );
}
