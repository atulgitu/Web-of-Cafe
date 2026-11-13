// Demand forecasting prototype — a transparent statistical baseline, not a trained ML model.
//
// For one category and one target date:
//   1. Same-weekday history: the last 4 values for that weekday (e.g. the last four
//      Wednesdays), oldest → newest, weighted 10% / 20% / 30% / 40%.
//   2. Recent trend: sales over the last 7 days ÷ the 7 days before, capped at ±10%
//      so one unusual week can't swing the plan.
//      predicted = round(weighted same-weekday average × trend)
//   3. Range: predicted ± max(2, round(1.5 × std-dev of those 4 days + 4% of predicted)).
//   4. Recommended prep (for food prepared in advance):
//      predicted + ceil(margin × SAFETY_FACTOR) — a buffer against running out without
//      going back to the old fixed par levels.
//
// Same inputs always give the same output. A trained model could replace
// forecastCategory() later as long as it returns the same fields.

export const FORECAST_SETTINGS = {
  weights: [0.1, 0.2, 0.3, 0.4],
  trendCap: 0.1,
  safetyFactor: 0.5,
  spreadMultiplier: 1.5,
  minMargin: 2,
  marginShareOfForecast: 0.04,
};

export const METHOD = "Weighted same-weekday average × 7-day trend (prototype baseline)";

// Thrown when there are fewer than four earlier same-weekday values to work from.
export class NotEnoughHistoryError extends Error {}

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const mean = (xs) => (xs.length ? sum(xs) / xs.length : 0);
const stdev = (xs) => Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2)));
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const DAY_MS = 24 * 60 * 60 * 1000;
const daysBetween = (a, b) => Math.round((b - a) / DAY_MS);

/**
 * @param {object} category  { id, label, unit, madeToOrder }
 * @param {Array}  history   [{ date: Date, sold, prepared }] for this category, any order
 * @param {Date}   target    the day being forecast (local midnight)
 * @param {string} weekdayName e.g. "Wednesday"
 */
export function forecastCategory(category, history, target, weekdayName, settings = FORECAST_SETTINGS) {
  const before = history.filter((h) => h.date < target).sort((a, b) => a.date - b.date);
  const sameWeekday = before.filter((h) => daysBetween(h.date, target) % 7 === 0).slice(-4);
  if (sameWeekday.length < 4) {
    throw new NotEnoughHistoryError(`Need four previous ${weekdayName}s of ${category.label} sales to forecast; found ${sameWeekday.length}.`);
  }

  const values = sameWeekday.map((h) => h.sold);
  const weighted = sum(values.map((v, i) => v * settings.weights[i]));

  const lastDay = before[before.length - 1].date;
  const inWindow = (from, to) => before.filter((h) => {
    const ago = daysBetween(h.date, lastDay);
    return ago >= from && ago <= to;
  });
  const last7 = sum(inWindow(0, 6).map((h) => h.sold));
  const prior7 = sum(inWindow(7, 13).map((h) => h.sold));
  const trend = prior7 ? clamp(last7 / prior7, 1 - settings.trendCap, 1 + settings.trendCap) : 1;

  const predicted = Math.round(weighted * trend);
  const usual = Math.round(mean(values));
  const spread = stdev(values);
  const margin = Math.max(settings.minMargin, Math.round(settings.spreadMultiplier * spread + settings.marginShareOfForecast * predicted));
  const confidence = spread / mean(values) < 0.04 ? "High" : "Medium";
  const trendPct = Math.round((trend - 1) * 100);

  const result = {
    category: category.id,
    label: category.label,
    unit: category.unit,
    madeToOrder: category.madeToOrder,
    predicted,
    low: predicted - margin,
    high: predicted + margin,
    usual,
    previous: values[values.length - 1],
    confidence,
    trendPct,
    explanation: explain({ category, usual, trendPct, weekdayName }),
    inputs: {
      sameWeekday: sameWeekday.map((h) => ({ date: h.date.toDateString(), sold: h.sold })),
      last7DaysSold: last7,
      prior7DaysSold: prior7,
      settings,
    },
    recommendedPrep: null,
    usualPrep: null,
  };

  if (!category.madeToOrder) {
    result.recommendedPrep = predicted + Math.ceil(margin * settings.safetyFactor);
    result.usualPrep = sameWeekday[sameWeekday.length - 1].prepared ?? null;
  }
  return result;
}

function explain({ category, usual, trendPct, weekdayName }) {
  const what = category.label.toLowerCase();
  const base = `${category.label} averaged ${usual} on the last four ${weekdayName}s`;
  if (trendPct >= 2) return `${base}, and sales over the past week ran about ${trendPct}% higher than the week before.`;
  if (trendPct <= -2) return `${base}, but the past week was about ${Math.abs(trendPct)}% quieter, so expect a little less ${what}.`;
  return `${base}, and the past week was in line with that, so the forecast stays close to usual.`;
}
