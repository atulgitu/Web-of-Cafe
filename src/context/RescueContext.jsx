import { useMemo } from "react";
import usePersistentState from "../hooks/usePersistentState";
import { DEMO_DAY } from "../data/site";
import { getPartner } from "../data/partners";
import { initialListings } from "../data/rescue";
import { activityFeed, computeImpact, todaySummary } from "../lib/impact";
import { RescueContext } from "./contexts";

const STORAGE_KEY = "brewcare_rescue_v1";
const STEP_MINUTES = 6; // each demo action moves the clock forward a little

const freshState = () => ({
  listings: initialListings,
  clock: DEMO_DAY.startMinutes,
  donations: { count: 0, amount: 0 },
});

export function RescueProvider({ children }) {
  const [state, setState] = usePersistentState(STORAGE_KEY, freshState);
  const { listings, clock, donations } = state;

  // Apply a change to one listing and stamp it on that listing's timeline.
  const act = (id, change, describe) =>
    setState((s) => {
      const at = s.clock + STEP_MINUTES;
      return {
        ...s,
        clock: at,
        listings: s.listings.map((l) => {
          if (l.id !== id) return l;
          const next = { ...l, ...change };
          return { ...next, timeline: [...l.timeline, { at, text: describe(next) }] };
        }),
      };
    });

  const createListing = (data) => {
    const id = `r${Date.now()}`;
    setState((s) => {
      const at = s.clock + STEP_MINUTES;
      const listing = {
        ...data,
        id,
        status: "available",
        partnerId: null,
        timeline: [{ at, text: `${data.portions} ${data.item.toLowerCase()} marked as surplus` }],
      };
      return { ...s, clock: at, listings: [listing, ...s.listings] };
    });
    return id;
  };

  const reserveListing = (id, partnerId) =>
    act(id, { status: "reserved", partnerId }, (l) => `${getPartner(partnerId).name} reserved ${l.portions} portions of ${l.item.toLowerCase()}`);

  const cancelReservation = (id) =>
    act(id, { status: "available", partnerId: null }, (l) => `Reservation released — ${l.item.toLowerCase()} available again`);

  const markCollected = (id) =>
    act(id, { status: "collected" }, (l) => `Pickup completed — ${l.portions} portions collected by ${getPartner(l.partnerId).name}`);

  const recordDonation = (amount) =>
    setState((s) => ({ ...s, donations: { count: s.donations.count + 1, amount: s.donations.amount + amount } }));

  const resetDemo = () => setState(freshState());

  const derived = useMemo(
    () => ({
      today: todaySummary(listings),
      impact: computeImpact(listings, donations),
      activity: activityFeed(listings),
    }),
    [listings, donations]
  );

  return (
    <RescueContext.Provider
      value={{
        listings,
        clock,
        donations,
        ...derived,
        createListing,
        reserveListing,
        cancelReservation,
        markCollected,
        recordDonation,
        resetDemo,
      }}
    >
      {children}
    </RescueContext.Provider>
  );
}
