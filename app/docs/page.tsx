import { ArrowRight, BookOpen, Code2, KeyRound, ServerCog } from "lucide-react";
import Link from "next/link";
import { Card, Stack, Text } from "@zeno-ui/react";

const installSnippet = `yarn add @zeno-ui/react @zeno-ui/theme-runtime`;

const scriptSnippet = `import { createZenoThemeScript } from "@zeno-ui/theme-runtime";

<script
  dangerouslySetInnerHTML={{
    __html: createZenoThemeScript({
      source: {
        type: "zeno",
        projectId: "acme-dashboard",
        environment: "production",
        baseUrl: "https://zeno.example.com"
      }
    })
  }}
/>`;

const providerSnippet = `import { ZenoThemeProvider } from "@zeno-ui/theme-runtime";
import { Button, Card, Text } from "@zeno-ui/react";

export function App() {
  return (
    <ZenoThemeProvider
      source={{
        type: "zeno",
        projectId: "acme-dashboard",
        environment: "production",
        baseUrl: "https://zeno.example.com"
      }}
    >
      <Card>
        <Text>Runtime themed UI</Text>
        <Button>Ship it</Button>
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
          Install the package. Fetch the active theme.
        </h1>
        <Text className="min-w-0 max-w-3xl text-lg leading-8 text-text-muted">
          Zeno Cloud stores published theme versions and exposes public JSON/CSS endpoints for the component runtime.
        </Text>
      </header>

      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <DocCard icon={<Code2 className="size-5" />} title="Install">
          <CodeBlock value={installSnippet} />
        </DocCard>

        <DocCard icon={<KeyRound className="size-5" />} title="Auth and projects">
          <Text tone="muted" className="leading-7">
            The Zeno console uses Supabase Auth for email/password sessions. Signed-in users own projects, create drafts, and publish active environment aliases.
          </Text>
          <Link className="mt-4 inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[var(--color-zeno-brand)] px-4 text-sm font-bold text-white transition hover:brightness-95" href="/login">
            Open console
            <ArrowRight className="size-4" />
          </Link>
        </DocCard>
      </section>

      <section className="grid min-w-0 gap-5">
        <DocCard icon={<ServerCog className="size-5" />} title="Pre-hydration CSS">
          <CodeBlock value={scriptSnippet} />
        </DocCard>

        <DocCard icon={<Code2 className="size-5" />} title="Runtime provider">
          <CodeBlock value={providerSnippet} />
        </DocCard>
      </section>

      <section className="grid min-w-0 gap-4 rounded-lg border border-border bg-surface/82 p-5">
        <Stack gap="$2">
          <Text size="title" weight="semibold">Runtime endpoints</Text>
          <Text tone="muted" className="leading-7">
            Published theme endpoints are public so apps can initialize without carrying user auth into client runtime.
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
