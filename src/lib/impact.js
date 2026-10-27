import { ASSUMPTIONS } from "../data/site";
import { partners } from "../data/partners";
import { baselineContributions, CURRENT_WEEK, octoberWeeks, pickupLog, weeklyHistory } from "../data/rescue";

const sum = (xs, key) => xs.reduce((s, x) => s + x[key], 0);

export const listingKg = (l) => l.portions * l.kgPerPortion;

// Today's activity on the rescue board.
export function todaySummary(listings) {
  const by = (status) => listings.filter((l) => l.status === status);
  const reserved = by("reserved");
  const upcoming = [...reserved].sort((a, b) => a.pickupStart - b.pickupStart)[0];
  return {
    available: sum(by("available"), "portions"),
    availableListings: by("available").length,
    reserved: sum(reserved, "portions"),
    rescued: sum(by("collected"), "portions"),
    nextPickup: upcoming ? upcoming.pickupStart : null,
  };
}

// Weekly series from pilot start to today, including live demo actions.
export function weeklySeries(listings) {
  const collectedToday = listings.filter((l) => l.status === "collected");
  const fromLog = (week) => pickupLog.filter((p) => p.week === week);

  const loggedWeeks = [...new Set(pickupLog.map((p) => p.week))].reverse();
  const logged = loggedWeeks.map((week) => {
    const rows = fromLog(week);
    const extra = week === CURRENT_WEEK ? collectedToday : [];
    return {
      week,
      meals: sum(rows, "portions") + sum(extra, "portions"),
      kg: sum(rows, "kg") + extra.reduce((s, l) => s + listingKg(l), 0),
      pickups: rows.length + extra.length,
    };
  });

  return [...weeklyHistory, ...logged];
}

export function computeImpact(listings, donations) {
  const series = weeklySeries(listings);
  const totals = (rows) => ({
    meals: sum(rows, "meals"),
    kg: sum(rows, "kg"),
    pickups: sum(rows, "pickups"),
  });
  const allTime = totals(series);
  const contributions = {
    count: baselineContributions.count + donations.count,
    amount: baselineContributions.amount + donations.amount,
  };

  return {
    series,
    week: totals(series.filter((w) => w.week === CURRENT_WEEK)),
    month: totals(series.filter((w) => octoberWeeks.includes(w.week))),
    allTime,
    co2: allTime.kg * ASSUMPTIONS.co2PerKg,
    contributions,
    mealsFunded: Math.floor(contributions.amount / ASSUMPTIONS.mealCost),
    activePartners: partners.length,
  };
}

// Today's timeline across all listings, newest first.
export function activityFeed(listings) {
  return listings
    .flatMap((l) => l.timeline.map((e, i) => ({ ...e, id: `${l.id}-${i}`, listingId: l.id })))
    .sort((a, b) => b.at - a.at);
}

// How many community meals a contribution roughly pays for.
export const mealsFromAmount = (amount) => amount / ASSUMPTIONS.mealCost;

export function contributionNote(amount) {
  if (amount <= 0) return null;
  const meals = Math.floor(mealsFromAmount(amount));
  if (meals >= 1) return `Could cover about ${meals} community ${meals === 1 ? "meal" : "meals"}.`;
  return `Covers part of a community meal (about ₹${ASSUMPTIONS.mealCost} each).`;
}
