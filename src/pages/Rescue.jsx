import { useState } from "react";
import { Link } from "react-router-dom";
import ActivityFeed from "../components/rescue/ActivityFeed";
import ListingCard from "../components/rescue/ListingCard";
import MatchList from "../components/rescue/MatchList";
import { DemoNote, EmptyState, PageHeader, Stat } from "../components/ui";
import { getPartner } from "../data/partners";
import { DEMO_DAY, DEMO_PARTNER_ID } from "../data/site";
import { useRescue, useRole, useToast } from "../hooks/useAppContext";
import { formatTime } from "../lib/format";
import { btn, container } from "../lib/styles";

const filters = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "reserved", label: "Reserved" },
  { id: "collected", label: "Collected" },
];

const statusOrder = { available: 0, reserved: 1, collected: 2 };

export default function Rescue() {
  const { listings, clock, today, activity, reserveListing, cancelReservation, markCollected, resetDemo } = useRescue();
  const { role } = useRole();
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");
  const [matchingId, setMatchingId] = useState(null);
  const me = getPartner(DEMO_PARTNER_ID);

  const shown = listings
    .filter((l) => filter === "all" || l.status === filter)
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.pickupStart - b.pickupStart);
  const count = (id) => (id === "all" ? listings.length : listings.filter((l) => l.status === id).length);

  const actionsFor = (l) => {
    if (role === "partner") {
      if (l.status === "available") {
        const blocked = !l.veg && me.vegOnly;
        return (
          <button
            type="button"
            disabled={blocked}
            onClick={() => {
              reserveListing(l.id, me.id);
              showToast(`Reserved — pick up from ${formatTime(l.pickupStart)}`);
            }}
            className={btn.leaf}
          >
            Reserve for {me.name.split(" ")[0]}
          </button>
        );
      }
      if (l.status === "reserved" && l.partnerId === me.id) {
        return (
          <>
            <button type="button" onClick={() => { markCollected(l.id); showToast("Marked as collected — thank you"); }} className={btn.primary}>
              Mark collected
            </button>
            <button type="button" onClick={() => cancelReservation(l.id)} className={btn.small}>
              Release
            </button>
          </>
        );
      }
      return null;
    }
    if (role === "staff") {
      if (l.status === "available") {
        return (
          <button type="button" aria-expanded={matchingId === l.id} onClick={() => setMatchingId(matchingId === l.id ? null : l.id)} className={btn.small}>
            {matchingId === l.id ? "Hide suggestions" : "Find a partner"}
          </button>
        );
      }
      if (l.status === "reserved") {
        return (
          <button type="button" onClick={() => { markCollected(l.id); showToast("Pickup confirmed"); }} className={btn.small}>
            Confirm pickup
          </button>
        );
      }
    }
    return null;
  };

  return (
    <div className={`${container} py-10`}>
      <PageHeader
        eyebrow={`Rescue board · ${DEMO_DAY.label}`}
        title="Today's surplus, and where it's going."
        aside={
          <p className="text-sm text-charcoal-soft sm:text-right">
            Demo clock <span className="font-medium text-espresso nums">{formatTime(clock)}</span>
          </p>
        }
      >
        When the kitchen has food it won't sell, it goes on this board with a pickup window and a best-before time. Community
        partners reserve what they can use and collect it from our back counter.
      </PageHeader>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 border-y border-line py-5 mb-10">
        <Stat label="Portions available" value={today.available} tone="leaf" />
        <Stat label="Reserved" value={today.reserved} />
        <Stat label="Rescued today" value={today.rescued} />
        <Stat label="Next pickup" value={today.nextPickup ? formatTime(today.nextPickup) : "None booked"} />
      </dl>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10">
        <div>
          <div className="flex gap-2 overflow-x-auto scroll-thin pb-1 mb-5" role="group" aria-label="Filter listings">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                  filter === f.id ? "bg-espresso text-cream border-espresso" : "border-line bg-paper text-charcoal-soft hover:text-espresso"
                }`}
              >
                {f.label} <span className="nums opacity-70">{count(f.id)}</span>
              </button>
            ))}
          </div>

          {role === "customer" && (
            <p className="text-sm text-charcoal-soft mb-5 leading-relaxed">
              These listings are for our registered partners, so there's nothing to reserve as a customer.{" "}
              <Link to="/cart" className="text-caramel-dark underline underline-offset-2">
                You can add a community meal contribution at checkout
              </Link>
              , or use the demo switch in the menu bar to see the partner and staff views.
            </p>
          )}

          {shown.length === 0 ? (
            <EmptyState title="Nothing here right now.">
              {filter === "available"
                ? "Everything listed today has been reserved. New surplus usually appears after the lunch and evening rush."
                : "Try another filter."}
            </EmptyState>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {shown.map((l) => (
                <div key={l.id} className={matchingId === l.id ? "md:col-span-2" : ""}>
                  <ListingCard listing={l} now={clock}>
                    {actionsFor(l)}
                  </ListingCard>
                  {role === "staff" && matchingId === l.id && l.status === "available" && (
                    <div className="mt-2 border border-line rounded-xl p-4 bg-paper animate-fade-in">
                      <MatchList listing={l} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="font-medium text-espresso mb-4">
              Today's activity
            </h2>
            <ActivityFeed events={activity} limit={8} />
          </section>
          <section className="border-t border-line pt-6 space-y-3">
            <DemoNote>
              Listings and partners are demo data. Actions move a simulated clock forward so the timeline stays readable.
            </DemoNote>
            <button
              type="button"
              onClick={() => {
                resetDemo();
                showToast("Demo data reset");
              }}
              className={btn.small}
            >
              Reset demo data
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

