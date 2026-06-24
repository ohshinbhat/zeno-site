import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <main className="site-content route-loader flex-col gap-4 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">404</p>
      <h1 className="font-display text-2xl font-semibold text-text">Page not found</h1>
      <Link
        className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text transition hover:bg-surface-raised focus-visible:outline-none focus-visible:shadow-focus"
        href="/"
      >
        Back to home
      </Link>
    </main>
  );
}
