// Formatting helpers shared across pages. Times arrive from the API as ISO strings.
import { MEAL_COST_ESTIMATE } from "../data/site";

const sameDay = (a, b) => a.toDateString() === b.toDateString();

export function formatTime(value) {
  const d = new Date(value);
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
  const today = new Date();
  if (sameDay(d, today)) return time;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (sameDay(d, tomorrow)) return `Tomorrow ${time}`;
  return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}

export const formatWindow = (start, end) => `${formatTime(start)} – ${formatTime(end).replace(/^Tomorrow /, "")}`;

export const formatDate = (value) => new Date(value).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export const formatRupees = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export const formatNumber = (n) => Math.round(n).toLocaleString("en-IN");

export const formatKg = (kg) => `${Number(kg).toFixed(kg < 10 ? 1 : 0)} kg`;

export const minutesUntil = (value) => Math.round((new Date(value) - Date.now()) / 60000);

// "HH:MM" from <input type="time"> → a Date today (or tomorrow if it's already past by 6+ hours).
export function timeInputToDate(value, reference = new Date()) {
  const [h, m] = value.split(":").map(Number);
  const d = new Date(reference);
  d.setHours(h, m, 0, 0);
  if (d - reference < -6 * 60 * 60000) d.setDate(d.getDate() + 1);
  return d;
}

export function toTimeInput(value) {
  const d = new Date(value);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// A rough, clearly-labelled estimate of what a contribution pays for.
export function contributionNote(amount) {
  if (amount <= 0) return null;
  const meals = Math.floor(amount / MEAL_COST_ESTIMATE);
  if (meals >= 1) return `Could help fund about ${meals} community ${meals === 1 ? "meal" : "meals"} (estimate).`;
  return `Covers part of a community meal (about ₹${MEAL_COST_ESTIMATE} each, estimate).`;
}
