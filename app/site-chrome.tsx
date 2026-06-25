"use client";

import { ChevronDown, Github, History, LogOut, Moon, Sun, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Text } from "@zeno-site/react";
import type { AuthUser } from "./auth";
import { createDetailsHref, defaultThemeForm } from "./theme-playground";

export type SiteMode = "light" | "dark";
type ActiveRoute = "home" | "docs" | "app" | "publishes" | "login";

export type PublishHistoryItem = {
  projectId: string;
  environment: string;
  version: string;
  hash: string;
  createdAt: string;
};

type SiteChromeContextValue = {
  setAccountHistory: (history: PublishHistoryItem[], error: string | null) => void;
  setDetailsHref: (href: string) => void;
};

const defaultDetailsHref = createDetailsHref(defaultThemeForm);
const SiteChromeContext = React.createContext<SiteChromeContextValue | null>(null);
const siteGithubUrl = "https://github.com/ohshinbhat/zeno-site";
const packageGithubUrl = "https://github.com/ohshinbhat/zeno-ui";

export function SiteShell({ children }: { children: React.ReactNode }): React.ReactElement {
  const [detailsHref, setDetailsHref] = React.useState(defaultDetailsHref);
  const [accountHistory, setAccountHistoryState] = React.useState<PublishHistoryItem[]>([]);
  const [accountHistoryError, setAccountHistoryError] = React.useState<string | null>(null);
  const [siteMode, toggleSiteMode] = useSiteMode();
  const [hasHydrated, setHasHydrated] = React.useState(false);
  const pathname = usePathname();
  const active: ActiveRoute = pathname?.startsWith("/docs")
    ? "docs"
    : pathname?.startsWith("/app/publishes")
      ? "publishes"
    : pathname?.startsWith("/app")
      ? "app"
      : pathname?.startsWith("/login")
        ? "login"
        : "home";
  const chromeActive = hasHydrated ? active : "home";

  const setAccountHistory = React.useCallback((history: PublishHistoryItem[], error: string | null) => {
    setAccountHistoryState(history);
    setAccountHistoryError(error);
  }, []);

  const chromeContext = React.useMemo<SiteChromeContextValue>(() => ({
    setAccountHistory,
    setDetailsHref
  }), [setAccountHistory]);

  React.useEffect(() => {
    setHasHydrated(true);
  }, []);

  return (
    <SiteChromeContext.Provider value={chromeContext}>
      <div className="site-shell min-h-screen bg-background text-text">
        <SiteHeader
          active={chromeActive}
          detailsHref={detailsHref}
          mode={siteMode}
          onToggleMode={toggleSiteMode}
          publishHistory={accountHistory}
          publishHistoryError={accountHistoryError}
        />
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

export function useAccountHistory(history: PublishHistoryItem[], error: string | null): void {
  const context = React.useContext(SiteChromeContext);

  React.useEffect(() => {
    context?.setAccountHistory(history, error);
    return () => {
      context?.setAccountHistory([], null);
    };
  }, [context, error, history]);
}

export function useSiteMode(): [SiteMode, () => void] {
  const [mode, setMode] = React.useState<SiteMode>("dark");

  const applyMode = React.useCallback((next: SiteMode, persist = false) => {
    document.documentElement.dataset.siteMode = next;
    if (persist) {
      window.localStorage.setItem("zeno-ui-site-mode", next);
      window.localStorage.setItem("zeno-ui-site-mode-choice", "true");
    }
  }, []);

  React.useEffect(() => {
    const rootMode = document.documentElement.dataset.siteMode;
    const storedMode = window.localStorage.getItem("zeno-ui-site-mode");
    const hasChoice = window.localStorage.getItem("zeno-ui-site-mode-choice") === "true";
    const next = hasChoice && (storedMode === "light" || storedMode === "dark")
      ? storedMode
      : rootMode === "light" || rootMode === "dark"
        ? rootMode
        : "dark";

    setMode(next);
    applyMode(next);
  }, [applyMode]);

  const toggleMode = React.useCallback(() => {
    setMode((current) => {
      const next = current === "light" ? "dark" : "light";
      applyMode(next, true);
      return next;
    });
  }, [applyMode]);

  return [mode, toggleMode];
}

export function SiteHeader({
  active,
  detailsHref,
  mode,
  onToggleMode,
  publishHistory,
  publishHistoryError
}: {
  active: ActiveRoute;
  detailsHref: string;
  mode: SiteMode;
  onToggleMode: () => void;
  publishHistory: PublishHistoryItem[];
  publishHistoryError: string | null;
}): React.ReactElement {
  const [isSwitching, setIsSwitching] = React.useState(false);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isAccountOpen, setIsAccountOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement | null>(null);
  const isAuthenticated = Boolean(user);

  React.useEffect(() => {
    let ignore = false;

    async function loadSession(): Promise<void> {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const result = await response.json().catch(() => null) as { user?: AuthUser | null } | null;
        if (!ignore) setUser(response.ok && result?.user ? result.user : null);
      } catch {
        if (!ignore) setUser(null);
      }
    }

    void loadSession();
    return () => {
      ignore = true;
    };
  }, [active]);

  React.useEffect(() => {
    setIsSwitching(true);
    const timeout = window.setTimeout(() => setIsSwitching(false), 420);
    return () => window.clearTimeout(timeout);
  }, [active]);

  const startRouteSwitch = React.useCallback(() => {
    setIsSwitching(true);
    window.setTimeout(() => setIsSwitching(false), 520);
  }, []);

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsAccountOpen(false);
    window.location.href = "/";
  }, []);
  const effectiveActive: ActiveRoute = (active === "app" || active === "publishes") && !isAuthenticated ? "login" : active;

  React.useEffect(() => {
    if (!isAccountOpen) return;

    function closeOnOutsideClick(event: PointerEvent): void {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") setIsAccountOpen(false);
    }

    window.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isAccountOpen]);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/92 backdrop-blur-xl">
      {isSwitching ? <span className="route-progress" aria-hidden="true" /> : null}
      <div ref={accountMenuRef} className="relative mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:flex-nowrap md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(235_75_41_/_0.18)]" aria-label="Zeno UI">
          <img className="size-11 shrink-0 object-contain" src="/zeno-logo.svg" alt="" />
          <span className="min-w-0">
            <span className="block font-display text-lg font-semibold leading-none text-[var(--color-zeno-brand)]">Zeno UI</span>
            <span className="mt-1 block truncate text-xs font-medium text-text-muted max-[460px]:hidden">AI powered component library</span>
          </span>
        </Link>

        <nav className="flex max-w-full shrink-0 items-center gap-1 overflow-x-auto rounded-lg border border-[color-mix(in_srgb,var(--color-zeno-brand),var(--color-border)_70%)] bg-background p-1 shadow-[0_0_0_1px_rgb(235_75_41_/_0.06)]" aria-label="Primary navigation">
          <NavItem href="/" active={effectiveActive === "home"} onNavigate={startRouteSwitch}>Home</NavItem>
          <NavItem href="/docs" active={effectiveActive === "docs"} onNavigate={startRouteSwitch}>Docs</NavItem>
          <NavItem href="/app" active={effectiveActive === "app"} onNavigate={startRouteSwitch}>Console</NavItem>
          {isAuthenticated ? <NavItem href="/app/publishes" active={effectiveActive === "publishes"} onNavigate={startRouteSwitch}>Publishes</NavItem> : null}
          <ExternalNavItem href={siteGithubUrl} label="Site repo" />
          <ExternalNavItem href={packageGithubUrl} label="Package repo" />
          {user ? (
            <button
              className="inline-flex h-9 max-w-[220px] items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-xs font-bold text-text shadow-[0_0_0_1px_rgb(255_255_255_/_0.02)] transition hover:bg-surface-raised focus-visible:outline-none focus-visible:shadow-focus"
              type="button"
              aria-expanded={isAccountOpen}
              aria-haspopup="menu"
              onClick={() => setIsAccountOpen((current) => !current)}
            >
              <ProfileAvatar user={user} />
              <span className="hidden min-w-0 max-w-[150px] truncate sm:block">{getProfileLabel(user)}</span>
              <ChevronDown className="size-3.5 shrink-0 text-text-muted" />
            </button>
          ) : (
            <NavItem href="/login" active={effectiveActive === "login"} onNavigate={startRouteSwitch}>Sign in</NavItem>
          )}
          <button
            className="grid size-9 place-items-center rounded-md text-text-muted transition hover:bg-surface-raised hover:text-text focus-visible:outline-none focus-visible:shadow-focus"
            onClick={onToggleMode}
            type="button"
            aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {mode === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
        </nav>

        {user && isAccountOpen ? (
          <AccountDropdown
            history={publishHistory}
            historyError={publishHistoryError}
            onClose={() => setIsAccountOpen(false)}
            onLogout={logout}
            user={user}
          />
        ) : null}
      </div>
    </header>
  );
}

