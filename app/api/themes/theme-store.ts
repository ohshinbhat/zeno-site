import { createHash } from "node:crypto";
import { generateRuntimeThemeCss } from "@zeno-ui/tailwind-preset";
import {
  createZenoTokenConfig,
  readZenoTokenConfig,
  type ZenoTokenConfig,
  type ZenoTokenConfigInput
} from "@zeno-ui/tokens";
import type { AuthUser } from "../../auth";

export type ProjectRole = "owner" | "admin" | "member";

export type Project = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  role: ProjectRole;
};

export type ThemeDraft = {
  id: string;
  projectId: string;
  name: string;
  config: ZenoTokenConfig;
  form: unknown;
  createdAt: string;
  updatedAt: string;
};

export type PublishedTheme = {
  projectId: string;
  environment: string;
  version: string;
  hash: string;
  config: ZenoTokenConfig;
  css: string;
  createdAt: string;
};

export type PublishHistoryItem = {
  projectId: string;
  environment: string;
  version: string;
  hash: string;
  createdAt: string;
};

export type PublishThemeInput = {
  projectId: string;
  environment: string;
  config: ZenoTokenConfigInput | ZenoTokenConfig;
  userId?: string;
  themeId?: string;
};

type SupabaseSettings = {
  url: string;
  serviceRoleKey: string;
};

type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type ProjectMemberRow = {
  project_id: string;
  user_id: string;
  role: ProjectRole;
  created_at: string;
};

type ThemeDraftRow = {
  id: string;
  project_id: string;
  name: string;
  config_json: ZenoTokenConfig;
  form_json: unknown;
  created_at: string;
  updated_at: string;
};

type ThemeVersionRow = {
  id: string;
  project_id: string;
  version: string;
  hash: string;
  config_json: ZenoTokenConfig;
  css: string;
  status: string;
  created_at: string;
};

type ThemeVersionSummaryRow = {
  project_id: string;
  version: string;
  hash: string;
  config_json: ZenoTokenConfig;
  created_at: string;
};

type ThemeAliasRow = {
  project_id: string;
  environment: string;
  active_version_id: string;
  updated_at: string;
};

type MemoryStore = {
  projects: Map<string, Project>;
  members: Map<string, ProjectMemberRow>;
  drafts: Map<string, ThemeDraft>;
  versions: Map<string, PublishedTheme>;
  aliases: Map<string, string>;
};

type GlobalWithStore = typeof globalThis & {
  __zenoThemeStore?: MemoryStore;
};

function getMemoryStore(): MemoryStore {
  const globalStore = globalThis as GlobalWithStore;
  if (!globalStore.__zenoThemeStore) {
    globalStore.__zenoThemeStore = {
      projects: new Map<string, Project>(),
      members: new Map<string, ProjectMemberRow>(),
      drafts: new Map<string, ThemeDraft>(),
      versions: new Map<string, PublishedTheme>(),
      aliases: new Map<string, string>()
    };
  }

  return globalStore.__zenoThemeStore;
}

function getSupabaseSettings(): SupabaseSettings | null {
  const url = process.env.ZENO_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.ZENO_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (process.env.NODE_ENV === "production" && (!url || !serviceRoleKey)) {
    throw new Error("Supabase theme storage is not configured.");
  }

  return url && serviceRoleKey ? { url: url.replace(/\/+$/g, ""), serviceRoleKey } : null;
}

