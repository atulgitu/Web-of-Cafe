import { partners } from "../../data/partners";
import { useRescue, useToast } from "../../hooks/useAppContext";
import { rankPartners } from "../../lib/matching";
import { btn } from "../../lib/styles";

// Ranked partner suggestions for one available listing.
export default function MatchList({ listing }) {
  const { listings, clock, reserveListing } = useRescue();
  const { showToast } = useToast();
  const ranked = rankPartners(listing, partners, { now: clock, listings });
  const [best, ...rest] = ranked;

  const assign = (match) => {
    reserveListing(listing.id, match.partner.id);
    showToast(`Pickup arranged with ${match.partner.name}`);
  };

  if (!best?.eligible) {
    return (
      <p className="text-sm text-charcoal-soft">
        No partner can collect this in time. Consider moving it to the café's staff meal or adjusting the pickup window.
      </p>
    );
  }

  return (
    <div>
      <div className="rounded-lg bg-leaf-soft/70 border border-leaf/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-leaf">Suggested partner</p>
            <p className="font-medium text-espresso mt-1">{best.partner.name}</p>
            <p className="text-xs text-charcoal-soft">{best.partner.type} · {best.partner.area}</p>
          </div>
          <div className="text-right">
            <p className="font-serif-display text-2xl text-leaf nums">{best.score}%</p>
            <p className="text-[11px] text-charcoal-soft">match score</p>
          </div>
        </div>
        <ul className="mt-3 space-y-1 text-sm text-charcoal">
          {best.reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-leaf" aria-hidden="true">✓</span>
              {r}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => assign(best)} className={`${btn.leaf} mt-4 w-full sm:w-auto`}>
          Arrange pickup with {best.partner.name.split(" ")[0]}
        </button>
      </div>

      {rest.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-sm text-charcoal-soft hover:text-espresso list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform" aria-hidden="true">›</span>
            Other partners ({rest.length})
          </summary>
          <ul className="mt-2 divide-y divide-line border border-line rounded-lg bg-paper">
            {rest.map((m) => (
              <li key={m.partner.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${m.eligible ? "text-espresso" : "text-charcoal-soft"}`}>{m.partner.name}</p>
                  <p className="text-xs text-charcoal-soft truncate">{m.eligible ? m.reasons.join(" · ") : m.blockers[0]}</p>
                </div>
                {m.eligible ? (
                  <button type="button" onClick={() => assign(m)} className={`${btn.small} shrink-0`}>
                    {m.score}% · Assign
                  </button>
                ) : (
                  <span className="text-xs text-charcoal-soft shrink-0">Not suitable</span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
