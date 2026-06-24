"use client";

import { CheckCircle2, ChevronDown, Cpu, Gem, LayoutDashboard, Layers3, Palette, Sparkles, SwatchBook, Wand2, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button, Card, Input, Stack, Text } from "@zeno-ui/react";
import { generateRuntimeThemeCss } from "@zeno-ui/tailwind-preset";
import { generateTheme } from "@zeno-ui/theme-engine";
import { createZenoTokenConfig } from "@zeno-ui/tokens";
import { useAccountHistory, useDetailsHref } from "../site-chrome";
import {
  createDetailsHref,
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

const publishButtonStyle: React.CSSProperties = {
  backgroundColor: "var(--color-zeno-brand)",
  borderColor: "color-mix(in srgb, var(--color-zeno-brand), var(--color-text) 10%)",
  boxShadow: "0 10px 24px rgb(235 75 41 / 0.24)",
  color: "#ffffff"
};

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
  const [projects, setProjects] = React.useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState("");
  const [environment, setEnvironment] = React.useState("production");
  const [drafts, setDrafts] = React.useState<ThemeDraftSummary[]>([]);
  const [selectedDraftId, setSelectedDraftId] = React.useState("");
  const [publishResult, setPublishResult] = React.useState<PublishResult | null>(null);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishError, setPublishError] = React.useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
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
  const detailsHref = React.useMemo(() => createDetailsHref(form), [form]);
  useDetailsHref(detailsHref);
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
      <main className="site-content mx-auto grid w-full max-w-[1440px] gap-5 px-4 py-5 md:px-6 md:py-7 lg:grid-cols-[360px_minmax(0,1fr)]">
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
          draftError={draftError}
          onSaveDraft={saveDraft}
          isPublishing={isPublishing}
          publishError={publishError}
          publishResult={publishResult}
          onPublish={publishTheme}
        />
        <PreviewPanel
          themeName={generated.name}
          score={generated.score.accessibility}
          form={form}
        />
      </main>
    </>
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
  draftError,
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
  draftError: string | null;
  onSaveDraft: () => void;
  isPublishing: boolean;
  publishError: string | null;
  publishResult: PublishResult | null;
  onPublish: () => void;
}): React.ReactElement {
  const [isPublishDialogOpen, setIsPublishDialogOpen] = React.useState(false);

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
    <aside className="order-2 min-w-0 lg:sticky lg:top-[86px] lg:order-1 lg:h-[calc(100vh-106px)]">
      <Card variant="surface" className="min-w-0 max-w-full flex h-full flex-col overflow-hidden rounded-lg border-text/10 bg-surface p-0 shadow-[0_18px_60px_rgb(15_23_42_/_0.08)]">
        <div className="border-b border-border px-3.5 py-3">
          <Stack direction="row" align="center" justify="between" gap="$2">
            <Stack gap="$2" className="min-w-0">
              <Text as="p" size="label" tone="muted" weight="bold" className="text-[0.62rem] uppercase leading-3">Theme brief</Text>
              <Text as="h1" size="title" weight="semibold" className="text-[1.05rem] leading-5">Shape the system</Text>
            </Stack>
            <span className="grid size-7 place-items-center rounded-lg bg-surface-raised text-text">
              <Wand2 className="size-3.5" />
            </span>
          </Stack>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-hidden px-3.5 py-3">
          <Stack gap="none" className="h-full min-h-0 min-w-0 gap-3.5">
            <label className="grid min-w-0 gap-1">
              <Text as="span" size="label" tone="muted" weight="bold" className="text-[0.64rem] uppercase leading-3 tracking-[0.08em]">Prompt</Text>
              <textarea
                className="h-20 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[0.74rem] leading-4 text-text outline-none transition placeholder:text-text-muted focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_2px_rgb(235_75_41_/_0.12)]"
                value={form.prompt}
                placeholder="Describe the interface mood, product type, density, and motion."
                onChange={(event) => updateForm("prompt", event.target.value)}
              />
            </label>

            <BriefGroup title="Direction" icon={<Wand2 className="size-3.5" />}>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <SelectControl label="Trend" value={form.trend} values={trends} onChange={(value) => updateForm("trend", value)} />
                <SelectControl label="Mood" value={form.mood} values={moods} onChange={(value) => updateForm("mood", value)} />
                <SelectControl label="Motion" value={form.motion} values={motions} onChange={(value) => updateForm("motion", value)} />
              </div>
            </BriefGroup>

            <BriefGroup title="Palette" icon={<Palette className="size-3.5" />}>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <ColorControl label="Brand" value={form.brand} onChange={(value) => updateForm("brand", value)} />
                <ColorControl label="Accent" value={form.accent} onChange={(value) => updateForm("accent", value)} />
              </div>
            </BriefGroup>

            <BriefGroup title="Workspace" icon={<Layers3 className="size-3.5" />}>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <ProjectSelect projects={projects} value={selectedProjectId} onChange={onProjectChange} />
                <CompactInput
                  label="Environment"
                  value={environment}
                  onChange={(event) => onEnvironmentChange(event.target.value)}
                />
              </div>
              <DraftSelect drafts={drafts} value={selectedDraftId} onChange={onDraftChange} />
              <Button
                type="button"
                size="$2"
                tone="neutral"
                variant="outline"
                disabled={isSavingDraft || !selectedProjectId}
                onClick={onSaveDraft}
                className="w-full rounded-lg text-xs font-bold"
              >
                <Button.Icon><CheckCircle2 className="size-3.5" /></Button.Icon>
                <Button.Text>{isSavingDraft ? "Saving draft" : "Save theme draft"}</Button.Text>
              </Button>
              {draftError ? <Text size="label" tone="danger" weight="medium">{draftError}</Text> : null}
            </BriefGroup>

            <Stack gap="none" className="min-h-0 flex-1 gap-1.5">
              <Stack direction="row" align="center" justify="between" gap="$2" className="shrink-0">
                <Text size="label" tone="muted" weight="medium" className="text-xs">Predefined themes</Text>
                <SwatchBook className="size-3.5 text-text-muted" />
              </Stack>
              <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain pr-1">
                {featuredPresetThemes.map((preset) => (
                  <button
                    key={preset.name}
                    className="group grid min-h-[3.35rem] shrink-0 content-center overflow-hidden rounded-lg border border-border bg-background px-2.5 py-2 text-left text-[0.78rem] font-semibold leading-4 text-text transition hover:border-text/50 hover:bg-surface-raised focus-visible:outline-none focus-visible:shadow-focus"
                    onClick={() => {
                      updateForm("prompt", preset.prompt);
                      if (preset.trend) updateForm("trend", preset.trend);
                      if (preset.mood) updateForm("mood", preset.mood);
                      if (preset.motion) updateForm("motion", preset.motion);
                      if (preset.brand) updateForm("brand", preset.brand);
                      if (preset.accent) updateForm("accent", preset.accent);
                    }}
                    style={presetThemeStyle(preset.brand, preset.accent)}
                    type="button"
                  >
                    <span className="flex min-w-0 items-center justify-between gap-2">
                      <span className="min-w-0 truncate">{preset.name}</span>
                      <span
                        className="flex shrink-0 items-center gap-1 rounded-pill border border-border/70 bg-surface px-1.5 py-0.5"
                        style={presetSwatchRailStyle(preset.brand, preset.accent)}
                      >
                        <span className="size-3 rounded-pill border border-border/70" style={{ background: preset.brand ?? "#111111" }} />
                        <span className="size-3 rounded-pill border border-border/70" style={{ background: preset.accent ?? "#737373" }} />
                        <span className="size-3 rounded-pill border border-border/70 bg-background" />
                      </span>
                    </span>
                    <span className="mt-1 block max-w-full truncate text-[0.68rem] font-medium leading-[0.85rem] text-text-muted">{preset.prompt}</span>
                  </button>
                ))}
              </div>
            </Stack>
          </Stack>
        </div>
        <div className="sticky bottom-0 z-10 shrink-0 border-t border-border bg-surface px-3.5 py-2.5 shadow-[0_-14px_34px_rgb(15_23_42_/_0.06)]">
          <Button
            type="button"
            size="$2"
            onClick={() => setIsPublishDialogOpen(true)}
            className="w-full rounded-lg text-xs font-bold hover:brightness-95"
            style={publishButtonStyle}
          >
            <Button.Icon><Sparkles className="size-3.5" /></Button.Icon>
            <Button.Text>Publish theme</Button.Text>
          </Button>
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="publish-theme-title">
      <button className="absolute inset-0 cursor-default" aria-label="Close publish dialog" onClick={onClose} type="button" />
      <div className="relative z-10 grid w-full max-w-[390px] gap-4 rounded-lg border border-border bg-surface p-4 text-text shadow-floating">
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

        <div className="grid gap-2.5 rounded-lg border border-border bg-background p-2.5">
          <ReadOnlyMeta label="Project" value={project ? `${project.name} (${project.id})` : "No project selected"} />
          <ReadOnlyMeta label="Environment" value={environment || "production"} />
        </div>

        <Button
          type="button"
          size="$2"
          onClick={onPublish}
          disabled={isPublishing || !project}
          className="w-full rounded-lg text-xs font-bold hover:brightness-95"
          style={publishButtonStyle}
        >
          <Button.Icon><Sparkles className="size-3.5" /></Button.Icon>
          <Button.Text>{isPublishing ? "Publishing" : "Publish theme"}</Button.Text>
        </Button>

        {publishError ? (
          <Text size="label" tone="danger" weight="medium">{publishError}</Text>
        ) : null}

        {publishResult ? (
          <div className="grid gap-1.5 rounded-lg border border-border bg-background p-2.5">
            <Text size="label" tone="success" weight="bold">Published {publishResult.version}</Text>
            <HostedLink label="JSON" href={publishResult.jsonUrl} />
            <HostedLink label="CSS" href={publishResult.cssUrl} />
            <HostedLink label="Version" href={publishResult.versionUrl} />
          </div>
        ) : null}
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
    <section className="grid gap-2 rounded-lg border border-border bg-background p-2.5">
      <div className="flex items-center justify-between gap-2">
        <Text size="label" tone="muted" weight="bold" className="text-[0.64rem] uppercase leading-3 tracking-[0.08em]">{title}</Text>
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-surface-raised text-text-muted">{icon}</span>
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
    <Stack gap="none" className="min-w-0 gap-1">
      <Text as="label" size="label" tone="muted" weight="medium" className="text-[0.64rem] leading-3">Project</Text>
      <div className="group relative min-w-0">
        <select
          className="h-8 w-full min-w-0 appearance-none rounded-lg border border-border/80 bg-surface px-2.5 pr-7 text-[0.7rem] font-semibold leading-none text-text outline-none transition hover:border-text/35 hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_2px_rgb(235_75_41_/_0.12)]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {projects.length === 0 ? <option value="">Loading project</option> : null}
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 grid size-4 -translate-y-1/2 place-items-center rounded bg-surface-raised text-text-muted transition group-hover:text-text">
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
    <Stack gap="none" className="min-w-0 gap-1">
      <Text as="label" size="label" tone="muted" weight="medium" className="text-[0.64rem] leading-3">Saved themes</Text>
      <div className="group relative min-w-0">
        <select
          className="h-8 w-full min-w-0 appearance-none rounded-lg border border-border/80 bg-surface px-2.5 pr-7 text-[0.7rem] font-semibold leading-none text-text outline-none transition hover:border-text/35 hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_2px_rgb(235_75_41_/_0.12)]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Current generated theme</option>
          {drafts.map((draft) => (
            <option key={draft.id} value={draft.id}>{draft.name}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 grid size-4 -translate-y-1/2 place-items-center rounded bg-surface-raised text-text-muted transition group-hover:text-text">
          <ChevronDown className="size-3" />
        </span>
      </div>
    </Stack>
  );
}

function presetThemeStyle(brand?: string, accent?: string): React.CSSProperties {
  const start = brand ?? "#111111";
  const end = accent ?? "#737373";

  return {
    backgroundImage: [
      "linear-gradient(135deg, color-mix(in srgb, var(--color-surface), transparent 18%) 0%, color-mix(in srgb, var(--color-surface), transparent 32%) 100%)",
      `linear-gradient(135deg, ${start} 0%, ${end} 100%)`
    ].join(", ")
  };
}

function presetSwatchRailStyle(brand?: string, accent?: string): React.CSSProperties {
  const start = brand ?? "#111111";
  const end = accent ?? "#737373";

  return {
    backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${start}, transparent 72%) 0%, color-mix(in srgb, ${end}, transparent 72%) 100%)`
  };
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
    <Stack gap="none" className="min-w-0 gap-1">
      <Text as="label" htmlFor={inputId} size="label" tone="muted" weight="medium" className="text-[0.64rem] leading-3">
        {label}
      </Text>
      <input
        id={inputId}
        className={[
          "h-8 w-full rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-[0.7rem] font-semibold text-text outline-none transition placeholder:text-text-muted hover:border-text/35 hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_2px_rgb(235_75_41_/_0.12)]",
          className
        ].filter(Boolean).join(" ")}
        {...props}
      />
      {hint ? (
        <Text size="label" tone="muted" className="text-[0.62rem] leading-4">
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
    <Stack gap="none" className="min-w-0 gap-1">
      <Text as="label" size="label" tone="muted" weight="medium" className="text-[0.64rem] leading-3">{label}</Text>
      <div className="group relative min-w-0">
        <select
          className="h-8 w-full min-w-0 appearance-none rounded-lg border border-border/80 bg-surface px-2.5 pr-7 text-[0.7rem] font-semibold capitalize leading-none text-text outline-none transition hover:border-text/35 hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-[0_0_0_2px_rgb(235_75_41_/_0.12)]"
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
        >
          {values.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 grid size-4 -translate-y-1/2 place-items-center rounded bg-surface-raised text-text-muted transition group-hover:text-text">
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
    <Stack gap="none" className="min-w-0 gap-1">
      <Text as="label" size="label" tone="muted" weight="medium" className="text-[0.64rem] leading-3">{label}</Text>
      <div className="flex h-8 items-center gap-2 rounded-lg border border-border/80 bg-surface px-2.5 transition hover:border-text/35 hover:bg-surface-raised focus-within:border-[var(--color-zeno-brand)] focus-within:shadow-[0_0_0_2px_rgb(235_75_41_/_0.12)]">
        <input
          aria-label={`${label} color swatch`}
          className="size-4 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          aria-label={`${label} hex value`}
          className="min-w-0 flex-1 bg-transparent font-mono text-[0.68rem] font-semibold leading-none text-text outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </Stack>
  );
}

function PreviewPanel({
  themeName,
  score,
  form
}: {
  themeName: string;
  score: number;
  form: ThemeFormState;
}): React.ReactElement {
  return (
    <section className="zeno-preview order-1 min-h-[640px] overflow-hidden rounded-xl border border-border bg-background shadow-[0_24px_80px_rgb(15_23_42_/_0.10)] transition-theme lg:order-2">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-4 py-4 md:px-5">
        <Stack direction="row" align="center" gap="$3" className="min-w-0">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand text-brand-contrast shadow-glow">
            <LayoutDashboard className="size-5" />
          </span>
          <Stack gap="$2" className="min-w-0">
            <Text as="p" size="label" tone="muted" weight="bold" className="uppercase">Live preview</Text>
            <Text as="h2" size="title" weight="semibold">{themeName}</Text>
          </Stack>
        </Stack>
        <Stack direction="row" align="center" gap="$2" wrap>
          <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 text-sm font-semibold text-text">
            <CheckCircle2 className="size-4 text-success" />
            A11y {score}
          </span>
        </Stack>
      </div>

      <div className="grid gap-4 p-4 md:p-5 2xl:grid-cols-[220px_minmax(0,1fr)]">
        <PreviewSidebar form={form} />
        <div className="grid min-w-0 gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <MetricTile icon={<Layers3 className="size-4" />} label="Primitives" value="5" />
            <MetricTile icon={<Palette className="size-4" />} label="Semantic tokens" value="48" />
            <MetricTile icon={<Cpu className="size-4" />} label="Exports" value="Web + RN" />
          </div>

          <SizeSpecimen />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.82fr)]">
            <Card variant="glass" interactive className="rounded-lg border-border/80 p-5">
              <div className="mb-5 flex items-start gap-3">
                <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-lg bg-surface-raised text-brand">
                  <Sparkles className="size-5" />
                </span>
                <Stack gap="$2" className="min-w-0">
                  <Text size="title" weight="semibold">Component playground</Text>
                  <Text tone="muted">A generated app surface using Zeno primitives and the active token contract.</Text>
                </Stack>
              </div>
              <Card.Content>
                <div className="grid gap-7">
                  <div className="rounded-lg border border-border bg-surface p-4">
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                      <Stack gap="$2" className="min-w-[220px] flex-1">
                        <Text size="label" tone="brand" weight="bold" className="uppercase">Asset run</Text>
                        <Text size="title" weight="semibold">Refine dashboard cards</Text>
                        <Text tone="muted">Use the current prompt to tune density, elevation, and motion before export.</Text>
                      </Stack>
                      <span className="inline-flex h-7 shrink-0 items-center rounded-pill bg-success px-3 text-xs font-bold text-brand-contrast md:justify-self-end">Ready</span>
                    </div>
                  </div>

                  <div className="grid gap-5">
                    <Input label="Prompt sample" value="make this surface calmer, denser, and easier to scan" readOnly />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Button>
                        <Button.Icon><Wand2 className="size-4" /></Button.Icon>
                        <Button.Text>Generate theme</Button.Text>
                      </Button>
                      <Button tone="neutral" variant="outline">
                        <Button.Icon><Sparkles className="size-4" /></Button.Icon>
                        <Button.Text>Save variant</Button.Text>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="raised" className="rounded-lg border-border/80 p-5">
              <div className="mb-5 flex items-start gap-3">
                <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-lg bg-surface-raised text-accent">
                  <Gem className="size-5" />
                </span>
                <Stack gap="$2" className="min-w-0">
                  <Text size="title" weight="semibold">Palette map</Text>
                  <Text tone="muted">Semantic colors stay named while the visual treatment changes.</Text>
                </Stack>
              </div>
              <Card.Content>
                <Stack gap="$3">
                  <PaletteRow name="Brand" value={form.brand} tone="brand" />
                  <PaletteRow name="Accent" value={form.accent} tone="accent" />
                  <PaletteRow name="Surface" value="var(--color-surface)" tone="surface" />
                  <PaletteRow name="Text" value="var(--color-text)" tone="text" />
                </Stack>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function SizeSpecimen(): React.ReactElement {
  return (
    <Card variant="surface" className="rounded-lg border-border/80 p-5">
      <div className="mb-5 grid gap-2">
        <Text size="label" tone="muted" weight="bold" className="uppercase">Fixed system scale</Text>
        <Text size="title" weight="semibold">Typography and control sizes stay constant across themes</Text>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-3">
          {[
            ["Label", "text-label", "0.8125rem / 1rem"],
            ["Body", "text-body", "0.9375rem / 1.5rem"],
            ["Title", "text-title", "1.5rem / 1.875rem"],
            ["Display", "text-display", "3rem / 3.25rem"]
          ].map(([name, className, value]) => (
            <div key={name} className="grid min-w-0 gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:items-center">
              <Text size="label" tone="muted" weight="medium">{name}</Text>
              <p className={`${className} min-w-0 truncate font-semibold text-text`}>Aa Zeno system</p>
              <Text size="label" tone="muted" className="font-mono">{value}</Text>
            </div>
          ))}
        </div>
        <div className="grid min-w-0 gap-3">
          {[
            ["$2", "$2", "32px"],
            ["$3", "$3", "40px"],
            ["$4", "$4", "48px"],
            ["$5", "$5", "56px"]
          ].map(([label, size, value]) => (
            <div key={label} className="grid min-w-0 gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center">
              <Text size="label" tone="muted" weight="medium">{label}</Text>
              <Button size={size as "$2" | "$3" | "$4" | "$5"} tone="neutral" variant="outline" className="w-fit">
                <Button.Text>Control {label}</Button.Text>
              </Button>
              <Text size="label" tone="muted" className="font-mono">{value}</Text>
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
    <div className="min-w-0 rounded-lg border border-border bg-surface p-4">
      <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-surface-raised text-brand">
        {icon}
      </div>
      <Text size="label" tone="muted" weight="medium">{label}</Text>
      <Text size="title" weight="semibold" className="mt-1 break-words">{value}</Text>
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
