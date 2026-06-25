import { ArrowRight, CheckCircle2, Cloud, Code2, Layers3, PackageCheck, Palette, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { Button, Card, Input, Stack, Text } from "@zeno-site/react";
import { generateTheme } from "@zeno-site/theme-engine";
import { MountReveal, ScrollReveal, ScrollSection, Stagger, StaggerItem } from "./home-motion";

const heroTheme = generateTheme({
  prompt: "bold cloud theme console for a developer tools launch",
  trend: "bento",
  mood: "clear",
  motion: "smooth",
  brand: "#eb4b29",
  accent: "#06b6d4"
});

const installSnippet = "yarn add @zenoui/react";

export default function LandingPage(): React.ReactElement {
  return (
    <main className="site-content">
        <section className="mx-auto grid w-full max-w-[1360px] gap-8 px-4 py-10 sm:px-5 md:px-6 lg:min-h-[680px] lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,0.78fr)] lg:items-center lg:gap-10 lg:px-8 lg:py-12 xl:min-h-[720px] xl:gap-14">
          <Stagger className="grid max-w-[680px] gap-4">
            <StaggerItem className="inline-flex w-fit items-center gap-2 rounded-pill border border-[color-mix(in_srgb,var(--color-zeno-brand),var(--color-border)_52%)] bg-surface px-3 py-1.5 text-xs font-bold text-[var(--color-zeno-brand)] shadow-[0_10px_30px_rgb(235_75_41_/_0.12)] sm:text-sm">
              <Sparkles className="size-4" />
              Cloud themes for Zeno UI
            </StaggerItem>
            <StaggerItem>
              <Stack gap="$3">
                <h1 className="max-w-[10.8ch] font-display text-[3.65rem] font-black leading-[1.01] tracking-normal text-text sm:text-[4.7rem] lg:text-[5.4rem] xl:text-[5.9rem] 2xl:text-[6.35rem]">
                  Ship a UI theme from a prompt.
                </h1>
                <Text className="max-w-xl text-base leading-7 text-text-muted sm:text-lg">
                  Generate or select a theme, publish a stable runtime contract, then initialize your app with @zenoui/react so every component reads the active design system at startup.
                </Text>
              </Stack>
            </StaggerItem>
            <StaggerItem className="flex flex-wrap items-center gap-3">
              <Link className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-zeno-brand)] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgb(235_75_41_/_0.22)] transition hover:brightness-95 focus-visible:outline-none focus-visible:shadow-focus" href="/app">
                <span>Open console</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-bold text-text transition hover:bg-surface-raised focus-visible:outline-none focus-visible:shadow-focus" href="/docs">
                <Code2 className="size-4" />
                Docs
              </Link>
            </StaggerItem>
          </Stagger>

          <MountReveal className="min-w-0 w-full max-w-[760px] justify-self-center lg:justify-self-end" delay={0.18}>
            <ThemeConsolePreview />
          </MountReveal>
        </section>

        <ScrollSection className="border-y border-border bg-surface/72">
          <div className="mx-auto grid w-full max-w-[1440px] gap-5 px-4 py-8 md:px-6 lg:grid-cols-4">
            <FlowStep icon={<Wand2 className="size-5" />} title="Generate" copy="Prompts and presets resolve into colors, spacing, type, radius, motion, and validation scores." />
            <FlowStep icon={<Cloud className="size-5" />} title="Publish" copy="Zeno stores an immutable version and points an environment alias such as production at it." />
            <FlowStep icon={<PackageCheck className="size-5" />} title="Install" copy="Add @zenoui/react to the consumer app and keep using Zeno primitives for buttons, cards, fields, and layout." />
            <FlowStep icon={<Layers3 className="size-5" />} title="Initialize" copy="Pass a project source into the provider. It fetches the active contract, applies tokens, and keeps fallback config ready." />
          </div>
        </ScrollSection>

        <section className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-10 md:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-start">
          <ScrollReveal>
            <Stack gap="$4">
              <Text as="p" size="label" tone="muted" weight="bold" className="uppercase">What Zeno does</Text>
              <Text as="h2" size="display" weight="semibold" className="max-w-2xl">Design tokens become runtime infrastructure.</Text>
              <Text className="max-w-2xl text-lg leading-7 text-text-muted">
                Zeno connects the theme playground, hosted publish workflow, and React package into one loop. Your product installs the provider once, then future visual updates move through hosted theme versions instead of component rewrites or redeploy-only token files.
              </Text>
            </Stack>
          </ScrollReveal>

          <ScrollReveal className="grid gap-4 md:grid-cols-2" delay={0.08}>
            <Capability icon={<Palette className="size-5" />} title="Theme authoring" copy="Start from presets or tune brand, accent, trend, mood, and motion until the token contract matches your product." />
            <Capability icon={<CheckCircle2 className="size-5" />} title="Package-ready output" copy="Published configs are normalized into the same semantic keys that @zenoui/react components read at runtime." />
            <Capability icon={<Cloud className="size-5" />} title="Environment aliases" copy="Production, staging, and preview can point to different immutable versions while history stays available." />
            <Capability icon={<Code2 className="size-5" />} title="Provider initialization" copy="ZenoThemeProvider fetches the active JSON, applies CSS variables, and keeps a fallback path for offline starts." />
          </ScrollReveal>
        </section>

        <ScrollSection className="mx-auto w-full max-w-[1440px] px-4 pb-12 md:px-6">
          <div className="grid gap-4 rounded-lg border border-border bg-surface p-4 shadow-[0_18px_56px_rgb(15_23_42_/_0.08)] sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <Stack gap="$2" className="min-w-0">
              <Text size="label" tone="muted" weight="bold" className="uppercase">Package install</Text>
              <Text tone="muted" className="max-w-2xl leading-6">
                Add the package to a consumer app, provide a Zeno theme source with project, environment, and base URL, then let the provider pull the current production theme from your cloud endpoint.
              </Text>
              <pre className="max-w-full overflow-x-auto rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm font-semibold leading-6 text-text">{installSnippet}</pre>
            </Stack>
            <div className="flex flex-wrap gap-3">
              <Link className="inline-flex h-10 items-center rounded-lg bg-[var(--color-zeno-brand)] px-4 text-sm font-bold text-white transition hover:brightness-95" href="/docs">
                Read docs
              </Link>
              <Link className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-bold text-text transition hover:bg-surface-raised" href="/app">
                Open console
              </Link>
            </div>
          </div>
        </ScrollSection>
    </main>
  );
}

