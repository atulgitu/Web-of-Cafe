// Impact and operational summaries. Measured numbers come straight from the
// database; estimates are computed from them with the constants in ESTIMATES
// and returned under an `estimates` key so the UI can label them.
import { contributionTotals } from "../models/contributionModel.js";
import { activePartnerCount, recentActivity, rescueByPartner, rescueTotals, weeklyRescue } from "../models/impactModel.js";
import { listOrdersSince, orderStatsSince } from "../models/orderModel.js";
import { getPartner } from "../models/partnerModel.js";
import { listBoard } from "../models/rescueModel.js";
import { addDays, startOfDay, startOfMonth, startOfWeek } from "../utils/time.js";
import { ESTIMATES } from "./constants.js";
import { getForecast } from "./forecastRunner.js";

const PERIODS = {
  week: (now) => startOfWeek(now),
  month: (now) => startOfMonth(now),
  all: () => null,
};

const estimatesFor = (kg, contributionAmount) => ({
  co2eKg: Math.round(kg * ESTIMATES.co2PerKgFood),
  mealsFunded: Math.floor(contributionAmount / ESTIMATES.mealCostRupees),
  assumptions: { co2PerKgFood: ESTIMATES.co2PerKgFood, mealCostRupees: ESTIMATES.mealCostRupees },
});

export async function impactSummary(period = "all", now = new Date()) {
  const since = (PERIODS[period] || PERIODS.all)(now);
  const [rescue, contributions, partners] = await Promise.all([
    rescueTotals(since),
    contributionTotals(since),
    activePartnerCount(addDays(now, -30)),
  ]);
  return {
    period,
    since,
    measured: {
      mealsRescued: rescue.meals,
      kgRescued: Math.round(rescue.kg * 10) / 10,
      pickups: rescue.pickups,
      contributionsAmount: contributions.amount,
      contributionsCount: contributions.count,
      activePartners: partners,
    },
    estimates: estimatesFor(rescue.kg, contributions.amount),
  };
}

export async function impactDetails(now = new Date()) {
  const [weekly, byPartner] = await Promise.all([weeklyRescue(), rescueByPartner(addDays(now, -30))]);
  return { weekly, byPartner };
}

// Today's rescue board in numbers.
export function boardSummary(listings, now = new Date()) {
  const today = startOfDay(now);
  const sumPortions = (xs) => xs.reduce((s, l) => s + l.portions, 0);
  // Food past its best-before time is no longer on offer, even if nobody withdrew it.
  const available = listings.filter((l) => l.status === "available" && l.bestBefore > now);
  const reserved = listings.filter((l) => l.status === "reserved").sort((a, b) => a.pickupStart - b.pickupStart);
  const collectedToday = listings.filter((l) => l.status === "collected" && l.updatedAt >= today);
  return {
    availablePortions: sumPortions(available),
    availableListings: available.length,
    reservedPortions: sumPortions(reserved),
    rescuedToday: sumPortions(collectedToday),
    nextPickup: reserved[0] ? { at: reserved[0].pickupStart, item: reserved[0].item, portions: reserved[0].portions, partnerName: reserved[0].partnerName, partnerId: reserved[0].partnerId } : null,
  };
}

// Everything the public homepage needs, in one request.
export async function overview(now = new Date()) {
  const today = startOfDay(now);
  const [listings, orders, activity, forecast, impact] = await Promise.all([
    listBoard(today),
    orderStatsSince(today),
    recentActivity({ since: today, limit: 8 }),
    // The forecast is the one part that can legitimately be unavailable (not enough
    // sales history). If so, send null for it instead of failing the whole page.
    getForecast({ now }).catch((err) => {
      if (err.status === 503) return null;
      throw err;
    }),
    impactSummary("all", now),
  ]);
  const board = boardSummary(listings, now);
  const partner = board.nextPickup && (await getPartner(board.nextPickup.partnerId));
  return {
    now,
    ordersToday: orders.orders,
    board,
    // The partner collecting next — public details only (no contact info).
    nextPartner: partner && { name: partner.name, type: partner.type, area: partner.area, distanceKm: partner.distanceKm, note: partner.note },
    tonight: listings.filter((l) => l.status === "available" || l.status === "reserved"),
    activity,
    forecast: forecast && {
      weekday: forecast.weekday,
      method: forecast.method,
      historyThrough: forecast.historyThrough,
      historyIsCurrent: forecast.historyIsCurrent,
      items: forecast.items.map(({ category, label, unit, madeToOrder, predicted, low, high, recommendedPrep }) => ({
        category, label, unit, madeToOrder, predicted, low, high, recommendedPrep,
      })),
    },
    impact,
  };
}

// The staff dashboard in one request.
export async function staffDashboard(now = new Date()) {
  const today = startOfDay(now);
  const [orders, recentOrders, listings, activity] = await Promise.all([
    orderStatsSince(today),
    listOrdersSince(today, 8),
    listBoard(today),
    recentActivity({ since: today, limit: 12 }),
  ]);
  return { now, orders, recentOrders, board: boardSummary(listings, now), listings, activity };
}
