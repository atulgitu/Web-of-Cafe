// Static facts about the café and display labels. Live data comes from the API.

export const CAFE = {
  name: "Coffee Cinnamon",
  tagline: "Good food shouldn't go to waste.",
  area: "Indiranagar",
  address: "142, 5th Cross, Indiranagar, Bengaluru 560038",
  pickupPoint: "Back counter, side entrance on 5th Cross",
  // Real contact details: orders arrive on this WhatsApp number.
  phone: "+91 97080 12106",
  whatsappNumber: "919708012106", // country code + number, digits only (wa.me format)
  email: "atulraushanbn@gmail.com",
  // Opening hours by weekday (0 = Sunday), in minutes after midnight.
  hours: { weekday: { open: 7 * 60 + 30, close: 22 * 60 + 30 }, weekend: { open: 8 * 60, close: 23 * 60 } },
  hoursText: [
    { days: "Mon – Fri", time: "7:30 AM – 10:30 PM" },
    { days: "Sat – Sun", time: "8:00 AM – 11:00 PM" },
  ],
  pickupMinutes: 15,
  pilotStarted: "August 2026",
};

export const MENU_CATEGORIES = ["Coffee", "Cold Drinks", "Tea", "Breakfast", "Meals", "Snacks", "Bakery", "Combos"];

export const TAGS = {
  popular: { label: "Popular", tone: "caramel" },
  "high-protein": { label: "High protein", tone: "neutral" },
  "low-waste": { label: "Low-waste pick", tone: "leaf" },
};

export const ROLE_LABELS = { CUSTOMER: "Customer", STAFF: "Café staff", PARTNER: "Community partner" };

// Mirrors the server's estimate constants, for showing hints before a request returns.
export const MEAL_COST_ESTIMATE = 45;
