# Zeno Agent Context

Zeno is an AI-powered component library and cloud theme system. It has three major parts:

- `zeno-site`: the web app and cloud control plane.
- `zeno-ui`: the component library and runtime package family.
- Supabase: auth, project ownership, drafts, published theme storage, and environment aliases.

The main product loop is:

1. A user signs in to Zeno Cloud.
2. The user generates, creates, or selects a theme in the playground.
3. The user publishes the theme to a project environment, usually `production`.
4. The publish creates an immutable token contract.
5. Consumer apps initialize with the Zeno UI provider.
6. The provider fetches the active token contract and applies colors, sizing, density, and motion.

The most important invariant is that consumer apps fetch deterministic theme JSON at runtime. They should not need authoring credentials or direct Supabase access.

## Product Promise

Generate or select a theme once, publish it to Zeno Cloud, and let every app using Zeno UI initialize from the active token contract.

Zeno should feel like AI-native design infrastructure, not just a theme picker.

Optimize for:

- Fast theme iteration.
- Deterministic published output.
- Stable component-library contracts.
- Runtime safety.
- Easy app initialization.
- Clear publish history.
- Minimal auth friction.

## Repository: zeno-site

`zeno-site` is the website, docs surface, authenticated playground, and backend API for cloud-hosted themes.

It provides:

- Public landing page.
- Public docs page.
- Email/password login and signup.
- Authenticated theme playground.
- Theme generation.
- Preset/theme selection.
- Draft saving.
- Project selection.
- Theme publishing.
- Publish history.
- Public runtime JSON/CSS endpoints.

### Route Map

Public routes:

```txt
/                     Landing page
/docs                 Runtime/package docs
/login                Email/password auth
```

Authenticated routes:

```txt
/app                  Theme playground and publish console
/app/details          Theme/token details
/app/publishes        Publish history
```

Authenticated API routes:

```txt
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
GET  /api/auth/session

GET  /api/projects
POST /api/projects

POST /api/themes/generate
GET  /api/themes/drafts
POST /api/themes/drafts
POST /api/themes/publish
GET  /api/themes/history
POST /api/themes/validate
```

Public runtime API routes:

```txt
GET /api/themes/:projectId/:environment.json
GET /api/themes/:projectId/:environment.css
GET /api/themes/:projectId/versions/:version.json
```

Runtime endpoints are intentionally public. Consumer apps should be able to fetch active themes without passing user auth into client runtime.

### Publish Behavior

Publishing must:

- Require an authenticated user.
- Validate the token config.
- Verify project membership.
- Allow only `owner` and `admin` roles to publish.
- Create a new immutable `theme_versions` row.
- Update `theme_aliases` for the selected environment.
- Return JSON, CSS, and version URLs.

Runtime responses should include:

- `Cache-Control`
- `ETag`
- `X-Zeno-Theme-Version`
- permissive CORS headers

Do not reintroduce manual admin-token publishing. Publishing is session based and project-access based.

## Repository: zeno-ui

`zeno-ui` is the UI library and npm package family. It is consumed by external apps and also used by `zeno-site`.

The package family includes:

- React primitives.
- React Native / NativeWind-compatible output.
- Token schema and validation.
- Theme generation.
- Tailwind/runtime CSS generation.
- Runtime theme provider.

The library currently has a small component set for React and React Native. It should grow around stable primitives that consume the same semantic token contract.

### Runtime Behavior

Consumer apps should wrap their app root in `ZenoThemeProvider`.

At initialization, the provider should:

1. Resolve a theme source.
2. Fetch the active published token JSON from Zeno Cloud.
3. Apply the token contract to the component system.
4. Fall back to cached/local tokens if the network request fails.
5. Avoid visible theme/layout shift where possible.

For web apps, pre-hydration theme application matters. Use `createZenoThemeScript()` in the app shell when possible.

Example source:

```ts
export const zenoThemeSource = {
  type: "zeno",
  projectId: "your-project-id",
  environment: "production",
  baseUrl: "https://your-zeno-site.vercel.app"
} as const;
```

Next.js example:

```tsx
import { createZenoThemeScript, ZenoThemeProvider } from "@zenoui/react";

const source = {
  type: "zeno",
  projectId: "your-project-id",
  environment: "production",
  baseUrl: "https://your-zeno-site.vercel.app"
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: createZenoThemeScript({ source })
          }}
        />
      </head>
      <body>
        <ZenoThemeProvider source={source}>
          {children}
        </ZenoThemeProvider>
      </body>
    </html>
  );
}
```

### Package Contract

Keep the consumer package name stable: `@zenoui/react`.

Important package responsibilities:

```txt
@zenoui/react  React primitives, hosted-theme provider, pre-hydration script, validation, and runtime CSS helpers
```

