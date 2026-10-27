// Simple bar chart of meals rescued per week. Plain divs keep it light and
// responsive; a hidden table carries the same numbers for screen readers.
export default function WeeklyChart({ series, highlight }) {
  const max = Math.max(...series.map((w) => w.meals));

  return (
    <figure>
      <div className="flex items-end gap-1.5 sm:gap-2.5 h-48" aria-hidden="true">
        {series.map((w, i) => {
          const current = w.week === highlight;
          return (
            <div key={w.week} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 group">
              <span className={`text-[11px] nums ${current ? "text-leaf font-semibold" : "text-charcoal-soft opacity-0 group-hover:opacity-100 sm:opacity-100"} transition-opacity`}>
                {w.meals}
              </span>
              <div
                className={`w-full rounded-t-[3px] transition-[height] duration-500 ${current ? "bg-leaf" : "bg-sage/45 group-hover:bg-sage/70"}`}
                style={{ height: `${(w.meals / max) * 100}%` }}
              />
              <span className={`text-[10px] text-charcoal-soft whitespace-nowrap ${i % 2 && !current ? "invisible sm:visible" : ""}`}>
                {w.week}
              </span>
            </div>
          );
        })}
      </div>
      <figcaption className="sr-only">Meals rescued per week</figcaption>
      <table className="sr-only">
        <thead>
          <tr>
            <th>Week starting</th>
            <th>Meals rescued</th>
          </tr>
        </thead>
        <tbody>
          {series.map((w) => (
            <tr key={w.week}>
              <td>{w.week}</td>
              <td>{w.meals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