function createHeaders(settings: SupabaseSettings, prefer?: string): HeadersInit {
  return {
    apikey: settings.serviceRoleKey,
    Authorization: `Bearer ${settings.serviceRoleKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {})
  };
}

function createHashId(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function createVersion(projectId: string, environment: string, hash: string): string {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 17);
  return `${projectId}-${environment}-${timestamp}-${hash.slice(0, 8)}`.replace(/[^a-z0-9._-]/gi, "-");
}

function createId(prefix: string, value: string): string {
  return `${prefix}_${createHashId(`${value}:${Date.now()}:${Math.random()}`).slice(0, 16)}`;
}

function versionKey(projectId: string, version: string): string {
  return `${projectId}:${version}`;
}

function aliasKey(projectId: string, environment: string): string {
  return `${projectId}:${environment}`;
}

function memberKey(projectId: string, userId: string): string {
  return `${projectId}:${userId}`;
}

function toProject(row: ProjectRow, role: ProjectRole): Project {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    role
  };
}

function toDraft(row: ThemeDraftRow): ThemeDraft {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    config: row.config_json,
    form: row.form_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toPublishedTheme(row: ThemeVersionRow, environment: string): PublishedTheme {
  return {
    projectId: row.project_id,
    environment,
    version: row.version,
    hash: row.hash,
    config: row.config_json,
    css: row.css,
    createdAt: row.created_at
  };
}

function getPublishedEnvironment(row: { project_id: string; version: string; config_json: ZenoTokenConfig }, fallback = "production"): string {
  const metadata = row.config_json.metadata as { environment?: unknown } | undefined;
  if (typeof metadata?.environment === "string" && metadata.environment) {
    return metadata.environment;
  }

  const versionSuffix = row.version.startsWith(`${row.project_id}-`)
    ? row.version.slice(row.project_id.length + 1)
    : row.version;
  const match = versionSuffix.match(/^(.+)-\d{14,17}-[a-f0-9]{8}$/i);
  return match?.[1] || fallback;
}

function toPublishHistoryItem(row: ThemeVersionSummaryRow): PublishHistoryItem {
  return {
    projectId: row.project_id,
    environment: getPublishedEnvironment(row),
    version: row.version,
    hash: row.hash,
    createdAt: row.created_at
  };
}

function assertValidProjectId(value: string): void {
  if (!/^[a-z0-9._-]{2,80}$/i.test(value)) {
    throw new Error("Project id must be 2-80 URL-safe characters.");
  }
}

function assertValidEnvironment(value: string): void {
  if (!/^[a-z0-9._-]{2,64}$/i.test(value)) {
    throw new Error("Environment must be 2-64 URL-safe characters.");
  }
}

function normalizeProjectId(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52);

  return normalized.length >= 2 ? normalized : "zeno-project";
}

function defaultProjectName(user: AuthUser): string {
  const name = user.email.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return name ? `${name} workspace` : "Zeno workspace";
}

async function supabaseRequest<T>(
  settings: SupabaseSettings,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${settings.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...createHeaders(settings),
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}.`);
  }

  return await response.json() as T;
}

async function upsertSupabase(settings: SupabaseSettings, path: string, body: unknown, onConflict: string): Promise<void> {
  const response = await fetch(`${settings.url}/rest/v1/${path}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: createHeaders(settings, "resolution=merge-duplicates"),
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase upsert failed with ${response.status}.`);
  }
}

async function upsertSupabaseReturning<T>(settings: SupabaseSettings, path: string, body: unknown, onConflict: string): Promise<T> {
  const response = await fetch(`${settings.url}/rest/v1/${path}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: createHeaders(settings, "resolution=merge-duplicates,return=representation"),
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase upsert failed with ${response.status}.`);
  }

  return await response.json() as T;
}

