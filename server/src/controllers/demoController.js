// Staff-only helper, active only when DEMO_MODE=true: wipe and re-seed the sample data,
// so a presentation starts with a fresh day (times are placed relative to now).
// (There used to be a public endpoint here that listed the sample accounts and their
// password for a "role switcher". It was removed: it let anyone log in as staff.)
import { config } from "../config.js";
import { seed } from "../db/seed.js";
import { notFound } from "../utils/errors.js";

export async function reset(_req, res) {
  if (!config.demoMode) throw notFound("Demo mode is off.");
  await seed({ log: () => {} });
  res.json({ ok: true });
}
