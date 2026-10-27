// Demo rescue data. Everything on /rescue, /partner, /dashboard and /impact is
// derived from these records, so the numbers stay consistent across pages.

const MIN = (h, m = 0) => h * 60 + m;
const TOMORROW = 24 * 60;

// Today's listings (Tuesday). Times are minutes since midnight.
export const initialListings = [
  {
    id: "r1",
    item: "Paneer Tikka Wraps",
    category: "Meals",
    portions: 8,
    kgPerPortion: 0.22,
    veg: true,
    dietary: ["Vegetarian", "Contains dairy"],
    prepared: "Made for lunch at 11:30 AM",
    bestBefore: MIN(17, 30),
    pickupStart: MIN(15),
    pickupEnd: MIN(16),
    status: "collected",
    partnerId: "p2",
    timeline: [
      { at: MIN(14, 55), text: "8 paneer wraps marked as surplus after the lunch rush" },
      { at: MIN(15, 10), text: "Hope Children's Home reserved all 8 portions" },
      { at: MIN(15, 40), text: "Pickup completed — 8 portions collected" },
    ],
  },
  {
    id: "r2",
    item: "Butter & Chocolate Croissants",
    category: "Bakery",
    portions: 10,
    kgPerPortion: 0.07,
    veg: true,
    dietary: ["Vegetarian", "Contains gluten, dairy"],
    prepared: "Baked this morning",
    bestBefore: TOMORROW + MIN(10),
    pickupStart: MIN(19, 30),
    pickupEnd: MIN(21),
    status: "reserved",
    partnerId: "p1",
    timeline: [
      { at: MIN(18, 5), text: "10 croissants marked as surplus" },
      { at: MIN(18, 20), text: "Indiranagar Community Kitchen reserved 10 pieces" },
    ],
  },
  {
    id: "r3",
    item: "Rajma Chawal Bowls",
    category: "Meals",
    portions: 4,
    kgPerPortion: 0.35,
    veg: true,
    dietary: ["Vegetarian", "Gluten-free"],
    prepared: "Cooked at 5:00 PM",
    bestBefore: MIN(21),
    pickupStart: MIN(19),
    pickupEnd: MIN(20, 30),
    status: "available",
    partnerId: null,
    timeline: [{ at: MIN(18, 15), text: "4 rajma chawal bowls marked as surplus" }],
  },
  {
    id: "r4",
    item: "Veg Grilled Sandwiches",
    category: "Sandwiches",
    portions: 8,
    kgPerPortion: 0.2,
    veg: true,
    dietary: ["Vegetarian", "Contains gluten, dairy"],
    prepared: "Made at 4:30 PM",
    bestBefore: MIN(21, 30),
    pickupStart: MIN(19),
    pickupEnd: MIN(20, 30),
    status: "available",
    partnerId: null,
    timeline: [
      { at: MIN(18, 42), text: "8 sandwiches marked as surplus — evening orders came in lower than prep" },
    ],
  },
];

// Completed pickups before today, newest first: the week of 19 Oct plus Monday 26 Oct.
export const pickupLog = [
  { id: "h10", date: "Mon 26 Oct", week: "26 Oct", item: "Blueberry Muffins", portions: 6, kg: 0.5, partnerId: "p4" },
  { id: "h9", date: "Mon 26 Oct", week: "26 Oct", item: "Veg Grilled Sandwiches", portions: 11, kg: 2.2, partnerId: "p1" },
  { id: "h8", date: "Sun 25 Oct", week: "19 Oct", item: "Rajma Chawal Bowls", portions: 10, kg: 3.5, partnerId: "p3" },
  { id: "h7", date: "Sat 24 Oct", week: "19 Oct", item: "Bakery assortment", portions: 18, kg: 1.4, partnerId: "p1" },
  { id: "h6", date: "Fri 23 Oct", week: "19 Oct", item: "Club Sandwiches", portions: 7, kg: 1.5, partnerId: "p3" },
  { id: "h5", date: "Thu 22 Oct", week: "19 Oct", item: "Paneer Tikka Wraps", portions: 6, kg: 1.3, partnerId: "p2" },
  { id: "h4", date: "Wed 21 Oct", week: "19 Oct", item: "Veg Pulao", portions: 12, kg: 4.2, partnerId: "p3" },
  { id: "h3", date: "Tue 20 Oct", week: "19 Oct", item: "Croissants & Muffins", portions: 14, kg: 1.1, partnerId: "p4" },
  { id: "h2", date: "Mon 19 Oct", week: "19 Oct", item: "Veg Grilled Sandwiches", portions: 9, kg: 1.8, partnerId: "p1" },
];

// Weekly totals from the start of the pilot up to where the detailed log begins.
export const weeklyHistory = [
  { week: "3 Aug", meals: 22, kg: 5.1, pickups: 3 },
  { week: "10 Aug", meals: 31, kg: 7.4, pickups: 4 },
  { week: "17 Aug", meals: 38, kg: 9.0, pickups: 5 },
  { week: "24 Aug", meals: 44, kg: 10.3, pickups: 5 },
  { week: "31 Aug", meals: 41, kg: 9.6, pickups: 5 },
  { week: "7 Sep", meals: 52, kg: 12.5, pickups: 6 },
  { week: "14 Sep", meals: 58, kg: 13.8, pickups: 7 },
  { week: "21 Sep", meals: 55, kg: 13.1, pickups: 6 },
  { week: "28 Sep", meals: 63, kg: 15.2, pickups: 7 },
  { week: "5 Oct", meals: 61, kg: 14.6, pickups: 7 },
  { week: "12 Oct", meals: 70, kg: 16.9, pickups: 8 },
];

export const CURRENT_WEEK = "26 Oct";

// Weeks counted as "October" on the impact page (weeks that start in October).
export const octoberWeeks = ["5 Oct", "12 Oct", "19 Oct", "26 Oct"];

// Customer contributions collected at checkout since the pilot started.
export const baselineContributions = { count: 386, amount: 17840 };
