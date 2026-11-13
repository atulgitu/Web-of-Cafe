import { useState } from "react";
import ListingCard from "../components/rescue/ListingCard";
import RoleGate from "../components/RoleGate";
import { Note, EmptyState, ErrorState, Skeleton, Spinner, Stat } from "../components/ui";
import { CAFE } from "../data/site";
import useApi from "../hooks/useApi";
import { useToast } from "../hooks/useAppContext";
import useOnline from "../hooks/useOnline";
import { api } from "../lib/api";
import { formatDate, formatTime } from "../lib/format";
import { btn, container } from "../lib/styles";

const clock = (minutes) => formatTime(new Date(new Date().setHours(0, minutes, 0, 0)));

export default function Partner() {
  return (
    <RoleGate role="PARTNER" why="It's where a community kitchen or shelter reserves surplus food and confirms pickups.">
      <PartnerDashboard />
    </RoleGate>
  );
}

// Designed for a volunteer on a phone: what's available → reserve → pickup details → mark collected.
function PartnerDashboard() {
  const me = useApi("/partners/me");
  const board = useApi("/rescue");
  const { showToast } = useToast();
  const online = useOnline();
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(null);

  const refresh = () => {
    me.reload();
    board.reload();
  };

  const act = async (id, path, success) => {
    setBusy(id);
    try {
      await api(`/rescue/${id}/${path}`, { method: "POST" });
      showToast(success);
      setConfirming(null);
      refresh();
    } catch (err) {
      showToast(err.message || "We couldn't update this pickup. Please try again.", "error");
    } finally {
      setBusy(null);
    }
  };

  if (me.error && !me.data) {
    return (
      <div className={`${container} py-10`}>
        <ErrorState title="We couldn't load your pickups." error={me.error} onRetry={refresh} />
      </div>
    );
  }
  if (!me.data || !board.data) {
    return (
      <div className={`${container} py-10 space-y-4`} aria-busy="true">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </div>
    );
  }

  const { partner, today, history } = me.data;
  const available = board.data.listings.filter((l) => l.status === "available");
  const mine = board.data.listings.filter((l) => l.partnerId === partner.id && l.status === "reserved");

  return (
    <div className={`${container} py-8 sm:py-10`}>
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-caramel-dark">{partner.type}</p>
      <h1 className="font-serif-display text-3xl sm:text-4xl text-espresso mt-2">{partner.name}</h1>
      <p className="text-charcoal-soft mt-1">
        {partner.area} · ~{partner.distanceKm} km from the café · you usually collect {clock(partner.windowStart)}–{clock(partner.windowEnd)}
        {partner.vegOnly && " · vegetarian only"}
      </p>

      <dl className="grid grid-cols-3 gap-x-6 gap-y-5 border-y border-line py-5 my-8">
        <Stat label="Planned for today" value={partner.needsPerDay} />
        <Stat label="Reserved or collected" value={today.loadToday} />
        <Stat label="Still looking for" value={today.stillNeeded} tone="leaf" />
      </dl>

      <div className="grid lg:grid-cols-[1fr_340px] gap-12">
        <div className="space-y-12 min-w-0">
          {mine.length > 0 && (
            <section aria-labelledby="mine-heading">
              <h2 id="mine-heading" className="font-serif-display text-2xl text-espresso mb-4">
                Your pickups
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {mine.map((l) => (
                  <ListingCard key={l.id} listing={l}>
                    <button
                      type="button"
                      disabled={busy === l.id || !online}
                      onClick={() => act(l.id, "complete", "Marked as collected — saved from going to waste")}
                      className={`${btn.primary} flex-1 sm:flex-none`}
                    >
                      {busy === l.id && <Spinner />} Mark collected
                    </button>
                    <button type="button" disabled={busy === l.id || !online} onClick={() => act(l.id, "release", "Released — it's back on the board")} className={btn.small}>
                      Can't make it
                    </button>
                  </ListingCard>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="avail-heading">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 id="avail-heading" className="font-serif-display text-2xl text-espresso">
                Available now
              </h2>
              <button type="button" onClick={refresh} className="text-sm text-charcoal-soft hover:text-espresso min-h-10 px-2">
                Refresh
              </button>
            </div>
            {available.length === 0 ? (
              <EmptyState title="Nothing available right now.">
                New food is usually listed after the lunch rush and again in the evening. Refresh to check.
              </EmptyState>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {available.map((l) => {
                  const unsuitable = !l.veg && partner.vegOnly;
                  return (
                    <ListingCard key={l.id} listing={l}>
                      {confirming === l.id ? (
                        <>
                          <span className="text-sm text-charcoal w-full">
                            Reserve all {l.portions} and collect by {formatTime(l.pickupEnd)}?
                          </span>
                          <button type="button" disabled={busy === l.id || !online} onClick={() => act(l.id, "reserve", `Reserved — collect from ${formatTime(l.pickupStart)}`)} className={btn.leaf}>
                            {busy === l.id && <Spinner />} Yes, reserve
                          </button>
                          <button type="button" onClick={() => setConfirming(null)} className={btn.small}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button type="button" disabled={unsuitable || !online} onClick={() => setConfirming(l.id)} className={`${btn.leaf} w-full sm:w-auto`}>
                          {unsuitable ? "Not vegetarian" : `Reserve ${l.portions}`}
                        </button>
                      )}
                    </ListingCard>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-10">
          <section className="border border-line rounded-xl bg-paper p-5" aria-labelledby="details-heading">
            <h2 id="details-heading" className="font-medium text-espresso">
              Pickup details
            </h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-charcoal-soft">Where</dt>
                <dd className="text-charcoal">
                  {CAFE.address}
                  <br />
                  {CAFE.pickupPoint}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-charcoal-soft">Ask for</dt>
                <dd className="text-charcoal">Whoever's on shift — food is bagged and labelled with your organisation's name.</dd>
              </div>
              <div>
                <dt className="text-xs text-charcoal-soft">Café phone</dt>
                <dd>
                  <a href={`tel:${CAFE.phone.replace(/\s/g, "")}`} className="text-caramel-dark underline underline-offset-2">
                    {CAFE.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="font-medium text-espresso mb-3">
              Previous pickups
            </h2>
            {history.length === 0 ? (
              <p className="text-sm text-charcoal-soft">Completed pickups will show up here.</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {history.slice(0, 12).map((h) => (
                  <li key={h.id} className="flex justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className="block text-charcoal truncate">{h.item}</span>
                      <span className="block text-xs text-charcoal-soft">{formatDate(h.completedAt)}</span>
                    </span>
                    <span className="text-charcoal-soft nums shrink-0">{h.portions}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Note>Partner organisations on this site are sample data. Text alerts for new listings aren't built yet; check this page after the lunch and evening rush.</Note>
        </aside>
      </div>
    </div>
  );
}
