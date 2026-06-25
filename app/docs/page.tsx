import { BookOpen, Code2, ExternalLink, Layers3, PackageCheck, ServerCog, Smartphone } from "lucide-react";
import { Card, Stack, Text } from "@zeno-site/react";

const reactInstallSnippet = `yarn add @zenoui/react`;
const nativeInstallSnippet = `yarn add @zenoui/react-native nativewind tailwindcss`;
const primitiveList = "`Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `Input`, `Select`, `Stack`, `Switch`, and `Text`";
const reactPackageUrl = "https://www.npmjs.com/package/@zenoui/react";
const nativePackageUrl = "https://www.npmjs.com/package/@zenoui/react-native";

const reactTailwindSnippet = `// tailwind.config.ts
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@zenoui/react/dist/**/*.{js,mjs}"
  ]
};`;

const reactTailwindV4Snippet = `/* app/globals.css */
@import "tailwindcss";
@source "../node_modules/@zenoui/react/dist";`;

const nativeTailwindSnippet = `// tailwind.config.ts
export default {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@zenoui/react-native/dist/**/*.{js,mjs}"
  ]
};`;

const sourceSnippet = `export const zenoThemeSource = {
  type: "zeno",
  projectId: "acme-dashboard",
  environment: "production",
  baseUrl: "https://zeno.example.com"
} as const;`;

const scriptSnippet = `import { createZenoThemeScript } from "@zenoui/react";
import { zenoThemeSource } from "./zeno-theme";

<script
  dangerouslySetInnerHTML={{
    __html: createZenoThemeScript({ source: zenoThemeSource })
  }}
/>`;

const providerSnippet = `import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Select,
  Stack,
  Switch,
  Text,
  ZenoThemeProvider
} from "@zenoui/react";
import { zenoThemeSource } from "./zeno-theme";

export function App() {
  return (
    <ZenoThemeProvider
      source={zenoThemeSource}
      runtimePolicy="network-first"
    >
      <Card>
        <Stack gap="md">
          <Avatar name="Ada Lovelace" />
          <Badge tone="brand">Live</Badge>
          <Text variant="title">Project settings</Text>
          <Select
            label="Environment"
            placeholder="Choose environment"
            options={[
              { label: "Production", value: "production" },
              { label: "Preview", value: "preview" }
            ]}
          />
          <Checkbox label="Enable runtime theme" defaultChecked />
          <Switch label="Publish changes" />
        </Stack>
        <Button>Ship it</Button>
      </Card>
    </ZenoThemeProvider>
  );
}`;

const nativeProviderSnippet = `import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Select,
  Stack,
  Switch,
  Text,
  ZenoThemeProvider
} from "@zenoui/react-native";
import { zenoThemeSource } from "./zeno-theme";

export function App() {
  return (
    <ZenoThemeProvider source={zenoThemeSource}>
      <Card>
        <Stack gap="md">
          <Avatar name="Ada Lovelace" />
          <Badge tone="brand">Live</Badge>
          <Text variant="title">Mobile settings</Text>
          <Select
            label="Environment"
            placeholder="Choose environment"
            options={[
              { label: "Production", value: "production" },
              { label: "Preview", value: "preview" }
            ]}
          />
          <Checkbox label="Enable runtime theme" defaultChecked />
          <Switch label="Publish changes" />
          <Button>Save</Button>
        </Stack>
      </Card>
    </ZenoThemeProvider>
  );
}`;

