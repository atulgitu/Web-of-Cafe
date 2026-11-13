// Helpers for the college demo. Both endpoints are disabled unless DEMO_MODE=true.
import { config } from "../config.js";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, seed } from "../db/seed.js";
import { notFound } from "../utils/errors.js";

const ensureDemo = () => {
  if (!config.demoMode) throw notFound("Demo mode is off.");
};

// Lets the frontend's "demo role switcher" sign in as each role with a real login.
export function accounts(_req, res) {
  ensureDemo();
  // When STAFF_PASSWORD is set (the live site), the staff account isn't offered here.
  const shown = process.env.STAFF_PASSWORD ? DEMO_ACCOUNTS.filter((a) => a.role !== "STAFF") : DEMO_ACCOUNTS;
  res.json({ password: DEMO_PASSWORD, accounts: shown.map(({ email, role, name }) => ({ email, role, name })) });
}

// Staff-only: wipe and re-seed, so the demo day starts fresh (times are relative to now).
export async function reset(_req, res) {
  ensureDemo();
  await seed({ log: () => {} });
  res.json({ ok: true });
}
