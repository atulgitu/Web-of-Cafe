import { useState } from "react";
import { useToast } from "../../hooks/useAppContext";
import useOnline from "../../hooks/useOnline";
import { api } from "../../lib/api";
import { timeInputToDate, toTimeInput } from "../../lib/format";
import { btn, field } from "../../lib/styles";
import { Spinner } from "../ui";

// Typical end-of-service leftovers, to make listing quick at the counter.
const presets = [
  { item: "Veg Grilled Sandwiches", category: "Sandwiches", kgPerPortion: 0.2, veg: true, dietary: ["Vegetarian", "Contains gluten, dairy"] },
  { item: "Veg Pulao", category: "Meals", kgPerPortion: 0.3, veg: true, dietary: ["Vegetarian", "Gluten-free"] },
  { item: "Club Sandwiches", category: "Sandwiches", kgPerPortion: 0.22, veg: false, dietary: ["Contains chicken, egg", "Contains gluten"] },
  { item: "Banana Bread", category: "Bakery", kgPerPortion: 0.08, veg: true, dietary: ["Vegetarian", "Contains gluten, egg"] },
  { item: "Blueberry Muffins", category: "Bakery", kgPerPortion: 0.09, veg: true, dietary: ["Vegetarian", "Contains gluten, egg"] },
];

const roundUp15 = (minutesFromNow) => {
  const d = new Date(Date.now() + minutesFromNow * 60000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return d;
};

// Create a new listing, or edit one that hasn't been reserved yet (pass `listing`).
export default function ListingForm({ listing, onSaved, onCancel }) {
  const editing = Boolean(listing);
  const { showToast } = useToast();
  const online = useOnline();
  const [preset, setPreset] = useState(0);
  const [portions, setPortions] = useState(listing?.portions ?? 6);
  const [start, setStart] = useState(toTimeInput(listing?.pickupStart ?? roundUp15(20)));
  const [end, setEnd] = useState(toTimeInput(listing?.pickupEnd ?? roundUp15(110)));
  const [bestBefore, setBestBefore] = useState(toTimeInput(listing?.bestBefore ?? roundUp15(200)));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(portions);
    if (!Number.isInteger(n) || n < 1 || n > 200) return setError("Enter between 1 and 200 portions.");
    const pickupStart = timeInputToDate(start);
    const pickupEnd = timeInputToDate(end, pickupStart);
    const best = timeInputToDate(bestBefore, pickupStart);
    if (pickupEnd <= pickupStart) return setError("Pickup must end after it starts.");
    if (best < pickupEnd) return setError("Best-before should be after the pickup window closes.");
    setError("");
    setSaving(true);
    try {
      const times = { portions: n, pickupStart, pickupEnd, bestBefore: best };
      const { listing: saved } = editing
        ? await api(`/rescue/${listing.id}`, { method: "PATCH", body: times })
        : await api("/rescue", { method: "POST", body: { ...presets[preset], ...times, preparedNote: "Listed from the counter" } });
      showToast(editing ? "Listing updated" : `${n} × ${saved.item.toLowerCase()} listed — partners can see it now`);
      onSaved?.(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {!editing && (
        <fieldset>
          <legend className={field.label}>What's left over?</legend>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, i) => (
              <label
                key={p.item}
                className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-caramel-dark ${
                  preset === i ? "bg-espresso text-cream border-espresso" : "border-line text-charcoal-soft hover:border-caramel"
                }`}
              >
                <input type="radio" name="preset" className="sr-only" checked={preset === i} onChange={() => setPreset(i)} />
                {p.item}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label htmlFor={`lf-portions-${listing?.id ?? "new"}`} className={field.label}>Portions</label>
          <input id={`lf-portions-${listing?.id ?? "new"}`} type="number" min="1" max="200" inputMode="numeric" value={portions} onChange={(e) => setPortions(e.target.value)} className={field.input} />
        </div>
        <div>
          <label htmlFor={`lf-start-${listing?.id ?? "new"}`} className={field.label}>Pickup from</label>
          <input id={`lf-start-${listing?.id ?? "new"}`} type="time" value={start} onChange={(e) => setStart(e.target.value)} className={field.input} />
        </div>
        <div>
          <label htmlFor={`lf-end-${listing?.id ?? "new"}`} className={field.label}>Pickup until</label>
          <input id={`lf-end-${listing?.id ?? "new"}`} type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={field.input} />
        </div>
        <div>
          <label htmlFor={`lf-bb-${listing?.id ?? "new"}`} className={field.label}>Best before</label>
          <input id={`lf-bb-${listing?.id ?? "new"}`} type="time" value={bestBefore} onChange={(e) => setBestBefore(e.target.value)} className={field.input} />
        </div>
      </div>

      {error && (
        <p className={field.error} role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving || !online} className={btn.primary}>
          {saving && <Spinner />}
          {editing ? "Save changes" : "List surplus"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={btn.secondary}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
