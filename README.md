# Zeno

Zeno is an AI-powered component library and cloud theme system.

Users authenticate in Zeno Cloud, generate or select a theme, publish it to a project environment, and let their apps fetch the active token contract at runtime. Consumer apps use `@zenoui/react` to render components from the latest published theme without redeploying app code.

## Product Flow

```txt
Authenticate -> Generate or select theme -> Publish to Zeno Cloud -> App fetches active token contract -> UI updates on initialization
```

Zeno has three parts:

- **`zeno-site`**: website, docs, authenticated playground, publish console, and runtime theme API.
- **`zeno-ui`**: npm package family for components, token schema, generation, runtime provider, and platform outputs.
- **Supabase**: auth, projects, memberships, drafts, immutable theme versions, and active environment aliases.

## Repositories

### zeno-site

This repo is the Zeno Cloud control plane.

It includes:

- Public landing page.
- Public docs page.
- Email/password auth.
- Authenticated theme playground.
- Project picker.
- Theme generation and preset selection.
- Draft saving.
- Theme publishing.
- Publish history.
- Public runtime JSON/CSS endpoints.

Route map:

```txt
/                     Public landing page
/docs                 Public docs
/login                Auth
/app                  Authenticated playground
/app/details          Theme/token details
/app/publishes        Publish history
```

Runtime endpoints:

```txt
GET /api/themes/:projectId/:environment.json
GET /api/themes/:projectId/:environment.css
GET /api/themes/:projectId/versions/:version.json
```

Runtime endpoints are public on purpose. Consumer apps should not need user auth or direct Supabase access to initialize their theme.

### zeno-ui

`zeno-ui` is the consumer component package used by apps and by the playground preview.

| Package | Purpose | npm |
| --- | --- | --- |
| `@zenoui/react` | React primitives, hosted-theme provider, pre-hydration script, and runtime CSS helpers | [npm](https://www.npmjs.com/package/@zenoui/react) |

This repo also has site-only compatibility shims under `vendor/zeno-site`. They are imported as `@zeno-site/*` inside this repository only so the control plane code is not confused with the published package.

## Runtime Usage

Install the runtime and React package in a consumer app:

```bash
yarn add @zenoui/react
```

Create a Zeno theme source:

```ts
export const zenoThemeSource = {
  type: "zeno",
  projectId: "your-project-id",
  environment: "production",
  baseUrl: "https://zenoui.in"
} as const;
```

Use the provider:

```tsx
import { ZenoThemeProvider } from "@zenoui/react";
import { zenoThemeSource } from "./zeno-theme";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ZenoThemeProvider source={zenoThemeSource}>
      {children}
    </ZenoThemeProvider>
  );
}
```

For Next.js, use the pre-hydration script to reduce visible theme shift:

```tsx
import { createZenoThemeScript, ZenoThemeProvider } from "@zenoui/react";

const source = {
  type: "zeno",
  projectId: process.env.NEXT_PUBLIC_ZENO_PROJECT_ID!,
  environment: process.env.NEXT_PUBLIC_ZENO_ENVIRONMENT ?? "production",
  baseUrl: process.env.NEXT_PUBLIC_ZENO_BASE_URL!
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

## Published Token Contract

The runtime JSON endpoint returns a deterministic token config:

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
    knobs: Record<string, string>;
    color: Record<string, string>;
    radius: Record<string, string>;
    spacing: Record<string, string>;
    type: Record<string, string>;
    size: Record<string, string>;
    shadow: Record<string, string>;
    motion: Record<string, string>;
    blur: Record<string, string>;
    opacity: Record<string, string>;
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

Consumer apps should treat this JSON as read-only runtime configuration.

## Supabase

Supabase backs auth and durable theme storage.

Required tables:

```txt
projects
project_members
theme_drafts
theme_versions
theme_aliases
```

Table responsibilities:

- `projects`: project/workspace records.
- `project_members`: user access roles: `owner`, `admin`, `member`.
- `theme_drafts`: editable saved themes.
- `theme_versions`: immutable published themes.
- `theme_aliases`: active environment pointers, such as `production -> version`.

Publishing creates a new `theme_versions` row and moves the matching `theme_aliases` row to that version.

## Environment

Create `.env.local`:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

Production requires these Supabase variables:

- `SUPABASE_URL`: your Supabase project URL.
- `SUPABASE_ANON_KEY`: used by server routes for Supabase Auth sign-in, sign-up, and session lookup.
- `SUPABASE_SERVICE_ROLE_KEY`: used only by server routes for projects, drafts, published theme versions, and environment aliases.

Do not add `NEXT_PUBLIC_` Supabase keys for a new deploy. The app can still read existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` host settings for compatibility, but the env file should use the server-side Supabase names above. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code or a public bundle.

For production AI-assisted theme generation, set `GEMINI_API_KEY`. Without it, theme generation still works through the deterministic generator.

## Local Development

Install dependencies:

```bash
yarn install
```

Run the dev server:

```bash
yarn dev
```

Build:

```bash
yarn build
```

Typecheck:

```bash
yarn typecheck
```

## Deployment

`zeno-site` is deployable from this repository alone.

Vercel should run:

```bash
yarn install --frozen-lockfile
yarn build
```

The site-local `@zeno-site/*` shims compile through Next.js; `yarn build:packages` is a no-op kept for deploy script compatibility.

## Agent Context

For deeper implementation context, see [`AGENTS.md`](./AGENTS.md).
