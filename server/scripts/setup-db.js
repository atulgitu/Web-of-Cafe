// Runs during every production build: applies new migrations, and fills the database
// with the demo data only if it is empty (so redeploying never wipes real orders).
import { pool } from "../src/db/pool.js";
import { migrate } from "../src/db/migrate.js";
import { seed } from "../src/db/seed.js";

await migrate();
const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM menu_items");
if (rows[0].n === 0) {
  await seed();
  console.log("Empty database: demo data added.");
} else {
  console.log(`Database already has ${rows[0].n} menu items; left as it is.`);
}
await pool.end();
