// Runs the forecasting prototype against the database: loads history, computes
// tomorrow's forecast per category, stores it, and logs the run.
import { transaction } from "../db/pool.js";
import { demandHistorySince, forecastsForDate, latestDemandDate, upsertForecast } from "../models/forecastModel.js";
import { insertEvent } from "../models/impactModel.js";
import { addDays, isoDate, startOfDay, WEEKDAY_NAMES } from "../utils/time.js";
import { HttpError } from "../utils/errors.js";
import { forecastCategory, METHOD, NotEnoughHistoryError } from "./forecastService.js";

export const CATEGORIES = [
  { id: "coffee", label: "Coffee", unit: "cups", madeToOrder: true },
  { id: "sandwiches", label: "Sandwiches", unit: "portions", madeToOrder: false },
  { id: "pastries", label: "Pastries", unit: "pieces", madeToOrder: false },
  { id: "meals", label: "Meals", unit: "bowls", madeToOrder: false },
];

// How far back to look for sales history. The forecast needs the last four values
// for the same weekday. This used to be 35 days, which only works if sales were
// recorded right up to yesterday: one missed week and every forecast failed.
// Ten weeks leaves room for gaps, and the response says how recent the data is.
const HISTORY_DAYS = 70;

export const tomorrow = (now = new Date()) => addDays(startOfDay(now), 1);

export function computeForecasts(history, target) {
  const weekday = WEEKDAY_NAMES[target.getDay()];
  return CATEGORIES.map((c) => forecastCategory(c, history.filter((h) => h.category === c.id), target, weekday));
}

export async function generateForecast({ now = new Date(), at = null } = {}) {
  const target = tomorrow(now);
  const targetIso = isoDate(target);
  const history = await demandHistorySince(isoDate(addDays(target, -HISTORY_DAYS)));
  let results;
  try {
    results = computeForecasts(history, target);
  } catch (err) {
    // Not a server fault: say so plainly, so pages can show a sensible message.
    if (err instanceof NotEnoughHistoryError) throw new HttpError(503, "There isn't enough recent sales history to make a forecast yet.");
    throw err;
  }

  await transaction(async (db) => {
    for (const f of results) await upsertForecast(f, targetIso, METHOD, at, db);
    const meals = results.find((r) => r.category === "meals");
    await insertEvent(
      {
        type: "forecast_generated",
        message: `Forecast for ${WEEKDAY_NAMES[target.getDay()]} generated — ${meals.predicted} meals expected, prep ${meals.recommendedPrep}`,
        createdAt: at,
      },
      db
    );
  });
  return getForecast({ now });
}

// Returns tomorrow's stored forecast (generating it the first time it's asked for).
export async function getForecast({ now = new Date() } = {}) {
  const target = tomorrow(now);
  const rows = await forecastsForDate(isoDate(target));
  if (!rows.length) return generateForecast({ now });
  const historyThrough = await latestDemandDate();

  const byCategory = new Map(rows.map((r) => [r.category, r]));
  const items = CATEGORIES.map((c) => ({ ...c, ...byCategory.get(c.id) })).filter((i) => i.predicted != null);
  const perishable = items.filter((i) => !i.madeToOrder && i.usualPrep != null);
  const sum = (xs, k) => xs.reduce((s, x) => s + x[k], 0);

  return {
    targetDate: isoDate(target),
    weekday: WEEKDAY_NAMES[target.getDay()],
    method: METHOD,
    // The last day we have sales for. If it's older than yesterday, the UI says so.
    historyThrough,
    historyIsCurrent: historyThrough >= isoDate(addDays(target, -2)),
    generatedAt: rows.reduce((latest, r) => (r.generatedAt > latest ? r.generatedAt : latest), rows[0].generatedAt),
    items,
    totals: {
      recommendedPrep: sum(perishable, "recommendedPrep"),
      usualPrep: sum(perishable, "usualPrep"),
      portionsSaved: Math.max(0, sum(perishable, "usualPrep") - sum(perishable, "recommendedPrep")),
    },
  };
}
