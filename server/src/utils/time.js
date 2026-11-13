// Time helpers. The server sets TZ=Asia/Kolkata (see config.js), so local Date
// methods give café-local values.

export const MINUTE = 60 * 1000;
export const DAY_MINUTES = 24 * 60;

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Monday 00:00 of the week containing `date`.
export function startOfWeek(date = new Date()) {
  const d = startOfDay(date);
  const sinceMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - sinceMonday);
  return d;
}

export function startOfMonth(date = new Date()) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const addMinutes = (date, minutes) => new Date(new Date(date).getTime() + minutes * MINUTE);

// Minutes since local midnight of `dayStart`. Can exceed 1440 for times on later days.
export const minutesSince = (dayStart, date) => Math.round((new Date(date) - dayStart) / MINUTE);

// "YYYY-MM-DD" in local time.
export function isoDate(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Parse "YYYY-MM-DD" as a local date (not UTC).
export function parseIsoDate(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatClock(date) {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
}
