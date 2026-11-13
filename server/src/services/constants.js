// Business constants in one place, so no "magic numbers" are scattered around.

export const TAX_RATE = 0.05; // 5% GST on food

export const COUPONS = {
  STUDENT10: { rate: 0.1, description: "10% off for students" },
  CINNAMON20: { rate: 0.2, description: "20% off on weekends", weekendOnly: true },
};

export const MAX_CONTRIBUTION = 10000;

// Estimates (shown with an "estimate" label wherever they're used).
export const ESTIMATES = {
  mealCostRupees: 45, // what a partner kitchen spends to serve one meal
  co2PerKgFood: 2.5, // kg CO2e per kg of food not wasted — a commonly cited rough average
};

export const CAFE_LOCATION = "Back counter, Coffee Cinnamon Indiranagar (side entrance on 5th Cross)";
