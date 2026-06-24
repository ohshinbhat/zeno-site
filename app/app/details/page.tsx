"use client";

import { CheckCircle2, Copy, FileCode2, Layers3, Palette } from "lucide-react";
import * as React from "react";
import { Button, Card, Stack, Text } from "@zeno-ui/react";
import { generateNativeWindThemeCss } from "@zeno-ui/nativewind-preset";
import { generateExportBundle, generateRuntimeThemeCss } from "@zeno-ui/tailwind-preset";
import { generateTheme } from "@zeno-ui/theme-engine";
import { createDetailsHref, createThemeInput, defaultThemeForm, themeFormFromSearchParams, type ThemeFormState } from "../../theme-playground";
import { useDetailsHref } from "../../site-chrome";

export default function DetailsPage(): React.ReactElement {
  const [form, setForm] = React.useState<ThemeFormState>(defaultThemeForm);

  React.useEffect(() => {
    setForm(themeFormFromSearchParams(new URLSearchParams(window.location.search)));
  }, []);

  const input = React.useMemo(() => createThemeInput(form), [form]);
  const generated = React.useMemo(() => generateTheme(input), [input]);
  const runtimeCss = React.useMemo(() => generateRuntimeThemeCss(generated.tokens), [generated.tokens]);
  const bundle = React.useMemo(() => generateExportBundle(generated.tokens), [generated.tokens]);
  const nativeWindCss = React.useMemo(() => generateNativeWindThemeCss(generated.tokens), [generated.tokens]);
  const tokenJson = React.useMemo(() => JSON.stringify(generated.tokens, null, 2), [generated.tokens]);
  const detailsHref = React.useMemo(() => createDetailsHref(form), [form]);
  useDetailsHref(detailsHref);

  return (
    <main className="site-content mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-7">
      <Stack gap="$5">
        <header className="border-b border-border pb-5">
          <Stack gap="$2">
            <Text as="p" size="label" tone="muted" weight="bold" className="uppercase">Generated details</Text>
            <Text as="h1" size="display" weight="semibold">{generated.name}</Text>
          </Stack>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard icon={<CheckCircle2 className="size-4" />} label="Accessibility" value={String(generated.score.accessibility)} />
          <SummaryCard icon={<Palette className="size-4" />} label="Palette" value={`${form.brand} / ${form.accent}`} />
          <SummaryCard icon={<Layers3 className="size-4" />} label="Mode" value={generated.tokens.knobs.mode} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card variant="surface" className="rounded-lg p-5">
            <Card.Header>
              <Stack gap="$2">
                <Text size="title" weight="semibold">Theme anatomy</Text>
                <Text tone="muted">The prompt has been resolved into stable knobs and semantic tokens.</Text>
              </Stack>
            </Card.Header>
            <Card.Content>
              <div className="grid gap-3">
                {[
                  ["Prompt", form.prompt],
                  ["Trend", generated.tokens.knobs.trend],
                  ["Mood", generated.tokens.knobs.mood],
                  ["Motion", generated.tokens.knobs.motion],
                  ["Density", generated.tokens.knobs.density],
                  ["Texture", generated.tokens.knobs.texture]
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-1 rounded-lg border border-border bg-surface-raised p-3">
                    <Text size="label" tone="muted" weight="medium">{label}</Text>
                    <Text weight="semibold" className="capitalize">{value}</Text>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          <Card variant="raised" className="rounded-lg p-5">
            <Card.Header>
              <Stack gap="$2">
                <Text size="title" weight="semibold">Color tokens</Text>
                <Text tone="muted">Copy the generated values or inspect how the names map to the active surface.</Text>
              </Stack>
            </Card.Header>
            <Card.Content>
              <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                {Object.entries(generated.tokens.color).map(([name, value]) => (
                  <ColorTokenRow key={name} name={name} value={value} />
                ))}
              </div>
            </Card.Content>
          </Card>
        </section>

        <section className="grid min-w-0 gap-5 xl:grid-cols-2">
          <CodeCard title="Tailwind @theme" value={bundle.tailwindThemeCss} />
          <CodeCard title="Runtime scoped CSS" value={runtimeCss} />
          <CodeCard title="NativeWind-ready CSS" value={nativeWindCss} />
          <CodeCard title="Token JSON" value={tokenJson} />
        </section>
      </Stack>
    </main>
  );
}

function ColorTokenRow({ name, value }: { name: string; value: string }): React.ReactElement {
  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border bg-surface p-3">
      <span className="size-8 shrink-0 rounded-md border border-border" style={{ background: value }} />
      <div className="grid min-w-0 gap-1">
        <Text size="label" weight="bold" className="truncate">{name}</Text>
        <Text size="label" tone="muted" className="break-all font-mono text-[0.72rem] leading-4">{value}</Text>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }): React.ReactElement {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-surface-raised text-text">
        {icon}
      </div>
      <Text size="label" tone="muted" weight="medium">{label}</Text>
      <Text size="title" weight="semibold" className="mt-1 truncate">{value}</Text>
    </div>
  );
}

function CodeCard({ title, value }: { title: string; value: string }): React.ReactElement {
  const [copied, setCopied] = React.useState(false);

  return (
    <Card variant="surface" className="min-w-0 rounded-lg p-0">
      <Card.Header className="mb-0 border-b border-border px-4 py-3">
        <Stack direction="row" align="center" gap="$2">
          <FileCode2 className="size-4 text-brand" />
          <Text weight="semibold">{title}</Text>
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
