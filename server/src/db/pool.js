import pg from "pg";
import { config } from "../config.js";

// Return DATE columns as "YYYY-MM-DD" strings instead of JS Dates at local midnight.
pg.types.setTypeParser(1082, (v) => v);
// NUMERIC → JS number (our numerics are small: kg, distances, ratings).
pg.types.setTypeParser(1700, (v) => (v === null ? null : Number(v)));
// COUNT(*) and SUM() of integers come back as BIGINT; they comfortably fit in a JS number here.
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v)));

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
  // Serverless functions run many small copies of the app, so each keeps few connections.
  max: process.env.VERCEL ? 3 : 10,
});

export const query = (text, params) => pool.query(text, params);

// Run several statements atomically. `fn` receives a client with .query().
export async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