`@zeno-site/*` imports are site-local compatibility shims under `vendor/zeno-site`; do not document them as public npm packages.

## Supabase

Supabase is the backend for auth and durable cloud theme storage.

It owns:

- User authentication.
- Projects.
- Project memberships.
- Theme drafts.
- Immutable published versions.
- Environment aliases pointing to active versions.

Do not expose Supabase service-role keys to the browser.

Consumer apps should not fetch directly from Supabase. They should fetch from Zeno runtime endpoints served by `zeno-site`.

### Tables

Recommended tables:

```txt
projects
project_members
theme_drafts
theme_versions
theme_aliases
```

#### projects

Stores project/workspace records.

```txt
id text primary key
slug text not null unique
name text not null
created_at timestamptz not null default now()
```

#### project_members

Stores project access control.

```txt
project_id text not null references projects(id) on delete cascade
user_id uuid not null references auth.users(id) on delete cascade
role text not null check (role in ('owner', 'admin', 'member'))
created_at timestamptz not null default now()
primary key (project_id, user_id)
```

Roles:

- `owner`: full project access and publishing.
- `admin`: publishing access.
- `member`: read/draft access, no publishing.

#### theme_drafts

Stores editable saved themes.

```txt
id text primary key
project_id text not null references projects(id) on delete cascade
name text not null
config_json jsonb not null
form_json jsonb
created_by uuid references auth.users(id) on delete set null
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

#### theme_versions

Stores immutable published themes.

```txt
id text primary key
project_id text not null references projects(id) on delete cascade
version text not null
hash text not null
config_json jsonb not null
css text not null
status text not null default 'published'
source_draft_id text references theme_drafts(id) on delete set null
created_by uuid references auth.users(id) on delete set null
created_at timestamptz not null default now()
unique (project_id, version)
```

#### theme_aliases

Stores active environment pointers.

```txt
project_id text not null references projects(id) on delete cascade
environment text not null
active_version_id text not null references theme_versions(id) on delete restrict
updated_at timestamptz not null default now()
primary key (project_id, environment)
```

Example:

```txt
project_id: acme-dashboard
environment: production
active_version_id: acme-dashboard:acme-dashboard-production-20260624083000000-a1b2c3d4
```

## Token Contract

The published token JSON is the source of truth for the component library.

Consumer apps should treat this JSON as read-only runtime configuration.

```ts
type ZenoTokenConfig = {
  schemaVersion: "1.0.0";
  metadata: {
    name: string;
    projectId?: string;
    environment?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  tokens: {
    name: string;
    id: string;
    seed: string;
    knobs: {
      brand: string;
      accent: string;
      trend: string;
      weather: string;
      density: string;
      type: string;
      elevation: string;
      border: string;
      motion: string;
      texture: string;
      contrast: string;
      mode: string;
      mood: string;
    };
    color: Record<string, string>;
    radius: Record<string, string>;
    spacing: Record<string, string>;
    type: Record<string, string>;
    size: Record<string, string>;
    shadow: Record<string, string>;
    motion: Record<string, string>;
    blur: {
      glass: string;
    };
    opacity: {
      glass: string;
      disabled: string;
    };
  };
  assets: Record<string, {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
    hash?: string;
  }>;
  modes: Record<string, Partial<ZenoTokenConfig["tokens"]>>;
  publishedVersion?: string;
  validation: {
    valid: boolean;
    issues: string[];
    score: {
      contrast: number;
      consistency: number;
      accessibility: number;
    };
  };
};
```

Example published config:

```json
{
  "schemaVersion": "1.0.0",
  "metadata": {
    "name": "Clear Bento",
    "projectId": "acme-dashboard",
    "environment": "production",
    "description": "developer console with warm cloud controls",
    "updatedAt": "2026-06-24T08:30:00.000Z"
  },
  "tokens": {
    "name": "Clear Bento",
    "id": "clear-bento-developer-console",
    "seed": "developer console with warm cloud controls",
    "knobs": {
      "brand": "#eb4b29",
      "accent": "#06b6d4",
      "trend": "bento",
      "weather": "clear",
      "density": "compact",
      "type": "technical",
      "elevation": "layered",
      "border": "subtle",
      "motion": "smooth",
      "texture": "bento",
      "contrast": "normal",
      "mode": "dark",
      "mood": "clear"
    },
    "color": {
      "background": "#070a12",
      "surface": "#131720",
      "surfaceRaised": "#1d222d",
      "surfaceGlass": "rgb(15 23 42 / 0.58)",
      "text": "#f8fafc",
      "textMuted": "#94a3b8",
      "border": "#343946",
      "brand": "#eb4b29",
      "brandContrast": "#ffffff",
      "accent": "#06b6d4",
      "accentContrast": "#042f2e",
      "success": "#16a34a",
      "warning": "#d97706",
      "danger": "#dc2626"
    },
    "radius": {
      "control": "0.75rem",
      "card": "1rem",
      "pill": "999px"
    },
    "spacing": {
      "card": "1rem",
      "section": "2rem",
      "gap2": "0.375rem",
      "gap3": "0.5rem",
      "gap4": "0.75rem",
      "gap5": "1rem"
    },
    "type": {
      "sans": "Inter, ui-sans-serif, system-ui, sans-serif",
      "display": "Inter, ui-sans-serif, system-ui, sans-serif",
      "mono": "JetBrains Mono, ui-monospace, monospace",
      "label": "0.8125rem",
      "body": "0.9375rem",
      "title": "1.5rem",
      "displaySize": "3rem",
      "labelLine": "1rem",
      "bodyLine": "1.5rem",
      "titleLine": "1.875rem",
      "displayLine": "3.25rem"
    },
    "size": {
      "control2": "2rem",
      "control3": "2.5rem",
      "control4": "3rem",
      "control5": "3.5rem",
      "icon2": "0.875rem",
      "icon3": "1rem",
      "icon4": "1.125rem",
      "icon5": "1.25rem",
      "paddingX2": "0.75rem",
      "paddingX3": "1rem",
      "paddingX4": "1.25rem",
      "paddingX5": "1.5rem",
      "paddingY2": "0.375rem",
      "paddingY3": "0.625rem",
      "paddingY4": "0.75rem",
      "paddingY5": "0.875rem"
    },
    "shadow": {
      "elevated": "0 12px 32px rgb(15 23 42 / 0.12)",
      "floating": "0 24px 70px rgb(15 23 42 / 0.22)",
      "focus": "0 0 0 3px #eb4b2944",
      "glow": "0 0 32px #06b6d442"
    },
    "motion": {
      "durationFast": "130ms",
      "durationNormal": "240ms",
      "durationSlow": "420ms",
      "easeStandard": "cubic-bezier(.2,0,0,1)",
      "easeEnter": "cubic-bezier(.16,1,.3,1)",
      "easeExit": "cubic-bezier(.7,0,.84,0)",
      "scaleEnter": ".98",
      "scalePress": ".97",
      "opacityEnter": "0",
      "opacityDisabled": ".55",
      "stagger": "40ms"
    },
    "blur": {
      "glass": "0px"
    },
    "opacity": {
      "glass": "1",
      "disabled": ".55"
    }
  },
  "assets": {},
  "modes": {},
  "publishedVersion": "acme-dashboard-production-20260624083000000-a1b2c3d4",
  "validation": {
    "valid": true,
    "issues": [],
    "score": {
      "contrast": 92,
      "consistency": 96,
      "accessibility": 91
    }
  }
}
```

## Implementation Rules For Agents

When working on `zeno-site`:

- Keep `/` public.
- Keep `/docs` public.
- Keep `/app`, `/app/details`, and `/app/publishes` protected.
- Keep runtime JSON/CSS endpoints public.
- Do not require user auth in consumer apps.
- Do not expose service-role keys.
- Do not reintroduce manual admin-token publishing.
- Production storage should use Supabase as the durable source.
- In-memory storage is local fallback only.
- Preserve the `@zenoui/react` package contract and keep `@zeno-site/*` imports site-local.

When working on `zeno-ui`:

- Keep token output deterministic.
- Keep component primitives app-agnostic.
- Components should read from provider/theme context.
- Provider should fetch cloud theme on initialization.
- Provider should support cached/local fallback.
- Web should support pre-hydration CSS to avoid visible theme shift.
- React and React Native outputs should consume the same semantic token contract.

When working on Supabase:

- Use RLS for user-owned project data.
- Public runtime endpoints should be served by `zeno-site`, not direct anonymous Supabase table reads.
- Keep service-role access server-side only.
- Keep published versions immutable.
- Only move aliases after publish succeeds.
- Enforce membership checks before draft writes and publishes.

## Deployment Notes

`zeno-site` must be deployable from its own repository. It should not depend on a sibling `../zeno-ui` checkout in Vercel.

The site may vendor compatibility shims inside the repo for deployment, but the external consumer package name should remain `@zenoui/react`.

Required environment variables:

```txt
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional local-development aliases:

```txt
ZENO_SUPABASE_URL=
ZENO_SUPABASE_ANON_KEY=
ZENO_SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Do not use `NEXT_PUBLIC_` Supabase keys in production. The app only reads those public aliases as a local-development fallback.

Never commit `.env.local`.
