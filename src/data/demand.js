// Four weeks of daily sales by category, Tuesday 29 Sep → Monday 26 Oct.
// Each row is one week, ordered Tue, Wed, Thu, Fri, Sat, Sun, Mon.
// parLevel is what the kitchen prepared each day under the old fixed plan.

export const WEEKDAYS = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];

export const demandHistory = [
  {
    id: "coffee",
    label: "Coffee",
    unit: "cups",
    madeToOrder: true,
    sold: [
      [74, 77, 80, 86, 95, 91, 70],
      [76, 79, 81, 89, 97, 88, 71],
      [79, 82, 83, 90, 99, 92, 74],
      [82, 85, 84, 92, 101, 94, 76],
    ],
  },
  {
    id: "sandwiches",
    label: "Sandwiches",
    unit: "portions",
    madeToOrder: false,
    parLevel: [48, 48, 48, 48, 40, 40, 48],
    sold: [
      [35, 36, 38, 42, 30, 26, 33],
      [36, 38, 39, 43, 31, 27, 34],
      [37, 39, 40, 44, 33, 28, 35],
      [39, 40, 41, 45, 34, 29, 37],
    ],
  },
  {
    id: "pastries",
    label: "Pastries",
    unit: "pieces",
    madeToOrder: false,
    parLevel: [40, 40, 40, 40, 45, 45, 40],
    sold: [
      [30, 28, 29, 33, 38, 36, 27],
      [29, 27, 29, 32, 37, 35, 26],
      [30, 28, 28, 33, 39, 36, 27],
      [31, 29, 30, 34, 40, 37, 28],
    ],
  },
  {
    id: "meals",
    label: "Meals",
    unit: "bowls",
    madeToOrder: false,
    parLevel: [42, 42, 42, 42, 32, 32, 42],
    sold: [
      [30, 33, 34, 38, 26, 22, 31],
      [32, 34, 35, 39, 27, 23, 32],
      [33, 35, 36, 40, 28, 24, 33],
      [34, 36, 37, 41, 29, 25, 34],
    ],
  },
];
