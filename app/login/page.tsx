"use client";

import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button, Card, Input, Stack, Text } from "@zeno-ui/react";

type AuthMode = "login" | "signup";

function getSafeNextPath(): string {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

export default function LoginPage(): React.ReactElement {
  const [mode, setMode] = React.useState<AuthMode>("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;

    async function loadSession(): Promise<void> {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        if (!ignore && response.ok) {
          window.location.href = getSafeNextPath();
        } else if (!ignore) {
          const params = new URLSearchParams(window.location.search);
          setError(params.get("error"));
        }
      } catch {
        if (!ignore) {
          const params = new URLSearchParams(window.location.search);
          setError(params.get("error"));
        }
      }
    }

    void loadSession();
    return () => {
      ignore = true;
    };
  }, []);

  const submit = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json() as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Authentication failed.");
      }

      window.location.href = getSafeNextPath();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }, [email, mode, password]);

  return (
    <main className="site-content mx-auto grid min-h-[calc(100vh-76px)] w-full max-w-[1120px] gap-8 px-4 py-10 md:px-6 lg:grid-cols-[minmax(0,0.9fr)_420px] lg:items-center">
      <Stack gap="$5">
        <div className="inline-flex w-fit items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1.5 text-sm font-bold text-[var(--color-zeno-brand)]">
          <Sparkles className="size-4" />
          Zeno Cloud
        </div>
        <Stack gap="$3">
          <h1 className="max-w-[11ch] font-display text-[clamp(3.2rem,9vw,7rem)] font-black leading-[0.9] tracking-normal text-text">
            Sign in to publish themes.
          </h1>
          <Text className="max-w-2xl text-xl leading-8 text-text-muted">
            Create a project workspace, save theme drafts, and publish the active production alias for your apps.
          </Text>
        </Stack>
      </Stack>

      <Card variant="surface" className="rounded-lg p-5 shadow-floating">
        <Card.Header>
          <Stack gap="$2">
            <Text size="label" tone="muted" weight="bold" className="uppercase">{mode === "login" ? "Welcome back" : "Create account"}</Text>
            <Text size="title" weight="semibold">{mode === "login" ? "Log in" : "Start with Zeno"}</Text>
          </Stack>
          <span className="grid size-10 place-items-center rounded-lg bg-surface-raised text-[var(--color-zeno-brand)]">
            <LockKeyhole className="size-5" />
          </span>
        </Card.Header>
        <Card.Content>
          <form className="grid gap-4" onSubmit={submit}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error ? <Text size="label" tone="danger" weight="medium">{error}</Text> : null}
            <Button type="submit" disabled={isSubmitting} className="rounded-lg" style={{ backgroundColor: "var(--color-zeno-brand)", borderColor: "var(--color-zeno-brand)" }}>
              <Button.Text>{isSubmitting ? "Working" : mode === "login" ? "Log in" : "Create account"}</Button.Text>
              <Button.Icon><ArrowRight className="size-4" /></Button.Icon>
            </Button>
          </form>
        </Card.Content>
        <Card.Footer>
          <button
            className="text-sm font-bold text-[var(--color-zeno-brand)] underline-offset-4 hover:underline"
            type="button"
            onClick={() => {
              setMode((current) => current === "login" ? "signup" : "login");
              setError(null);
            }}
          >
            {mode === "login" ? "Create a new account" : "Use an existing account"}
          </button>
          <Link className="text-sm font-bold text-text-muted underline-offset-4 hover:text-text hover:underline" href="/docs">
            Docs
          </Link>
        </Card.Footer>
      </Card>
    </main>
  );
}
