import { useState } from "react";
import { Link } from "react-router-dom";
import ActivityFeed from "../components/rescue/ActivityFeed";
import ListingCard from "../components/rescue/ListingCard";
import ListingForm from "../components/rescue/ListingForm";
import MatchList from "../components/rescue/MatchList";
import { EmptyState, ErrorState, PageHeader, Skeleton, Spinner, Stat } from "../components/ui";
import useApi from "../hooks/useApi";
import { useAuth, useToast } from "../hooks/useAppContext";
import useOnline from "../hooks/useOnline";
import { api } from "../lib/api";
import { formatTime } from "../lib/format";
import { btn, container } from "../lib/styles";

const howItWorks = [
  { title: "The kitchen lists it", text: "Staff post unsold food with the number of portions, a pickup window and a best-before time." },
  { title: "A partner reserves it", text: "A registered community partner reserves the whole listing. It is then held for them and nobody else can take it." },
  { title: "Pickup is confirmed", text: "They collect from the back counter. Once it is marked collected, the portions are added to the impact totals." },
];

const filters = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "reserved", label: "Reserved" },
  { id: "collected", label: "Collected" },
];

export default function Rescue() {
  const { data, error, loading, reload } = useApi("/rescue");
  const activity = useApi("/impact/activity?limit=8");
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");

  const refresh = () => {
    reload();
    activity.reload();
  };

  const listings = data?.listings ?? [];
  const shown = listings.filter((l) => filter === "all" || l.status === filter);
  const count = (id) => (id === "all" ? listings.length : listings.filter((l) => l.status === id).length);

  return (
    <div className={`${container} py-8 sm:py-10`}>
      <PageHeader eyebrow="Food rescue" title="Today's surplus, and where it's going.">
        When the kitchen has food it won't sell, it goes on this board with a pickup window and a best-before time. Community
        partners reserve what they can use and collect it from our back counter.
      </PageHeader>

      {data && (
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 border-y border-line py-5 mb-8">
          <Stat label="Portions available" value={data.summary.availablePortions} tone="leaf" />
          <Stat label="Reserved" value={data.summary.reservedPortions} />
          <Stat label="Rescued today" value={data.summary.rescuedToday} />
          <Stat label="Next pickup" value={data.summary.nextPickup ? formatTime(data.summary.nextPickup.at) : "None booked"} />
        </dl>
      )}

      {/* Who can do what, in order — the page used to assume you already knew. */}
      <section aria-labelledby="how-heading" className="mb-10">
        <h2 id="how-heading" className="font-medium text-espresso mb-3">
          How a rescue works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3 text-sm">
          {howItWorks.map((step, i) => (
            <li key={step.title} className="border-t-2 border-leaf/50 pt-3">
              <p className="font-medium text-espresso">
                <span className="text-leaf nums mr-1.5">{i + 1}.</span>
                {step.title}
              </p>
              <p className="text-charcoal-soft mt-1 leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10">
        <div className="min-w-0">
          <h2 className="font-medium text-espresso mb-3">Today's listings</h2>
          <div className="flex items-center gap-2 overflow-x-auto scroll-thin pb-1 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter listings">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`min-h-10 sm:min-h-9 px-4 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                  filter === f.id ? "bg-espresso text-cream border-espresso" : "border-line bg-paper text-charcoal-soft hover:text-espresso"
                }`}
              >
                {f.label} <span className="nums">{count(f.id)}</span>
              </button>
            ))}
            <button type="button" onClick={refresh} className="ml-auto text-sm text-charcoal-soft hover:text-espresso px-2 min-h-10 whitespace-nowrap">
              Refresh
            </button>
          </div>

          {(!user || user.role === "CUSTOMER") && (
            <p className="text-sm text-charcoal-soft mb-5 leading-relaxed">
              Only registered community partners (community kitchens, shelters and pantries) can reserve, so there's nothing to reserve as
              a customer.{" "}
              <Link to="/cart" className="text-caramel-dark underline underline-offset-2">
                You can add a meal contribution at checkout
              </Link>
              .
            </p>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-60 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <ErrorState title="We couldn't load the rescue board." error={error} onRetry={reload} />
          ) : shown.length === 0 ? (
            <EmptyState title={filter === "all" ? "Nothing to rescue right now." : `No ${filter} listings right now.`}>
              {filter === "all" || filter === "available"
                ? "That's a good sign: nothing is left over at the moment. The kitchen posts surplus after the lunch rush (around 2:30 PM) and the evening rush (around 6 PM)."
                : "Try another filter to see the rest of today's board."}
            </EmptyState>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {shown.map((l) => (
                <ListingWithActions key={l.id} listing={l} user={user} onChanged={refresh} />
              ))}
            </div>
          )}
        </div>

        <aside aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="font-medium text-espresso mb-4">
            Recent activity
          </h2>
          {activity.data ? <ActivityFeed events={activity.data.activity} /> : <Skeleton className="h-40" />}
        </aside>
      </div>
    </div>
  );
}