async function insertSupabase<T>(settings: SupabaseSettings, path: string, body: unknown): Promise<T> {
  const response = await fetch(`${settings.url}/rest/v1/${path}`, {
    method: "POST",
    headers: createHeaders(settings, "return=representation"),
    body: JSON.stringify(body),
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase insert failed with ${response.status}.`);
  }

  return await response.json() as T;
}

export function createTokenConfig(input: ZenoTokenConfigInput | ZenoTokenConfig): ZenoTokenConfig {
  const readResult = readZenoTokenConfig(input);
  const config = readResult.valid
    ? readResult.config
    : createZenoTokenConfig(input);
  const validation = readZenoTokenConfig(config);

  if (!validation.valid) {
    throw new Error(validation.issues.join(" ") || "Token config is invalid.");
  }

  return config;
}

export async function listProjectsForUser(userId: string): Promise<Project[]> {
  const settings = getSupabaseSettings();
  if (!settings) {
    const store = getMemoryStore();
    return Array.from(store.members.values())
      .filter((member) => member.user_id === userId)
      .map((member) => {
        const project = store.projects.get(member.project_id);
        return project ? { ...project, role: member.role } : null;
      })
      .filter((project): project is Project => Boolean(project));
  }

  const memberships = await supabaseRequest<ProjectMemberRow[]>(
    settings,
    `project_members?select=project_id,role,user_id,created_at&user_id=eq.${encodeURIComponent(userId)}&order=created_at.asc`
  );

  const projects = await Promise.all(memberships.map(async (member) => {
    const rows = await supabaseRequest<ProjectRow[]>(
      settings,
      `projects?select=*&id=eq.${encodeURIComponent(member.project_id)}&limit=1`
    );
    return rows[0] ? toProject(rows[0], member.role) : null;
  }));

  return projects.filter((project): project is Project => Boolean(project));
}

export async function createProjectForUser(user: AuthUser, name = defaultProjectName(user)): Promise<Project> {
  const settings = getSupabaseSettings();
  const createdAt = new Date().toISOString();
  const baseId = normalizeProjectId(name);
  const id = `${baseId}-${createHashId(`${user.id}:${name}`).slice(0, 6)}`;
  assertValidProjectId(id);

  if (!settings) {
    const store = getMemoryStore();
    const project: Project = { id, name, slug: id, createdAt, role: "owner" };
    store.projects.set(id, project);
    store.members.set(memberKey(id, user.id), {
      project_id: id,
      user_id: user.id,
      role: "owner",
      created_at: createdAt
    });
    return project;
  }

  await upsertSupabase(settings, "projects", {
    id,
    slug: id,
    name,
    created_at: createdAt
  }, "id");

  await upsertSupabase(settings, "project_members", {
    project_id: id,
    user_id: user.id,
    role: "owner",
    created_at: createdAt
  }, "project_id,user_id");

  return { id, name, slug: id, createdAt, role: "owner" };
}

export async function ensureProjectForUser(user: AuthUser): Promise<Project> {
  const projects = await listProjectsForUser(user.id);
  return projects[0] ?? createProjectForUser(user);
}

export async function assertProjectAccess(userId: string, projectId: string, roles: ProjectRole[] = ["owner", "admin", "member"]): Promise<ProjectRole> {
  assertValidProjectId(projectId);
  const settings = getSupabaseSettings();

  if (!settings) {
    const member = getMemoryStore().members.get(memberKey(projectId, userId));
    if (member && roles.includes(member.role)) return member.role;
    throw new Error("You do not have access to this project.");
  }

  const rows = await supabaseRequest<ProjectMemberRow[]>(
    settings,
    `project_members?select=project_id,user_id,role,created_at&project_id=eq.${encodeURIComponent(projectId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`
  );
  const role = rows[0]?.role;
  if (role && roles.includes(role)) return role;

  throw new Error("You do not have access to this project.");
}

export async function listThemeDrafts(projectId: string, userId: string): Promise<ThemeDraft[]> {
  await assertProjectAccess(userId, projectId);

  const settings = getSupabaseSettings();
  if (!settings) {
    return Array.from(getMemoryStore().drafts.values())
      .filter((draft) => draft.projectId === projectId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  const rows = await supabaseRequest<ThemeDraftRow[]>(
    settings,
    `theme_drafts?select=*&project_id=eq.${encodeURIComponent(projectId)}&order=updated_at.desc`
  );

  return rows.map(toDraft);
}

export async function saveThemeDraft({
  projectId,
  userId,
  name,
  config: inputConfig,
  form,
  themeId
}: {
  projectId: string;
  userId: string;
  name: string;
  config: ZenoTokenConfigInput | ZenoTokenConfig;
  form: unknown;
  themeId?: string;
}): Promise<ThemeDraft> {
  await assertProjectAccess(userId, projectId, ["owner", "admin", "member"]);

  const config = createTokenConfig(inputConfig);
  const now = new Date().toISOString();
  const id = themeId && /^[a-z0-9._:-]{2,140}$/i.test(themeId) ? themeId : createId("theme", `${projectId}:${name}`);

  if (!getSupabaseSettings()) {
    const draft: ThemeDraft = {
      id,
      projectId,
      name,
      config,
      form,
      createdAt: getMemoryStore().drafts.get(id)?.createdAt ?? now,
      updatedAt: now
    };
    getMemoryStore().drafts.set(id, draft);
    return draft;
  }

  const settings = getSupabaseSettings();
  if (!settings) throw new Error("Supabase settings unavailable.");

  const rows = await upsertSupabaseReturning<ThemeDraftRow[]>(settings, "theme_drafts", {
    id,
    project_id: projectId,
    name,
    config_json: config,
    form_json: form,
    created_by: userId,
    created_at: now,
    updated_at: now
  }, "id");

  const row = rows[0];
  if (!row) throw new Error("Theme draft save failed.");
  return toDraft(row);
}

export async function publishTheme({ projectId, environment, config: inputConfig, userId, themeId }: PublishThemeInput): Promise<PublishedTheme> {
  assertValidProjectId(projectId);
  assertValidEnvironment(environment);

  if (userId) {
    await assertProjectAccess(userId, projectId, ["owner", "admin"]);
  }

  const baseConfig = createTokenConfig(inputConfig);
  const hash = createHashId(JSON.stringify(baseConfig.tokens) + JSON.stringify(baseConfig.assets));
  const version = createVersion(projectId, environment, hash);
  const createdAt = new Date().toISOString();
  const config = createZenoTokenConfig({
    ...baseConfig,
    metadata: {
      ...baseConfig.metadata,
      projectId,
      environment,
      updatedAt: createdAt
    },
    publishedVersion: version
  });
  const css = generateRuntimeThemeCss(config.tokens);
  const theme: PublishedTheme = {
    projectId,
    environment,
    version,
    hash,
    config,
    css,
    createdAt
  };

  const settings = getSupabaseSettings();
  if (!settings) {
    const store = getMemoryStore();
    const key = versionKey(projectId, version);
    store.versions.set(key, theme);
    store.aliases.set(aliasKey(projectId, environment), key);
    return theme;
  }

  const versionId = `${projectId}:${version}`;

  await insertSupabase<ThemeVersionRow[]>(settings, "theme_versions", {
    id: versionId,
    project_id: projectId,
    version,
    hash,
    config_json: config,
    css,
    status: "published",
    source_draft_id: themeId ?? null,
    created_by: userId ?? null,
    created_at: createdAt
  });

  await upsertSupabase(settings, "theme_aliases", {
    project_id: projectId,
    environment,
    active_version_id: versionId,
    updated_at: createdAt
  }, "project_id,environment");

  return theme;
}

export async function listPublishHistory(projectId: string, userId: string, limit = 8): Promise<PublishHistoryItem[]> {
  await assertProjectAccess(userId, projectId);

  const settings = getSupabaseSettings();
  if (!settings) {
    return Array.from(getMemoryStore().versions.values())
      .filter((theme) => theme.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map((theme) => ({
        projectId: theme.projectId,
        environment: theme.environment,
        version: theme.version,
        hash: theme.hash,
        createdAt: theme.createdAt
      }));
  }

  const rows = await supabaseRequest<ThemeVersionSummaryRow[]>(
    settings,
    `theme_versions?select=project_id,version,hash,config_json,created_at&project_id=eq.${encodeURIComponent(projectId)}&order=created_at.desc&limit=${limit}`
  );

  return rows.map(toPublishHistoryItem);
}

export async function getActiveTheme(projectId: string, environment: string): Promise<PublishedTheme | null> {
  assertValidProjectId(projectId);
  assertValidEnvironment(environment);

  const settings = getSupabaseSettings();
  if (!settings) {
    const store = getMemoryStore();
    const key = store.aliases.get(aliasKey(projectId, environment));
    return key ? store.versions.get(key) ?? null : null;
  }

  const aliases = await supabaseRequest<ThemeAliasRow[]>(
    settings,
    `theme_aliases?select=active_version_id&project_id=eq.${encodeURIComponent(projectId)}&environment=eq.${encodeURIComponent(environment)}&limit=1`
  );

  const activeVersionId = aliases[0]?.active_version_id;
  if (!activeVersionId) return null;

  const rows = await supabaseRequest<ThemeVersionRow[]>(
    settings,
    `theme_versions?select=*&id=eq.${encodeURIComponent(activeVersionId)}&limit=1`
  );

  return rows[0] ? toPublishedTheme(rows[0], environment) : null;
}

export async function getThemeVersion(projectId: string, version: string): Promise<PublishedTheme | null> {
  assertValidProjectId(projectId);
  if (!/^[a-z0-9._:-]{2,140}$/i.test(version)) {
    throw new Error("Version must be URL-safe.");
  }

  const settings = getSupabaseSettings();
  if (!settings) {
    const store = getMemoryStore();
    return store.versions.get(versionKey(projectId, version)) ?? null;
  }

  const rows = await supabaseRequest<ThemeVersionRow[]>(
    settings,
    `theme_versions?select=*&project_id=eq.${encodeURIComponent(projectId)}&version=eq.${encodeURIComponent(version)}&limit=1`
  );

  return rows[0] ? toPublishedTheme(rows[0], "version") : null;
}

export function createHostedThemeResponse(theme: PublishedTheme, kind: "json" | "css"): Response {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    ETag: `"${theme.hash}"`,
    "X-Zeno-Theme-Version": theme.version
  };

  if (kind === "css") {
    return new Response(theme.css, {
      headers: {
        ...headers,
        "Content-Type": "text/css; charset=utf-8"
      }
    });
  }

  return Response.json(theme.config, { headers });
}

export function createThemeCorsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
