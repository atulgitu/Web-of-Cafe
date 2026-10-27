import { useState } from "react";
import ListingCard from "../components/rescue/ListingCard";
import RoleGate from "../components/RoleGate";
import { DemoNote, EmptyState, PageHeader, Stat } from "../components/ui";
import { getPartner } from "../data/partners";
import { pickupLog } from "../data/rescue";
import { CAFE, DEMO_DAY, DEMO_PARTNER_ID } from "../data/site";
import { useRescue, useToast } from "../hooks/useAppContext";
import { formatTime, formatWindow } from "../lib/format";
import { partnerLoad } from "../lib/matching";
import { btn, container } from "../lib/styles";

export default function Partner() {
  return (
    <RoleGate role="partner" why="It's where a community kitchen or shelter reserves surplus food and confirms pickups.">
      <PartnerDashboard />
    </RoleGate>
  );
}

function PartnerDashboard() {
  const { listings, clock, reserveListing, cancelReservation, markCollected } = useRescue();
  const { showToast } = useToast();
  const me = getPartner(DEMO_PARTNER_ID);
  const [confirming, setConfirming] = useState(null);

  const available = listings.filter((l) => l.status === "available").sort((a, b) => a.pickupStart - b.pickupStart);
  const mine = listings.filter((l) => l.partnerId === me.id);
  const upcoming = mine.filter((l) => l.status === "reserved").sort((a, b) => a.pickupStart - b.pickupStart);
  const collectedToday = mine.filter((l) => l.status === "collected");

  const load = partnerLoad(me.id, listings);
  const stillNeeded = Math.max(0, me.needsToday - load);

  const history = [
    ...collectedToday.map((l) => ({ id: l.id, date: `Today, ${DEMO_DAY.short.split(" ").slice(1).join(" ")}`, item: l.item, portions: l.portions })),
    ...pickupLog.filter((p) => p.partnerId === me.id),
  ];
  const historyTotal = history.reduce((s, h) => s + h.portions, 0);

  const reserve = (l) => {
    reserveListing(l.id, me.id);
    showToast(`Reserved ${l.portions} — collect from ${formatTime(Math.max(l.pickupStart, me.window.start))}`);
  };

  return (
    <div className={`${container} py-10`}>
      <PageHeader eyebrow={`Community partner · ${me.type}`} title={me.name}>
        {me.area} · {me.distanceKm} km from the café · you usually collect {formatWindow(me.window.start, me.window.end)}
      </PageHeader>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 border-y border-line py-5 mb-12">
        <Stat label="Meals you planned for tonight" value={me.needsToday} />
        <Stat label="Reserved or collected" value={load} />
        <Stat label="Still looking for" value={stillNeeded} tone="leaf" />
        <Stat label="Received in the last 9 days" value={historyTotal} />
      </dl>

      <div className="grid lg:grid-cols-[1fr_340px] gap-12">
        <div className="space-y-14 min-w-0">
          <section aria-labelledby="avail-heading">
            <h2 id="avail-heading" className="font-serif-display text-2xl text-espresso mb-1">
              Available now
            </h2>
            <p className="text-sm text-charcoal-soft mb-5">From {CAFE.name}, Indiranagar. Reserve only what you can collect in the window.</p>
            {available.length === 0 ? (
              <EmptyState title="Nothing available right now.">
                New listings usually appear after 3 PM and again after 7 PM. We'll show them here as soon as they're posted.
              </EmptyState>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {available.map((l) => {
                  const unsuitable = !l.veg && me.vegOnly;
                  return (
                    <ListingCard key={l.id} listing={l} now={clock}>
                      {confirming === l.id ? (
                        <>
                          <span className="text-sm text-charcoal w-full">
                            Reserve all {l.portions} and collect by {formatTime(Math.min(l.pickupEnd, l.bestBefore))}?
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              reserve(l);
                              setConfirming(null);
                            }}
                            className={btn.leaf}
                          >
                            Yes, reserve
                          </button>
                          <button type="button" onClick={() => setConfirming(null)} className={btn.small}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button type="button" disabled={unsuitable} onClick={() => setConfirming(l.id)} className={btn.leaf}>
                          {unsuitable ? "Not vegetarian" : "Reserve"}
                        </button>
                      )}
                    </ListingCard>
                  );
                })}
              </div>
            )}
          </section>

          <section aria-labelledby="mine-heading">
            <h2 id="mine-heading" className="font-serif-display text-2xl text-espresso mb-5">
              Your pickups today
            </h2>
            {upcoming.length === 0 && collectedToday.length === 0 ? (
              <p className="text-sm text-charcoal-soft">Nothing reserved yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {[...upcoming, ...collectedToday].map((l) => (
                  <ListingCard key={l.id} listing={l} now={clock}>
                    {l.status === "reserved" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            markCollected(l.id);
                            showToast("Marked as collected — thank you");
                          }}
                          className={btn.primary}
                        >
                          Mark collected
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            cancelReservation(l.id);
                            showToast("Released — it's back on the board");
                          }}
                          className={btn.small}
                        >
                          Can't make it
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-leaf">Collected — saved from going to waste.</span>
                    )}
                  </ListingCard>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-10">
          <section className="border border-line rounded-xl bg-paper p-5">
            <h2 className="font-medium text-espresso">Pickup details</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-charcoal-soft">Where</dt>
                <dd className="text-charcoal">{CAFE.pickupPoint}</dd>
              </div>
              <div>
                <dt className="text-xs text-charcoal-soft">Ask for</dt>
                <dd className="text-charcoal">Whoever's on the evening shift — food is bagged and labelled with your name.</dd>
              </div>
              <div>
                <dt className="text-xs text-charcoal-soft">Café phone</dt>
                <dd className="text-charcoal">{CAFE.phone}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="font-medium text-espresso mb-3">
              Previous pickups
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {history.map((h) => (
                <li key={h.id} className="flex justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block text-charcoal truncate">{h.item}</span>
                    <span className="block text-xs text-charcoal-soft">{h.date}</span>
                  </span>
                  <span className="text-charcoal-soft nums shrink-0">{h.portions}</span>
                </li>
              ))}
            </ul>
          </section>

          <DemoNote>You're signed in as a demo partner. Partner accounts, notifications and SMS reminders aren't built yet.</DemoNote>
        </aside>
      </div>
    </div>
  );
}