// The buttons differ by role; the server re-checks every action.
function ListingWithActions({ listing, user, onChanged }) {
  const { showToast } = useToast();
  const online = useOnline();
  const [mode, setMode] = useState(null); // "confirm" | "match" | "edit"
  const [busy, setBusy] = useState(false);

  const act = async (path, success) => {
    setBusy(true);
    try {
      await api(`/rescue/${listing.id}/${path}`, { method: "POST" });
      showToast(success);
      setMode(null);
      onChanged();
    } catch (err) {
      showToast(err.message || "That didn't work. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const isPartner = user?.role === "PARTNER";
  const isStaff = user?.role === "STAFF";
  const mine = isPartner && listing.partnerId === user.partnerId;
  const disabled = busy || !online;
  let actions = null;

  const expired = listing.status === "available" && new Date(listing.bestBefore) <= new Date();
  if (expired) {
    actions = null; // the card explains why
  } else if (isPartner && listing.status === "available") {
    actions =
      mode === "confirm" ? (
        <>
          <span className="text-sm text-charcoal w-full">Reserve all {listing.portions} and collect by {formatTime(listing.pickupEnd)}?</span>
          <button type="button" disabled={disabled} onClick={() => act("reserve", "Reserved — it's in your pickups")} className={btn.leaf}>
            {busy && <Spinner />} Yes, reserve
          </button>
          <button type="button" onClick={() => setMode(null)} className={btn.small}>
            Cancel
          </button>
        </>
      ) : (
        <button type="button" disabled={disabled} onClick={() => setMode("confirm")} className={`${btn.leaf} w-full sm:w-auto`}>
          Reserve
        </button>
      );
  } else if (mine && listing.status === "reserved") {
    actions = (
      <>
        <button type="button" disabled={disabled} onClick={() => act("complete", "Marked as collected — thank you")} className={btn.primary}>
          Mark collected
        </button>
        <button type="button" disabled={disabled} onClick={() => act("release", "Released — it's back on the board")} className={btn.small}>
          Can't make it
        </button>
      </>
    );
  } else if (isStaff && listing.status === "available") {
    actions = (
      <>
        <button type="button" aria-expanded={mode === "match"} onClick={() => setMode(mode === "match" ? null : "match")} className={btn.small}>
          {mode === "match" ? "Hide partners" : "Find a partner"}
        </button>
        <button type="button" aria-expanded={mode === "edit"} onClick={() => setMode(mode === "edit" ? null : "edit")} className={btn.small}>
          Edit
        </button>
      </>
    );
  } else if (isStaff && listing.status === "reserved") {
    actions = (
      <button type="button" disabled={disabled} onClick={() => act("complete", "Pickup confirmed")} className={btn.small}>
        Confirm pickup
      </button>
    );
  }

  return (
    <div className={mode === "match" || mode === "edit" ? "md:col-span-2" : ""}>
      <ListingCard listing={listing}>{actions}</ListingCard>
      {mode === "match" && (
        <div className="mt-2 border border-line rounded-xl p-4 bg-paper animate-fade-in">
          <MatchList listing={listing} onAssigned={onChanged} />
        </div>
      )}
      {mode === "edit" && (
        <div className="mt-2 border border-line rounded-xl p-4 bg-paper animate-fade-in">
          <ListingForm
            listing={listing}
            onSaved={() => {
              setMode(null);
              onChanged();
            }}
            onCancel={() => setMode(null)}
          />
        </div>
      )}
    </div>
  );
}