function ThemeConsolePreview(): React.ReactElement {
  return (
    <section className="landing-preview min-w-0 w-full overflow-hidden rounded-lg border border-border bg-background shadow-[0_24px_72px_rgb(15_23_42_/_0.14)]">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3.5 py-3 sm:px-4">
        <Stack gap="$2" className="min-w-0">
          <Text size="label" tone="muted" weight="bold" className="text-xs uppercase">Live component display</Text>
          <Text size="title" weight="semibold" className="text-[1.25rem] leading-7">{heroTheme.name}</Text>
        </Stack>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-brand-contrast shadow-glow">
          <Palette className="size-4" />
        </span>
      </div>
      <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-[minmax(0,0.84fr)_minmax(240px,1fr)]">
        <Card variant="glass" className="rounded-lg p-4">
          <Card.Header>
            <Stack gap="$2">
              <Text weight="semibold">Theme brief</Text>
              <Text tone="muted">Brand, motion, and density stay editable.</Text>
            </Stack>
          </Card.Header>
          <Card.Content>
            <Stack gap="$3">
              <Input label="Prompt" value="warm cloud console controls" readOnly />
              <div className="grid grid-cols-2 gap-3">
                <Button><Button.Text>Generate</Button.Text></Button>
                <Button variant="outline" tone="neutral"><Button.Text>Save</Button.Text></Button>
              </div>
              <div className="grid gap-2">
                <div className="h-2 rounded-pill bg-[linear-gradient(90deg,var(--color-brand),var(--color-accent))]" />
                <div className="grid grid-cols-3 gap-2">
                  {["brand", "accent", "surface"].map((label) => (
                    <span
                      className="rounded-lg border border-border bg-surface px-2 py-1.5 text-center font-mono text-[0.68rem] font-bold text-text-muted"
                      key={label}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </Stack>
          </Card.Content>
        </Card>

        <Card variant="raised" className="rounded-lg p-4">
          <Card.Header>
            <Stack gap="$2">
              <Text weight="semibold">Published runtime</Text>
              <Text tone="muted">Apps fetch the active environment alias.</Text>
            </Stack>
            <Cloud className="size-5 text-accent" />
          </Card.Header>
          <Card.Content>
            <div className="grid gap-3">
              {[
                ["Project", "acme-dashboard"],
                ["Environment", "production"],
                ["Version", "20260622-eb4b29"]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[94px_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-surface p-2.5 text-sm"
                >
                  <span className="font-bold text-text-muted">{label}</span>
                  <span className="truncate font-mono font-semibold text-text">{value}</span>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    </section>
  );
}

function FlowStep({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }): React.ReactElement {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-background p-4">
      <span className="grid size-10 place-items-center rounded-lg bg-surface-raised text-[var(--color-zeno-brand)]">{icon}</span>
      <Text weight="semibold">{title}</Text>
      <Text tone="muted" className="leading-6">{copy}</Text>
    </div>
  );
}

function Capability({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }): React.ReactElement {
  return (
    <Card variant="surface" className="rounded-lg p-5">
      <Card.Header>
        <span className="grid size-10 place-items-center rounded-lg bg-surface-raised text-[var(--color-zeno-brand)]">{icon}</span>
      </Card.Header>
      <Card.Content>
        <Stack gap="$2">
          <Text weight="semibold">{title}</Text>
          <Text tone="muted" className="leading-6">{copy}</Text>
        </Stack>
      </Card.Content>
    </Card>
  );
}
