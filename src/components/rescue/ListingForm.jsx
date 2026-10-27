import { useState } from "react";
import { useRescue, useToast } from "../../hooks/useAppContext";
import { parseTimeInput, toTimeInput } from "../../lib/format";
import { btn, field } from "../../lib/styles";

// Typical end-of-service leftovers, to make listing quick at the counter.
const presets = [
  { item: "Veg Pulao", category: "Meals", kgPerPortion: 0.3, veg: true, dietary: ["Vegetarian", "Gluten-free"] },
  { item: "Chicken Panini", category: "Sandwiches", kgPerPortion: 0.2, veg: false, dietary: ["Contains chicken", "Contains gluten"] },
  { item: "Blueberry Muffins", category: "Bakery", kgPerPortion: 0.09, veg: true, dietary: ["Vegetarian", "Contains gluten, egg"] },
  { item: "Cheese Garlic Bread", category: "Bakery", kgPerPortion: 0.12, veg: true, dietary: ["Vegetarian", "Contains gluten, dairy"] },
];

export default function ListingForm({ onCreated }) {
  const { clock, createListing } = useRescue();
  const { showToast } = useToast();
  const [preset, setPreset] = useState(0);
  const [portions, setPortions] = useState(6);
  const [start, setStart] = useState(toTimeInput(Math.ceil((clock + 20) / 15) * 15));
  const [end, setEnd] = useState(toTimeInput(Math.ceil((clock + 110) / 15) * 15));
  const [bestBefore, setBestBefore] = useState("22:30");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const s = parseTimeInput(start);
    const en = parseTimeInput(end);
    const bb = parseTimeInput(bestBefore);
    const n = Number(portions);
    if (!Number.isInteger(n) || n < 1 || n > 200) return setError("Enter between 1 and 200 portions.");
    if (en <= s) return setError("Pickup must end after it starts.");
    if (bb < en) return setError("Best-before should be after the pickup window closes.");
    setError("");
    const p = presets[preset];
    const id = createListing({
      ...p,
      portions: n,
      prepared: "Listed from the counter just now",
      pickupStart: s,
      pickupEnd: en,
      bestBefore: bb,
    });
    showToast(`${n} ${p.item.toLowerCase()} listed — see suggested partners below`);
    onCreated?.(id);
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <fieldset>
        <legend className={field.label}>What's left over?</legend>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, i) => (
            <label
              key={p.item}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-caramel-dark ${
                preset === i ? "bg-espresso text-cream border-espresso" : "border-line text-charcoal-soft hover:border-caramel"
              }`}
            >
              <input type="radio" name="preset" className="sr-only" checked={preset === i} onChange={() => setPreset(i)} />
              {p.item}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor="lf-portions" className={field.label}>Portions</label>
          <input id="lf-portions" type="number" min="1" max="200" inputMode="numeric" value={portions} onChange={(e) => setPortions(e.target.value)} className={field.input} />
        </div>
        <div>
          <label htmlFor="lf-start" className={field.label}>Pickup from</label>
          <input id="lf-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} className={field.input} />
        </div>
        <div>
          <label htmlFor="lf-end" className={field.label}>Pickup until</label>
          <input id="lf-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={field.input} />
        </div>
        <div>
          <label htmlFor="lf-bb" className={field.label}>Best before</label>
          <input id="lf-bb" type="time" value={bestBefore} onChange={(e) => setBestBefore(e.target.value)} className={field.input} />
        </div>
      </div>

      {error && (
        <p className={field.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={btn.primary}>
        List surplus
      </button>
    </form>
  );
}
