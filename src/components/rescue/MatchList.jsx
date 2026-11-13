import { useState } from "react";
import useApi from "../../hooks/useApi";
import { useToast } from "../../hooks/useAppContext";
import useOnline from "../../hooks/useOnline";
import { api } from "../../lib/api";
import { btn } from "../../lib/styles";
import { Skeleton } from "../ui";

// Ranked partner suggestions for one listing, scored by the server
// (GET /api/rescue/:id/matches — see server/src/services/matchingService.js).
export default function MatchList({ listing, onAssigned }) {
  const { data, error, loading } = useApi(`/rescue/${listing.id}/matches`);
  const { showToast } = useToast();
  const online = useOnline();
  const [busy, setBusy] = useState(false);

  const assign = async (match) => {
    setBusy(true);
    try {
      await api(`/rescue/${listing.id}/reserve`, { method: "POST", body: { partnerId: match.partnerId } });
      showToast(`Pickup arranged with ${match.partnerName}`);
      onAssigned?.();
    } catch (err) {
      showToast(err.message || "We couldn't arrange this pickup. Please try again.", "error");
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Finding partners">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (error) return <p className="text-sm text-red-700">We couldn't load partner suggestions. {error.message}</p>;

  const [best, ...rest] = data.matches;
  if (!best?.eligible) {
    return (
      <p className="text-sm text-charcoal-soft">
        No partner can collect this in time. Try widening the pickup window, or use it for the staff meal.
      </p>
    );
  }

  return (
    <div>
      <div className="rounded-lg bg-leaf-soft/70 border border-leaf/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-leaf">Suggested partner</p>
            <p className="font-medium text-espresso mt-1">{best.partnerName}</p>
          </div>
          <div className="text-right shrink-0">
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
        <button type="button" disabled={busy || !online} onClick={() => assign(best)} className={`${btn.leaf} mt-4 w-full sm:w-auto`}>
          Arrange pickup with {best.partnerName.split(" ")[0]}
        </button>
      </div>

      {rest.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-sm text-charcoal-soft hover:text-espresso list-none flex items-center gap-1 min-h-8">
            <span className="group-open:rotate-90 transition-transform" aria-hidden="true">›</span>
            Other partners ({rest.length})
          </summary>
          <ul className="mt-2 divide-y divide-line border border-line rounded-lg bg-paper">
            {rest.map((m) => (
              <li key={m.partnerId} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${m.eligible ? "text-espresso" : "text-charcoal-soft"}`}>{m.partnerName}</p>
                  <p className="text-xs text-charcoal-soft">{m.eligible ? m.reasons.slice(0, 3).join(" · ") : m.blockers[0]}</p>
                </div>
                {m.eligible ? (
                  <button type="button" disabled={busy || !online} onClick={() => assign(m)} className={`${btn.small} shrink-0`}>
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
      <p className="text-[11px] text-charcoal-soft mt-3">How the score works: quantity needed 40%, collection window 25%, distance 20%, urgency 15%.</p>
    </div>
  );
}
