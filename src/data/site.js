// Shared constants for the Brew & Care prototype.

export const CAFE = {
  name: "Brew & Care",
  tagline: "Good food shouldn't go to waste.",
  address: "142, 5th Cross, Indiranagar, Bengaluru 560038",
  pickupPoint: "Back counter, Brew & Care Indiranagar (side entrance on 5th Cross)",
  phone: "+91 80 4567 1234",
  email: "hello@brewandcare.in",
  hours: [
    { days: "Mon – Fri", time: "7:30 AM – 10:30 PM" },
    { days: "Sat – Sun", time: "8:00 AM – 11:00 PM" },
  ],
  pilotStarted: "3 August 2026",
};

// The prototype runs on a fixed "demo day" so every number on every page agrees
// with every other number. Rescue actions advance this clock a few minutes each.
export const DEMO_DAY = {
  label: "Tuesday, 27 October",
  short: "Tue 27 Oct",
  tomorrow: "Wednesday",
  tomorrowShort: "Wed 28 Oct",
  startMinutes: 18 * 60 + 50, // 6:50 PM
};

// Assumptions used in estimates. Shown on the Impact and About pages.
export const ASSUMPTIONS = {
  mealCost: 45, // ₹ a partner kitchen spends to serve one meal
  co2PerKg: 2.5, // kg CO2e avoided per kg of food not wasted (commonly cited rough average)
};

export const ROLES = [
  { id: "customer", label: "Customer", hint: "Order food, add a contribution" },
  { id: "staff", label: "Café staff", hint: "Forecasts, surplus listings, matching" },
  { id: "partner", label: "Community partner", hint: "Reserve and collect surplus food" },
];

// Which partner the "Community partner" demo role acts as.
export const DEMO_PARTNER_ID = "p1";
