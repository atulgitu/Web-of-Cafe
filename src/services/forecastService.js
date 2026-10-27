import { demandHistory, WEEKDAYS } from "../data/demand";
import { DEMO_DAY } from "../data/site";
import { predictDay } from "../lib/forecast";

// The single entry point the dashboard uses for forecasts. Today it runs the
// local baseline in lib/forecast.js; swapping in a real prediction service means
// replacing this body with something like:
//
//   const res = await fetch(`/api/forecast?date=${date}`);
//   return res.json();
//
// as long as the response keeps the { items, totals, method } shape.
export async function getTomorrowForecast() {
  await new Promise((r) => setTimeout(r, 450)); // simulate a network round trip
  const weekdayIndex = WEEKDAYS.indexOf(DEMO_DAY.tomorrow.slice(0, 3));
  return {
    date: DEMO_DAY.tomorrowShort,
    method: "Weighted average of the last 4 same weekdays × 7-day trend (prototype baseline)",
    ...predictDay(demandHistory, weekdayIndex, DEMO_DAY.tomorrow),
  };
}
