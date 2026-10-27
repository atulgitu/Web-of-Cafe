// Small formatting helpers shared across pages.

const DAY = 24 * 60;

// Minutes since midnight → "7:30 PM". Values past midnight read "Tomorrow 10:00 AM".
export function formatTime(minutes) {
  const tomorrow = minutes >= DAY;
  const m = minutes % DAY;
  const h24 = Math.floor(m / 60);
  const mins = m % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const time = `${h12}:${String(mins).padStart(2, "0")} ${suffix}`;
  return tomorrow ? `Tomorrow ${time}` : time;
}

export function formatWindow(start, end) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export const formatRupees = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export const formatNumber = (n) => Math.round(n).toLocaleString("en-IN");

export const formatKg = (kg) => `${kg.toFixed(kg < 10 ? 1 : 0)} kg`;

export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

// "HH:MM" from an <input type="time"> → minutes since midnight.
export function parseTimeInput(value) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function toTimeInput(minutes) {
  const m = minutes % DAY;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
