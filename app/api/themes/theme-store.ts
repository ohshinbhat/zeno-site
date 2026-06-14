import { createHash } from "node:crypto";
import { generateRuntimeThemeCss } from "@zeno-ui/tailwind-preset";
import {
  createZenoTokenConfig,
  readZenoTokenConfig,
  type ZenoTokenConfig,
  type ZenoTokenConfigInput
} from "@zeno-ui/tokens";

export type PublishedTheme = {
  projectId: string;
  environment: string;
  version: string;
  hash: string;
  config: ZenoTokenConfig;
  css: string;
  createdAt: string;
};

export type PublishThemeInput = {
  projectId: string;
  environment: string;
  config: ZenoTokenConfigInput | ZenoTokenConfig;
};

type SupabaseSettings = {
  url: string;
  serviceRoleKey: string;
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

type ThemeAliasRow = {
  project_id: string;
  environment: string;
  active_version_id: string;
  updated_at: string;
};

type MemoryStore = {
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
      versions: new Map<string, PublishedTheme>(),
      aliases: new Map<string, string>()
    };
  }

  return globalStore.__zenoThemeStore;
}

function getSupabaseSettings(): SupabaseSettings | null {
  const url = process.env.ZENO_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.ZENO_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `${projectId}-${environment}-${timestamp}-${hash.slice(0, 8)}`.replace(/[^a-z0-9._-]/gi, "-");
}

function versionKey(projectId: string, version: string): string {
  return `${projectId}:${version}`;
}

function aliasKey(projectId: string, environment: string): string {
  return `${projectId}:${environment}`;
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

export function canPublishWithRequest(headers: Headers): boolean {
  const expected = process.env.ZENO_ADMIN_TOKEN;
  if (!expected) return process.env.NODE_ENV !== "production";

  const bearer = headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const explicit = headers.get("x-zeno-admin-token");
  return bearer === expected || explicit === expected;
}

export function createHostedThemeResponse(theme: PublishedTheme, kind: "json" | "css"): Response {
  if (kind === "css") {
    return new Response(theme.css, {
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "X-Zeno-Theme-Version": theme.version
      }
    });
  }

  return Response.json(theme.config, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      "X-Zeno-Theme-Version": theme.version
    }
  });
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

export async function publishTheme({ projectId, environment, config: inputConfig }: PublishThemeInput): Promise<PublishedTheme> {
  assertValidProjectId(projectId);
  assertValidEnvironment(environment);

  const baseConfig = createTokenConfig(inputConfig);
  const hash = createHashId(JSON.stringify(baseConfig.tokens) + JSON.stringify(baseConfig.assets));
  const version = baseConfig.publishedVersion ?? createVersion(projectId, environment, hash);
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

  await upsertSupabase(settings, "projects", {
    id: projectId,
    slug: projectId,
    name: config.metadata.name,
    created_at: createdAt
  }, "id");

  await upsertSupabase(settings, "theme_versions", {
    id: versionId,
    project_id: projectId,
    version,
    hash,
    config_json: config,
    css,
    status: "published",
    created_at: createdAt
  }, "id");

  await upsertSupabase(settings, "theme_aliases", {
    project_id: projectId,
    environment,
    active_version_id: versionId,
    updated_at: createdAt
  }, "project_id,environment");

  return theme;
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
