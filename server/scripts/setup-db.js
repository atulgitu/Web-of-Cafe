// Runs during every production build:
//  1. applies new migrations;
//  2. fills the database with the sample data only if it is empty;
//  3. otherwise copies menu wording and photos from the seed file onto existing items,
//     so content fixes reach the live site without wiping orders. (Prices, stock and
//     availability are left alone: those can be changed by the café.)
import { pool } from "../src/db/pool.js";
import { migrate } from "../src/db/migrate.js";
import { menuItems } from "../src/db/seed-data/menu.js";
import { seed } from "../src/db/seed.js";

await migrate();
const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM menu_items");
if (rows[0].n === 0) {
  await seed();
  console.log("Empty database: sample data added.");
} else {
  let updated = 0;
  for (const m of menuItems) {
    const r = await pool.query(
      "UPDATE menu_items SET name = $2, description = $3, image = $4, image_alt = $5 WHERE id = $1 AND (name, description, image, image_alt) IS DISTINCT FROM ($2, $3, $4, $5)",
      [m.id, m.name, m.description, m.image, m.imageAlt]
    );
    updated += r.rowCount;
  }
  console.log(`Database has ${rows[0].n} menu items; refreshed wording/photos on ${updated}.`);
}
await pool.end();
