// Demo data for Coffee Cinnamon. Partners are fictional. All numbers are chosen to be
// believable for one small café, not to impress.

const H = (h, m = 0) => h * 60 + m;

export const partners = [
  {
    id: "p1",
    name: "Indiranagar Community Kitchen",
    type: "Community kitchen",
    area: "HAL 2nd Stage",
    distance_km: 2.1,
    needs_per_day: 18,
    capacity: 30,
    window_start: H(11),
    window_end: H(21),
    veg_only: false,
    contact: "Priya Singh · +91 98450 11234",
    note: "Serves lunch and an evening meal to around 60 people. Has a van, so they can come most of the day.",
  },
  {
    id: "p2",
    name: "Hope Children's Home",
    type: "Children's home",
    area: "Domlur",
    distance_km: 3.4,
    needs_per_day: 20,
    capacity: 20,
    window_start: H(12),
    window_end: H(19, 30),
    veg_only: true,
    contact: "Aditya Kumar · +91 99001 45678",
    note: "Vegetarian kitchen. Prefers food that can be served the same evening.",
  },
  {
    id: "p3",
    name: "Ejipura Night Shelter",
    type: "Night shelter",
    area: "Ejipura",
    distance_km: 4.8,
    needs_per_day: 25,
    capacity: 40,
    window_start: H(20),
    window_end: H(22, 30),
    veg_only: false,
    contact: "Shelter desk · +91 80 2553 0091",
    note: "Volunteers collect after 8 PM only.",
  },
  {
    id: "p4",
    name: "Campus Pantry",
    type: "Student-run pantry",
    area: "Koramangala",
    distance_km: 1.2,
    needs_per_day: 6,
    capacity: 10,
    window_start: H(10),
    window_end: H(20),
    veg_only: true,
    contact: "Pantry volunteers · pantry@campus.example",
    note: "Small fridge, so they ask for bakery items and sealed portions.",
  },
];

// Sample accounts, one per role, used for development and for testing the live site.
// They are NOT offered anywhere in the website: you log in with the email and password
// like any other account. Roles live in the database and can't be chosen when signing up.
//
// Passwords: locally they default to DEV_PASSWORD below. A production database is seeded
// with SAMPLE_ACCOUNT_PASSWORD and STAFF_PASSWORD from the environment instead (see seed.js),
// so the live site's accounts don't use a password that is visible in Git.
export const DEV_PASSWORD = "cinnamon123";

export const SAMPLE_ACCOUNTS = [
  { name: "Aarav Sharma", email: "aarav@coffeecinnamon.in", role: "CUSTOMER", phone: "+91 98765 43210" },
  { name: "Rohan Verma", email: "rohan@coffeecinnamon.in", role: "STAFF", phone: "+91 97080 12106" },
  { name: "Priya Singh", email: "priya@coffeecinnamon.in", role: "PARTNER", partner_id: "p1" },
  { name: "Aditya Kumar", email: "aditya@coffeecinnamon.in", role: "PARTNER", partner_id: "p2" },
];

// Other customers, used only for today's background orders.
export const backgroundCustomers = ["Kabir Mehta", "Sneha Iyer", "Nikhil Rao", "Meera Pillai", "Arjun Nair", "Divya Shetty"];

// Things the kitchen typically lists as surplus, with standard portion weights (kg).
export const surplusItems = [
  { item: "Veg Grilled Sandwiches", category: "Sandwiches", kg: 0.2, veg: true, dietary: ["Vegetarian", "Contains gluten, dairy"] },
  { item: "Butter & Chocolate Croissants", category: "Bakery", kg: 0.07, veg: true, dietary: ["Vegetarian", "Contains gluten, dairy"] },
  { item: "Rajma Chawal Bowls", category: "Meals", kg: 0.35, veg: true, dietary: ["Vegetarian", "Gluten-free"] },
  { item: "Veg Pulao", category: "Meals", kg: 0.3, veg: true, dietary: ["Vegetarian", "Gluten-free"] },
  { item: "Paneer Tikka Wraps", category: "Meals", kg: 0.22, veg: true, dietary: ["Vegetarian", "Contains dairy"] },
  { item: "Blueberry Muffins", category: "Bakery", kg: 0.09, veg: true, dietary: ["Vegetarian", "Contains gluten, egg"] },
  { item: "Club Sandwiches", category: "Sandwiches", kg: 0.22, veg: false, dietary: ["Contains chicken, egg", "Contains gluten"] },
  { item: "Banana Bread", category: "Bakery", kg: 0.08, veg: true, dietary: ["Vegetarian", "Contains gluten, egg"] },
];

// Weekly rescue totals from the start of the pilot. `weeksAgo` counts back from the current week.
export const pastWeeks = [
  { weeksAgo: 12, meals: 22, pickups: 3 },
  { weeksAgo: 11, meals: 31, pickups: 4 },
  { weeksAgo: 10, meals: 38, pickups: 5 },
  { weeksAgo: 9, meals: 44, pickups: 5 },
  { weeksAgo: 8, meals: 41, pickups: 5 },
  { weeksAgo: 7, meals: 52, pickups: 6 },
  { weeksAgo: 6, meals: 58, pickups: 7 },
  { weeksAgo: 5, meals: 55, pickups: 6 },
  { weeksAgo: 4, meals: 63, pickups: 7 },
  { weeksAgo: 3, meals: 61, pickups: 7 },
  { weeksAgo: 2, meals: 70, pickups: 8 },
  { weeksAgo: 1, meals: 76, pickups: 7 },
];

// Four weeks of sales by category, indexed by weekday (0 = Sunday … 6 = Saturday),
// oldest week first. `prepared` is what the kitchen made under its old fixed plan.
export const demand = {
  coffee: {
    sold: [
      [91, 70, 74, 77, 80, 86, 95],
      [88, 71, 76, 79, 81, 89, 97],
      [92, 74, 79, 82, 83, 90, 99],
      [94, 76, 82, 85, 84, 92, 101],
    ],
    prepared: null,
  },
  sandwiches: {
    sold: [
      [26, 33, 35, 36, 38, 42, 30],
      [27, 34, 36, 38, 39, 43, 31],
      [28, 35, 37, 39, 40, 44, 33],
      [29, 37, 39, 40, 41, 45, 34],
    ],
    prepared: [40, 48, 48, 48, 48, 48, 40],
  },
  pastries: {
    sold: [
      [36, 27, 30, 28, 29, 33, 38],
      [35, 26, 29, 27, 29, 32, 37],
      [36, 27, 30, 28, 28, 33, 39],
      [37, 28, 31, 29, 30, 34, 40],
    ],
    prepared: [45, 40, 40, 40, 40, 40, 45],
  },
  meals: {
    sold: [
      [22, 31, 30, 33, 34, 38, 26],
      [23, 32, 32, 34, 35, 39, 27],
      [24, 33, 33, 35, 36, 40, 28],
      [25, 34, 34, 36, 37, 41, 29],
    ],
    prepared: [32, 42, 42, 42, 42, 42, 32],
  },
};

// Contributions customers added before this system tracked orders online.
export const pastContributionAmounts = [20, 50, 20, 100, 20, 50, 30, 20, 50, 20];
export const PAST_CONTRIBUTION_COUNT = 380;