export default function DocsPage(): React.ReactElement {
  return (
    <main className="site-content mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-8 md:px-6 md:py-10">
      <header className="grid min-w-0 gap-4 rounded-lg border border-border bg-surface/82 p-5 shadow-[0_14px_44px_rgb(0_0_0_/_0.08)] md:p-6">
        <div className="inline-flex w-fit items-center gap-2 rounded-pill border border-[color-mix(in_srgb,var(--color-zeno-brand),var(--color-border)_72%)] bg-background px-3 py-1.5 text-sm font-bold text-[var(--color-zeno-brand)]">
          <BookOpen className="size-4" />
          Zeno docs
        </div>
        <h1 className="min-w-0 max-w-4xl break-words font-display text-[2.25rem] font-black leading-[0.98] tracking-normal text-text sm:text-[3.6rem] lg:text-[4.7rem]">
          Install the package. Initialize from the active theme.
        </h1>
        <Text className="min-w-0 max-w-3xl text-lg leading-8 text-text-muted">
          @zenoui/react and @zenoui/react-native give your apps the provider and token-driven primitives. Zeno Cloud serves the published token contract, so web and native UI can update from the active environment without shipping new component code.
        </Text>
      </header>

      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <DocCard icon={<PackageCheck className="size-5" />} title="Install React">
          <Text tone="muted" className="leading-7">
            Add the web package to a React app. It includes the hosted-theme provider, pre-hydration helper, runtime CSS utilities, and primitives including {primitiveList}.
          </Text>
          <PackageLink href={reactPackageUrl} label="@zenoui/react on npm" />
          <CodeBlock value={reactInstallSnippet} />
          <CodeBlock value={reactTailwindV4Snippet} />
          <CodeBlock value={reactTailwindSnippet} />
        </DocCard>

        <DocCard icon={<Smartphone className="size-5" />} title="Install React Native">
          <Text tone="muted" className="leading-7">
            Add the native package to a React Native app with NativeWind. It exposes the same primitive names and reads the same Zeno token contract through the native provider.
          </Text>
          <PackageLink href={nativePackageUrl} label="@zenoui/react-native on npm" />
          <CodeBlock value={nativeInstallSnippet} />
          <CodeBlock value={nativeTailwindSnippet} />
        </DocCard>
      </section>

      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <DocCard icon={<Layers3 className="size-5" />} title="Create a theme source">
          <Text tone="muted" className="leading-7">
            A theme source points the runtime at one project and environment. Consumer apps do not need Supabase keys or authoring credentials; they only need the public Zeno base URL and the project environment they should follow.
          </Text>
          <CodeBlock value={sourceSnippet} />
        </DocCard>
      </section>

      <section className="grid min-w-0 gap-5">
        <DocCard icon={<ServerCog className="size-5" />} title="Pre-hydration CSS">
          <Text tone="muted" className="leading-7">
            In server-rendered apps, inject the generated script in the document head. It applies the latest cached or fetched theme before React paints, so the first visible frame already has the right CSS variables.
          </Text>
          <CodeBlock value={scriptSnippet} />
        </DocCard>

        <DocCard icon={<Code2 className="size-5" />} title="Runtime provider">
          <Text tone="muted" className="leading-7">
            Wrap the app once near the root. On web, the provider loads the active token JSON and applies CSS variables. On React Native, the provider exposes the same semantic token contract through NativeWind-compatible primitives.
          </Text>
          <CodeBlock value={providerSnippet} />
        </DocCard>

        <DocCard icon={<Smartphone className="size-5" />} title="Native provider">
          <Text tone="muted" className="leading-7">
            The React Native package mirrors the web primitive surface so product screens can share theme concepts across platforms.
          </Text>
          <CodeBlock value={nativeProviderSnippet} />
        </DocCard>
      </section>

      <section className="grid min-w-0 gap-4 rounded-lg border border-border bg-surface/82 p-5">
        <Stack gap="$2">
          <Text size="title" weight="semibold">Runtime endpoints</Text>
          <Text tone="muted" className="leading-7">
            Published endpoints are public by design. They expose read-only theme contracts and generated CSS, while authoring, drafts, membership, and publishing stay behind the Zeno console. That keeps runtime apps simple: fetch by project and environment, then let the active alias decide which immutable version is current.
          </Text>
        </Stack>
        <div className="grid gap-2">
          <Endpoint value="GET /api/themes/:projectId/:environment.json" />
          <Endpoint value="GET /api/themes/:projectId/:environment.css" />
          <Endpoint value="GET /api/themes/:projectId/versions/:version.json" />
        </div>
      </section>
    </main>
  );
}

function PackageLink({ href, label }: { href: string; label: string }): React.ReactElement {
  return (
    <a
      className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-bold text-text transition hover:border-[var(--color-zeno-brand)] hover:text-[var(--color-zeno-brand)] focus-visible:outline-none focus-visible:shadow-focus"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
      <ExternalLink className="size-3.5" />
    </a>
  );
}

function DocCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <Card variant="surface" className="min-w-0 rounded-lg border-border/80 p-5">
      <Card.Header>
        <span className="grid size-10 place-items-center rounded-lg bg-surface-raised text-[var(--color-zeno-brand)]">{icon}</span>
        <Text size="title" weight="semibold">{title}</Text>
      </Card.Header>
      <Card.Content>
        <Stack gap="$3">{children}</Stack>
      </Card.Content>
    </Card>
  );
}

function CodeBlock({ value }: { value: string }): React.ReactElement {
  return (
    <pre className="min-w-0 overflow-x-auto rounded-lg border border-[color-mix(in_srgb,var(--color-border),var(--color-zeno-brand)_14%)] bg-[color-mix(in_srgb,var(--color-surface-raised),var(--color-background)_34%)] p-4 font-mono text-xs leading-5 text-[color-mix(in_srgb,var(--color-text),var(--color-text-muted)_38%)] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)]">
      {value}
    </pre>
  );
}

function Endpoint({ value }: { value: string }): React.ReactElement {
  return (
    <code className="min-w-0 overflow-x-auto rounded-lg border border-[color-mix(in_srgb,var(--color-border),var(--color-zeno-brand)_12%)] bg-[color-mix(in_srgb,var(--color-surface-raised),var(--color-background)_44%)] px-3 py-2 font-mono text-sm font-semibold text-text-muted">
      {value}
    </code>
  );
}
