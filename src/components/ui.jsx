// Small presentational pieces reused across pages.

export function Eyebrow({ children, className = "" }) {
  return (
    <p className={`text-xs font-semibold tracking-[0.14em] uppercase text-caramel-dark ${className}`}>{children}</p>
  );
}

export function PageHeader({ eyebrow, title, children, aside }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h1 className="font-serif-display text-3xl sm:text-4xl text-espresso leading-tight">{title}</h1>
        {children && <div className="mt-2 text-charcoal-soft leading-relaxed">{children}</div>}
      </div>
      {aside}
    </header>
  );
}

const statusStyles = {
  available: { label: "Available", cls: "bg-leaf-soft text-leaf", dot: "bg-leaf" },
  // espresso-light text: caramel-dark on this tint was only 4.3:1, below the 4.5:1 AA minimum
  reserved: { label: "Reserved", cls: "bg-[#F6E7D6] text-espresso-light", dot: "bg-caramel" },
  expired: { label: "Past best-before", cls: "bg-cream-dim text-charcoal-soft", dot: "bg-charcoal-soft/60" },
  collected: { label: "Collected", cls: "bg-cream-dim text-charcoal-soft", dot: "bg-charcoal-soft/60" },
};

export function StatusBadge({ status }) {
  const s = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

const tagTones = {
  caramel: "border-caramel/40 text-caramel-dark",
  leaf: "border-leaf/30 text-leaf bg-leaf-soft/60",
  neutral: "border-line text-charcoal-soft",
};

export function Tag({ children, tone = "neutral" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 ${tagTones[tone]}`}>
      {children}
    </span>
  );
}

// Indian-style veg / non-veg mark.
export function VegMark({ veg, className = "" }) {
  const label = veg ? "Vegetarian" : "Non-vegetarian";
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-flex w-3.5 h-3.5 shrink-0 border-[1.5px] rounded-[3px] items-center justify-center bg-paper ${
        veg ? "border-leaf" : "border-red-700"
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${veg ? "bg-leaf" : "bg-red-700"}`} />
    </span>
  );
}

export function QuantityStepper({ value, onChange, min = 1, max = 50, label = "Quantity", size = "md" }) {
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  return (
    <div className="inline-flex items-center border border-line rounded-full bg-paper" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min && min > 0}
        className={`${dim} flex items-center justify-center text-lg text-charcoal-soft hover:text-espresso disabled:opacity-40`}
        aria-label={value <= 1 && min === 0 ? "Remove item" : "Decrease quantity"}
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-medium nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={`${dim} flex items-center justify-center text-lg text-charcoal-soft hover:text-espresso disabled:opacity-40`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="border border-dashed border-line rounded-xl px-6 py-12 text-center">
      <p className="font-serif-display text-xl text-espresso">{title}</p>
      {children && <p className="text-sm text-charcoal-soft mt-2 max-w-sm mx-auto leading-relaxed">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`bg-cream-dim rounded-md animate-pulse-soft ${className}`} aria-hidden="true" />;
}

export function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// A quiet, consistent marker for sample data or simplified features.
export function Note({ children, className = "", label = "Note" }) {
  return (
    <p className={`flex gap-2 text-xs text-charcoal-soft leading-relaxed ${className}`}>
      <span className="shrink-0 self-start rounded border border-line bg-paper px-1.5 py-px font-semibold tracking-wide uppercase text-[10px] text-charcoal-soft">
        {label}
      </span>
      <span>{children}</span>
    </p>
  );
}

export function SummaryRow({ label, value, tone, strong }) {
  return (
    <div
      className={`flex justify-between gap-4 ${strong ? "font-semibold text-espresso text-base pt-2 border-t border-line" : ""} ${
        tone === "leaf" ? "text-leaf" : strong ? "" : "text-charcoal-soft"
      }`}
    >
      <dt>{label}</dt>
      <dd className="nums">{value}</dd>
    </div>
  );
}

// A labelled figure inside a <dl>. Label comes first in the DOM, number shows first.
export function Stat({ label, value, tone }) {
  return (
    <div className="flex flex-col-reverse justify-end">
      <dt className="text-xs text-charcoal-soft mt-1">{label}</dt>
      <dd className={`font-serif-display text-2xl sm:text-3xl nums ${tone === "leaf" ? "text-leaf" : "text-espresso"}`}>{value}</dd>
    </div>
  );
}

// Shown when a request fails. `onRetry` re-runs it.
export function ErrorState({ title = "We couldn't load this.", error, onRetry }) {
  return (
    <div role="alert" className="border border-red-200 bg-red-50/50 rounded-xl px-5 py-6 text-center">
      <p className="font-medium text-red-800">{title}</p>
      {error?.message && <p className="text-sm text-red-800/80 mt-1">{error.message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 inline-flex rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100">
          Try again
        </button>
      )}
    </div>
  );
}
