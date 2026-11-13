import { CAFE } from "../data/site";

const clock = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h >= 12 ? "PM" : "AM"}`;
};

const hoursFor = (date) => (date.getDay() === 0 || date.getDay() === 6 ? CAFE.hours.weekend : CAFE.hours.weekday);

// Is the café open right now, and what should the hero say about it?
export function cafeStatus(now = new Date()) {
  const { open, close } = hoursFor(now);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const isOpen = minutes >= open && minutes < close;
  return {
    isOpen,
    label: isOpen ? `Open today until ${clock(close)}` : minutes < open ? `Opens today at ${clock(open)}` : "Closed for today",
    short: isOpen ? "Open now" : "Closed",
    pickup: isOpen ? `Pickup in about ${CAFE.pickupMinutes} minutes` : "Order ahead for when we open",
  };
}

const SLOT = 15; // minutes between pickup times
const LEAD = 20; // earliest pickup is this many minutes from now

// Pickup times a customer can choose: every 15 minutes while the café is open,
// starting at least 20 minutes from now, until 15 minutes before closing. If
// today is over, the times for the next open day are offered instead.
// Returns [{ value: ISO string, label: "Today, 4:15 PM" }]
export function pickupSlots(now = new Date()) {
  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    day.setHours(0, 0, 0, 0);
    const { open, close } = hoursFor(day);
    const nowMinutes = dayOffset === 0 ? now.getHours() * 60 + now.getMinutes() : 0;
    let start = Math.max(open + SLOT, nowMinutes + LEAD);
    start = Math.ceil(start / SLOT) * SLOT;
    const slots = [];
    for (let m = start; m <= close - SLOT; m += SLOT) {
      const at = new Date(day.getTime() + m * 60000);
      slots.push({ value: at.toISOString(), label: `${dayOffset === 0 ? "Today" : "Tomorrow"}, ${clock(m)}` });
    }
    if (slots.length) return slots;
  }
  return [];
}

// "As soon as possible" only makes sense while the café is open and not about to close.
export function canOrderNow(now = new Date()) {
  const { open, close } = hoursFor(now);
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= open && minutes <= close - LEAD;
}
