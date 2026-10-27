// Demand forecast — a transparent statistical baseline, not a trained model.
//
// For each category:
//   1. Take the last four values for the same weekday (e.g. the last four Wednesdays)
//      and weight recent weeks more heavily: 10%, 20%, 30%, 40%.
//   2. Multiply by a recent-trend factor: last 7 days' sales ÷ the 7 days before,
//      capped to ±10% so one odd week can't swing the plan.
//   3. Use the spread of those same-weekday values to give a range.
//
// It is deliberately simple so staff can check it by hand. A real model would
// replace predictCategory() without changing the shape of what it returns.

const WEIGHTS = [0.1, 0.2, 0.3, 0.4];
const TREND_CAP = 0.1;

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const mean = (xs) => sum(xs) / xs.length;
const stdev = (xs) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function predictCategory(category, weekdayIndex, weekdayName) {
  const weeks = category.sold;
  const sameDay = weeks.map((w) => w[weekdayIndex]);
  const weighted = sum(sameDay.map((v, i) => v * WEIGHTS[i]));

  const lastWeek = sum(weeks[weeks.length - 1]);
  const weekBefore = sum(weeks[weeks.length - 2]);
  const trend = clamp(lastWeek / weekBefore, 1 - TREND_CAP, 1 + TREND_CAP);

  const predicted = Math.round(weighted * trend);
  const usual = Math.round(mean(sameDay));
  const spread = stdev(sameDay);
  const margin = Math.max(2, Math.round(1.5 * spread + 0.04 * predicted));
  const confidence = spread / mean(sameDay) < 0.04 ? "High" : "Medium";

  const result = {
    id: category.id,
    label: category.label,
    unit: category.unit,
    madeToOrder: category.madeToOrder,
    previous: sameDay[sameDay.length - 1],
    usual,
    predicted,
    low: predicted - margin,
    high: predicted + margin,
    confidence,
    trendPct: Math.round((trend - 1) * 100),
    explanation: explain({ label: category.label, predicted, usual, trend, weekdayName }),
  };

  if (!category.madeToOrder) {
    // Prep to the forecast plus half the margin: enough to avoid running out on a
    // normal day without returning to the old fixed par level.
    const recommendedPrep = predicted + Math.ceil(margin / 2);
    const usualPrep = category.parLevel[weekdayIndex];
    const avgOldWaste = Math.round(mean(weeks.map((w, i) => category.parLevel[weekdayIndex] - sameDay[i])));
    result.recommendedPrep = recommendedPrep;
    result.usualPrep = usualPrep;
    result.avgOldWaste = avgOldWaste;
    result.expectedLeftover = Math.max(0, recommendedPrep - predicted);
    result.portionsSaved = Math.max(0, usualPrep - recommendedPrep);
  }

  return result;
}

function explain({ label, predicted, usual, trend, weekdayName }) {
  const pct = Math.round((trend - 1) * 100);
  const diff = predicted - usual;
  const subject = label.toLowerCase();
  if (pct >= 2) {
    return `Expect ${subject} to be slightly busier than a usual ${weekdayName} (about ${diff >= 0 ? "+" : ""}${diff}). Sales over the last 7 days ran ${pct}% above the week before.`;
  }
  if (pct <= -2) {
    return `Expect ${subject} to be a little quieter than a usual ${weekdayName}. Sales over the last 7 days were ${Math.abs(pct)}% below the week before.`;
  }
  return `${label} on ${weekdayName}s has been steady for four weeks, so the forecast stays close to the usual ${usual}.`;
}

export function predictDay(history, weekdayIndex, weekdayName) {
  const items = history.map((c) => predictCategory(c, weekdayIndex, weekdayName));
  const perishable = items.filter((i) => !i.madeToOrder);
  return {
    items,
    totals: {
      portionsSaved: sum(perishable.map((i) => i.portionsSaved)),
      usualPrep: sum(perishable.map((i) => i.usualPrep)),
      recommendedPrep: sum(perishable.map((i) => i.recommendedPrep)),
      avgOldWaste: sum(perishable.map((i) => i.avgOldWaste)),
    },
  };
}
