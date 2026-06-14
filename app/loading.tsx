export default function Loading(): React.ReactElement {
  return (
    <section className="route-loader">
      <span className="inline-flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold shadow-elevated">
        <span className="route-spinner" aria-hidden="true" />
        Loading
      </span>
    </section>
  );
}
