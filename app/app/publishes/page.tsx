"use client";

import { CalendarClock, ChevronDown, Cloud, Code2, ExternalLink, FileJson, History, Layers3 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Card, Stack, Text } from "@zeno-site/react";
import { useAccountHistory, type PublishHistoryItem } from "../../site-chrome";

type ProjectSummary = {
  id: string;
  name: string;
  role: "owner" | "admin" | "member";
};

export default function PublishesPage(): React.ReactElement {
  const [projects, setProjects] = React.useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = React.useState("");
  const [history, setHistory] = React.useState<PublishHistoryItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useAccountHistory(history, error);

  const selectedProject = React.useMemo(() => {
    return projects.find((project) => project.id === selectedProjectId) ?? null;
  }, [projects, selectedProjectId]);

  React.useEffect(() => {
    async function loadProjects(): Promise<void> {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        if (response.status === 401) {
          window.location.href = "/login?next=/app/publishes";
          return;
        }

        const result = await response.json() as { projects?: ProjectSummary[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Projects failed to load.");

        const nextProjects = Array.isArray(result.projects) ? result.projects : [];
        setProjects(nextProjects);
        setSelectedProjectId((current) => current || nextProjects[0]?.id || "");
      } catch (projectError) {
        setError(projectError instanceof Error ? projectError.message : "Projects failed to load.");
      }
    }

    void loadProjects();
  }, []);

  React.useEffect(() => {
    if (!selectedProjectId) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    let ignore = false;

    async function loadHistory(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/themes/history?projectId=${encodeURIComponent(selectedProjectId)}`, { cache: "no-store" });
        const result = await response.json() as { history?: PublishHistoryItem[]; error?: string };
        if (!response.ok) throw new Error(result.error || "Publish history failed to load.");
        if (!ignore) setHistory(Array.isArray(result.history) ? result.history : []);
      } catch (historyError) {
        if (!ignore) {
          setHistory([]);
          setError(historyError instanceof Error ? historyError.message : "Publish history failed to load.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadHistory();
    return () => {
      ignore = true;
    };
  }, [selectedProjectId]);

  return (
    <main className="site-content mx-auto grid w-full max-w-[1120px] gap-5 px-4 py-6 md:px-6 md:py-8">
      <section className="grid gap-4 rounded-lg border border-border bg-surface p-4 shadow-[0_16px_44px_rgb(15_23_42_/_0.07)] md:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] md:items-end">
        <Stack gap="$2" className="min-w-0">
          <div className="inline-flex w-fit items-center gap-2 rounded-pill border border-border bg-background px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-zeno-brand)]">
            <History className="size-3.5" />
            Publishes
          </div>
          <Text as="h1" size="display" weight="semibold" className="leading-tight">Publish history</Text>
          <Text tone="muted" className="max-w-2xl leading-7">
            Recent immutable theme versions for the selected project, with the runtime endpoints your apps can fetch.
          </Text>
        </Stack>

        <ProjectSelect projects={projects} value={selectedProjectId} onChange={setSelectedProjectId} />
      </section>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm font-semibold text-danger">
          {error}
        </div>
      ) : null}

      <section className="grid gap-3">
        {isLoading ? (
          <HistorySkeleton />
        ) : history.length === 0 ? (
          <EmptyState project={selectedProject} />
        ) : (
          history.map((item, index) => (
            <PublishRow key={getPublishRowKey(item, index)} item={item} project={selectedProject} />
          ))
        )}
      </section>
    </main>
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
      <Text as="label" size="label" tone="muted" weight="bold" className="uppercase">Project</Text>
      <div className="group relative min-w-0">
        <select
          className="h-10 w-full min-w-0 appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm font-bold text-text outline-none transition hover:bg-surface-raised focus:border-[var(--color-zeno-brand)] focus:shadow-focus"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {projects.length === 0 ? <option value="">Loading project</option> : null}
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md bg-surface-raised text-text-muted transition group-hover:text-text">
          <ChevronDown className="size-3.5" />
        </span>
      </div>
    </Stack>
  );
}

function PublishRow({ item, project }: { item: PublishHistoryItem; project: ProjectSummary | null }): React.ReactElement {
  const projectId = getPublishString(item.projectId, project?.id ?? "project");
  const environment = getPublishString(item.environment, "production");
  const version = getPublishString(item.version, "unversioned");
  const hashPreview = getPublishHashPreview(item.hash);
  const jsonUrl = `/api/themes/${encodeURIComponent(projectId)}/${encodeURIComponent(environment)}.json`;
  const cssUrl = `/api/themes/${encodeURIComponent(projectId)}/${encodeURIComponent(environment)}.css`;
  const versionUrl = `/api/themes/${encodeURIComponent(projectId)}/versions/${encodeURIComponent(version)}.json`;

  return (
    <Card variant="surface" className="overflow-hidden rounded-lg p-0">
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] lg:items-center">
        <div className="min-w-0 overflow-hidden">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 items-center gap-1.5 rounded-pill bg-[color-mix(in_srgb,var(--color-zeno-brand),transparent_88%)] px-2.5 text-xs font-black uppercase text-[var(--color-zeno-brand)]">
              <Cloud className="size-3.5" />
              {environment}
            </span>
            <span className="inline-flex h-7 items-center gap-1.5 rounded-pill border border-border bg-background px-2.5 text-xs font-bold text-text-muted">
              <CalendarClock className="size-3.5" />
              {formatPublishTime(item.createdAt)}
            </span>
          </div>

          <p className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm font-semibold leading-6 text-text">
            {version}
          </p>
          <p className="mt-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs leading-5 text-text-muted">
            {project?.name ?? projectId} · hash {hashPreview}
          </p>
        </div>

        <div className="grid min-w-0 gap-2 sm:grid-cols-3 lg:grid-cols-1">
          <PublishLink icon={<FileJson className="size-3.5" />} label="JSON" href={jsonUrl} />
          <PublishLink icon={<Code2 className="size-3.5" />} label="CSS" href={cssUrl} />
          <PublishLink icon={<Layers3 className="size-3.5" />} label="Version" href={versionUrl} />
        </div>
      </div>
    </Card>
  );
}

function getPublishRowKey(item: PublishHistoryItem, index: number): string {
  return [
    getPublishString(item.projectId, "project"),
    getPublishString(item.environment, "environment"),
    getPublishString(item.version, `version-${index}`)
  ].join(":");
}

function getPublishString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function getPublishHashPreview(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.slice(0, 12) : "unavailable";
}

function PublishLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }): React.ReactElement {
  return (
    <a
      className="inline-flex h-9 min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-xs font-bold text-text transition hover:bg-surface-raised hover:text-[var(--color-zeno-brand)] focus-visible:outline-none focus-visible:shadow-focus"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <ExternalLink className="size-3.5 shrink-0 text-text-muted" />
    </a>
  );
}

function EmptyState({ project }: { project: ProjectSummary | null }): React.ReactElement {
  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border bg-surface p-6 text-center">
      <span className="mx-auto grid size-11 place-items-center rounded-lg bg-surface-raised text-[var(--color-zeno-brand)]">
        <History className="size-5" />
      </span>
      <Text weight="semibold">No publishes yet</Text>
      <Text tone="muted" className="mx-auto max-w-md leading-6">
        {project ? `${project.name} does not have a published theme version yet.` : "Create or select a project, then publish a theme from the console."}
      </Text>
      <Link className="mx-auto inline-flex h-9 items-center rounded-lg bg-[var(--color-zeno-brand)] px-3 text-sm font-bold text-white" href="/app">
        Back to console
      </Link>
    </div>
  );
}

function HistorySkeleton(): React.ReactElement {
  return (
    <div className="grid gap-3">
      {["one", "two", "three"].map((item) => (
        <div key={item} className="h-28 rounded-lg border border-border bg-surface" />
      ))}
    </div>
  );
}

function formatPublishTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Published";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}