function getProfileLabel(user: AuthUser): string {
  return user.name || user.email.split("@")[0] || "Profile";
}

function ProfileAvatar({ user, size = "sm" }: { user: AuthUser; size?: "sm" | "lg" }): React.ReactElement {
  const label = getProfileLabel(user);
  const initial = label.trim().slice(0, 1).toUpperCase() || "Z";

  return (
    <span className={[
      "grid shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--color-zeno-brand)] font-black text-white",
      size === "lg" ? "size-11 text-base" : "size-6 text-[0.68rem]"
    ].join(" ")}>
      {user.avatarUrl ? <img className="size-full object-cover" src={user.avatarUrl} alt="" referrerPolicy="no-referrer" /> : initial}
    </span>
  );
}

function AccountDropdown({
  history,
  historyError,
  onClose,
  onLogout,
  user
}: {
  history: PublishHistoryItem[];
  historyError: string | null;
  onClose: () => void;
  onLogout: () => void;
  user: AuthUser;
}): React.ReactElement {
  const label = user.name || user.email.split("@")[0] || "Profile";

  return (
    <div className="absolute right-4 top-[calc(100%+0.5rem)] z-50 grid w-[min(380px,calc(100vw-2rem))] gap-3 rounded-lg border border-border bg-surface p-4 text-text shadow-floating md:right-6" role="menu">
      <div className="grid gap-3">
        <Text size="label" tone="muted" weight="bold" className="text-[0.68rem] uppercase leading-3 tracking-[0.08em]">Profile</Text>
        <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-4">
          <ProfileAvatar user={user} size="lg" />
          <div className="grid min-w-0 gap-1">
            <Text weight="semibold" className="block truncate text-base leading-5">{label}</Text>
            <Text size="label" tone="muted" className="block truncate text-sm leading-5">{user.email}</Text>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-text-muted">
            <UserRound className="size-4" />
          </span>
        </div>
      </div>

      <div className="grid gap-2 border-t border-border pt-2">
        <div className="flex items-center justify-between gap-2">
          <Text size="label" tone="muted" weight="bold" className="text-[0.62rem] uppercase leading-3">Publish history</Text>
          <History className="size-3.5 shrink-0 text-text-muted" />
        </div>
        {historyError ? (
          <Text size="label" tone="danger" weight="medium" className="leading-4">{historyError}</Text>
        ) : history.length === 0 ? (
          <Text size="label" tone="muted" className="leading-4">No publishes yet.</Text>
        ) : (
          <div className="grid max-h-44 gap-1.5 overflow-y-auto pr-1">
            {history.map((item) => (
              <div key={`${item.environment}:${item.version}`} className="grid gap-1 rounded-md border border-border bg-background px-2 py-1.5">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[0.62rem] font-bold uppercase leading-3 text-[var(--color-zeno-brand)]">{item.environment}</span>
                  <span className="shrink-0 text-[0.6rem] font-medium leading-3 text-text-muted">{formatPublishTime(item.createdAt)}</span>
                </div>
                <span className="truncate font-mono text-[0.62rem] font-semibold leading-4 text-text">{item.version}</span>
              </div>
            ))}
          </div>
        )}
        <Link
          className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-bold text-text-muted transition hover:bg-surface-raised hover:text-[var(--color-zeno-brand)] focus-visible:outline-none focus-visible:shadow-focus"
          href="/app/publishes"
          onClick={onClose}
        >
          View all publishes
        </Link>
      </div>

      <button
        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-bold text-text-muted transition hover:bg-surface-raised hover:text-[var(--color-zeno-brand)] focus-visible:outline-none focus-visible:shadow-focus"
        onClick={onLogout}
        type="button"
      >
        <LogOut className="size-4" />
        Log out
      </button>
    </div>
  );
}

function formatPublishTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Published";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(date);
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

function ExternalNavItem({ href, label }: { href: string; label: string }): React.ReactElement {
  return (
    <a
      aria-label={label}
      className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-raised hover:text-[var(--color-zeno-brand)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgb(235_75_41_/_0.18)]"
      href={href}
      target="_blank"
      rel="noreferrer"
      title={label}
    >
      <Github className="size-4" />
      <span className="hidden lg:inline">{label === "Site repo" ? "Site" : "Package"}</span>
    </a>
  );
}
