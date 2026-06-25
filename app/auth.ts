import { NextResponse } from "next/server";

export const accessCookieName = "zeno_access_token";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
  expiresIn: number;
};

type SupabaseAuthSettings = {
  url: string;
  anonKey: string;
};

type SupabaseAuthResponse = {
  access_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
};

type LocalTokenPayload = AuthUser & {
  exp: number;
};

const localSessionTtlSeconds = 60 * 60 * 24 * 7;

function canUseLocalAuthFallback(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function getSupabaseAuthSettings(): SupabaseAuthSettings | null {
  const url = process.env.SUPABASE_URL
    ?? process.env.ZENO_SUPABASE_URL
    ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY
    ?? process.env.ZENO_SUPABASE_ANON_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (process.env.NODE_ENV === "production" && (!url || !anonKey)) {
    throw new Error("Supabase auth is not configured.");
  }

  return url && anonKey ? { url: url.replace(/\/+$/g, ""), anonKey } : null;
}

function authHeaders(settings: SupabaseAuthSettings, token?: string): HeadersInit {
  return {
    apikey: settings.anonKey,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeSupabaseUser(user: { id?: string; email?: string; user_metadata?: Record<string, unknown> }): AuthUser | null {
  if (!user.id || !user.email) return null;

  const metadata = user.user_metadata ?? {};
  const rawName = metadata.full_name ?? metadata.name;
  const rawAvatar = metadata.avatar_url ?? metadata.picture;

  return {
    id: user.id,
    email: user.email,
    ...(typeof rawName === "string" && rawName ? { name: rawName } : {}),
    ...(typeof rawAvatar === "string" && rawAvatar ? { avatarUrl: rawAvatar } : {})
  };
}

function userIdFromEmail(email: string): string {
  return `local-${Buffer.from(normalizeEmail(email)).toString("base64url").slice(0, 28)}`;
}

function createLocalToken(email: string): string {
  const payload: LocalTokenPayload = {
    id: userIdFromEmail(email),
    email: normalizeEmail(email),
    exp: Math.floor(Date.now() / 1000) + localSessionTtlSeconds
  };

  return `local.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
}

function readLocalToken(token: string): AuthUser | null {
  if (!token.startsWith("local.")) return null;

  try {
    const payload = JSON.parse(Buffer.from(token.slice(6), "base64url").toString("utf8")) as LocalTokenPayload;
    if (!payload.id || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;

  for (const segment of header.split(";")) {
    const [rawKey, ...rawValue] = segment.trim().split("=");
    if (rawKey === name) return decodeURIComponent(rawValue.join("="));
  }

  return null;
}

function getRequestToken(request: Request): string | null {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return bearer || readCookie(request.headers.get("cookie"), accessCookieName);
}

async function readSupabaseUser(settings: SupabaseAuthSettings, token: string): Promise<AuthUser | null> {
  const response = await fetch(`${settings.url}/auth/v1/user`, {
    headers: authHeaders(settings, token),
    cache: "no-store"
  });

  if (!response.ok) return null;

  const user = await response.json() as { id?: string; email?: string; user_metadata?: Record<string, unknown> };
  return normalizeSupabaseUser(user);
}

async function createSupabaseSession(path: "signup" | "token?grant_type=password", email: string, password: string): Promise<AuthSession> {
  const settings = getSupabaseAuthSettings();
  if (!settings) {
    if (!canUseLocalAuthFallback()) {
      throw new Error("Supabase auth is not configured.");
    }

    return {
      accessToken: createLocalToken(email),
      user: { id: userIdFromEmail(email), email: normalizeEmail(email) },
      expiresIn: localSessionTtlSeconds
    };
  }

  const response = await fetch(`${settings.url}/auth/v1/${path}`, {
    method: "POST",
    headers: authHeaders(settings),
    body: JSON.stringify({ email: normalizeEmail(email), password }),
    cache: "no-store"
  });
  const result = await response.json() as SupabaseAuthResponse & { msg?: string; error_description?: string };

  const user = result.user ? normalizeSupabaseUser(result.user) : null;

  if (!response.ok || !result.access_token || !user) {
    throw new Error(result.error_description || result.msg || "Authentication failed.");
  }

  return {
    accessToken: result.access_token,
    user,
    expiresIn: result.expires_in ?? localSessionTtlSeconds
  };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  return createSupabaseSession("token?grant_type=password", email, password);
}

export async function signUpWithPassword(email: string, password: string): Promise<AuthSession> {
  return createSupabaseSession("signup", email, password);
}

export async function getCurrentUserFromRequest(request: Request): Promise<AuthUser | null> {
  const token = getRequestToken(request);
  if (!token) return null;

  const settings = getSupabaseAuthSettings();
  if (settings) return readSupabaseUser(settings, token);
  return canUseLocalAuthFallback() ? readLocalToken(token) : null;
}

export function applyAuthCookie(response: NextResponse, session: AuthSession): void {
  response.cookies.set(accessCookieName, session.accessToken, {
    httpOnly: true,
    maxAge: session.expiresIn,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(accessCookieName, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}
