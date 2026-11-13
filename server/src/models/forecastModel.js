import { query } from "../db/pool.js";
import { parseIsoDate } from "../utils/time.js";

export async function demandHistorySince(sinceIsoDate) {
  const { rows } = await query("SELECT * FROM demand_history WHERE date >= $1 ORDER BY date", [sinceIsoDate]);
  return rows.map((r) => ({ date: parseIsoDate(r.date), category: r.category, sold: r.sold, prepared: r.prepared }));
}

// The most recent day we have sales figures for ("YYYY-MM-DD"), or null.
export async function latestDemandDate() {
  const { rows } = await query("SELECT MAX(date) AS latest FROM demand_history");
  return rows[0].latest;
}

const toForecast = (r) => ({
  category: r.category,
  targetDate: r.target_date,
  predicted: r.predicted,
  low: r.low,
  high: r.high,
  recommendedPrep: r.recommended_prep,
  usualPrep: r.usual_prep,
  confidence: r.confidence,
  explanation: r.explanation,
  inputs: r.inputs,
  method: r.method,
  generatedAt: r.generated_at,
});

export async function upsertForecast(f, targetIso, method, generatedAt = null, client = { query }) {
  await client.query(
    `INSERT INTO forecasts (target_date, category, predicted, low, high, recommended_prep, usual_prep, confidence, explanation, inputs, method, generated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, COALESCE($12, now()))
     ON CONFLICT (target_date, category) DO UPDATE SET predicted = EXCLUDED.predicted, low = EXCLUDED.low, high = EXCLUDED.high,
       recommended_prep = EXCLUDED.recommended_prep, usual_prep = EXCLUDED.usual_prep, confidence = EXCLUDED.confidence,
       explanation = EXCLUDED.explanation, inputs = EXCLUDED.inputs, method = EXCLUDED.method, generated_at = EXCLUDED.generated_at`,
    [targetIso, f.category, f.predicted, f.low, f.high, f.recommendedPrep, f.usualPrep, f.confidence, f.explanation, JSON.stringify(f.inputs), method, generatedAt]
  );
}

export async function forecastsForDate(targetIso) {
  const { rows } = await query("SELECT * FROM forecasts WHERE target_date = $1", [targetIso]);
  return rows.map(toForecast);
}
