// Meals rescued per week. Plain divs keep it light and responsive; a hidden
// table carries the same numbers for screen readers.
const label = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function WeeklyChart({ series }) {
  if (!series.length) return <p className="text-sm text-charcoal-soft">No pickups have been completed yet, so there is nothing to chart.</p>;
  const max = Math.max(1, ...series.map((w) => w.meals)); // at least 1, so an all-zero chart can't divide by zero
  const current = series[series.length - 1].week;
  // Phones show the last 8 weeks so every bar and date label fits without sideways scrolling.
  const firstOnPhone = Math.max(0, series.length - 8);

  return (
    <figure>
      <div className="flex items-end gap-1.5 sm:gap-2.5 h-48" aria-hidden="true">
        {series.map((w, i) => {
          const isCurrent = w.week === current;
          return (
            <div key={w.week} className={`flex-1 min-w-0 h-full flex-col justify-end items-center gap-1.5 ${i < firstOnPhone ? "hidden sm:flex" : "flex"}`}>
              <span className={`text-[11px] nums ${isCurrent ? "text-leaf font-semibold" : "text-charcoal-soft hidden sm:block"}`}>{w.meals}</span>
              <div
                className={`w-full rounded-t-[3px] transition-[height] duration-500 ${isCurrent ? "bg-leaf" : "bg-sage/45"}`}
                style={{ height: `${(w.meals / max) * 100}%` }}
              />
              <span className={`text-[10px] text-charcoal-soft whitespace-nowrap ${(series.length - 1 - i) % 2 && !isCurrent ? "invisible sm:visible" : ""}`}>{label(w.week)}</span>
            </div>
          );
        })}
      </div>
      <figcaption className="text-xs text-charcoal-soft mt-3">Week starting Monday. On small screens only the last 8 weeks are shown. The highlighted bar is the most recent week with a pickup.</figcaption>
      <table className="sr-only">
        <caption>Meals rescued per week</caption>
        <thead>
          <tr>
            <th>Week starting</th>
            <th>Meals rescued</th>
          </tr>
        </thead>
        <tbody>
          {series.map((w) => (
            <tr key={w.week}>
              <td>{label(w.week)}</td>
              <td>{w.meals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
