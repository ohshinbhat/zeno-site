"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { createDetailsHref, defaultThemeForm } from "./theme-playground";

export type SiteMode = "light" | "dark";

type SiteChromeContextValue = {
  setDetailsHref: (href: string) => void;
};

const defaultDetailsHref = createDetailsHref(defaultThemeForm);
const SiteChromeContext = React.createContext<SiteChromeContextValue | null>(null);

export function SiteShell({ children }: { children: React.ReactNode }): React.ReactElement {
  const [detailsHref, setDetailsHref] = React.useState(defaultDetailsHref);
  const [siteMode, toggleSiteMode] = useSiteMode();
  const pathname = usePathname();
  const active = pathname?.startsWith("/details") ? "details" : "playground";

  const chromeContext = React.useMemo<SiteChromeContextValue>(() => ({ setDetailsHref }), []);

  return (
    <SiteChromeContext.Provider value={chromeContext}>
      <div className="site-shell min-h-screen bg-background text-text">
        <SiteHeader active={active} detailsHref={detailsHref} mode={siteMode} onToggleMode={toggleSiteMode} />
        {children}
      </div>
    </SiteChromeContext.Provider>
  );
}

export function useDetailsHref(detailsHref: string): void {
  const context = React.useContext(SiteChromeContext);

  React.useEffect(() => {
    context?.setDetailsHref(detailsHref);
  }, [context, detailsHref]);
}

export function useSiteMode(): [SiteMode, () => void] {
  const [mode, setMode] = React.useState<SiteMode>("light");

  const applyMode = React.useCallback((next: SiteMode) => {
    document.documentElement.dataset.siteMode = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem("zeno-ui-site-mode", next);
  }, []);

  React.useEffect(() => {
    const rootMode = document.documentElement.dataset.siteMode;
    const storedMode = window.localStorage.getItem("zeno-ui-site-mode");
    const next = rootMode === "light" || rootMode === "dark"
      ? rootMode
      : storedMode === "light" || storedMode === "dark"
        ? storedMode
        : "light";

    setMode(next);
    applyMode(next);
  }, [applyMode]);

  const toggleMode = React.useCallback(() => {
    setMode((current) => {
      const next = current === "light" ? "dark" : "light";
      applyMode(next);
      return next;
    });
  }, [applyMode]);

  return [mode, toggleMode];
}

export function SiteHeader({
  active,
  detailsHref,
  mode,
  onToggleMode
}: {
  active: "playground" | "details";
  detailsHref: string;
  mode: SiteMode;
  onToggleMode: () => void;
}): React.ReactElement {
  const [isSwitching, setIsSwitching] = React.useState(false);

  React.useEffect(() => {
    setIsSwitching(true);
    const timeout = window.setTimeout(() => setIsSwitching(false), 420);
    return () => window.clearTimeout(timeout);
  }, [active]);

  const startRouteSwitch = React.useCallback(() => {
    setIsSwitching(true);
    window.setTimeout(() => setIsSwitching(false), 520);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/92 backdrop-blur-xl">
      {isSwitching ? <span className="route-progress" aria-hidden="true" /> : null}
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(235_75_41_/_0.18)]" aria-label="Zeno UI playground">
          <img className="size-11 shrink-0 object-contain" src="/zeno-logo.svg" alt="" />
          <span className="min-w-0">
            <span className="block font-display text-lg font-semibold leading-none text-[var(--color-zeno-brand)]">Zeno UI</span>
            <span className="mt-1 block truncate text-xs font-medium text-text-muted max-[460px]:hidden">AI powered component library</span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1 rounded-lg border border-[color-mix(in_srgb,var(--color-zeno-brand),var(--color-border)_70%)] bg-background p-1 shadow-[0_0_0_1px_rgb(235_75_41_/_0.06)]" aria-label="Primary navigation">
          <NavItem href="/" active={active === "playground"} onNavigate={startRouteSwitch}>Playground</NavItem>
          <NavItem href={detailsHref} active={active === "details"} onNavigate={startRouteSwitch}>Details</NavItem>
          <button
            className="grid size-9 place-items-center rounded-md text-text-muted transition hover:bg-surface-raised hover:text-text focus-visible:outline-none focus-visible:shadow-focus"
            onClick={onToggleMode}
            type="button"
            aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {mode === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
        </nav>
      </div>
    </header>
  );
}

function NavItem({
  href,
  active,
  children,
  onNavigate
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onNavigate: () => void;
}): React.ReactElement {
  return (
    <Link
      className={[
        "inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(235_75_41_/_0.18)]",
        active ? "bg-[var(--color-zeno-brand)] text-white shadow-[0_8px_22px_rgb(235_75_41_/_0.22)]" : "text-text-muted hover:bg-surface-raised hover:text-[var(--color-zeno-brand)]"
      ].join(" ")}
      href={href}
      prefetch
      onClick={() => {
        if (!active) onNavigate();
      }}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
