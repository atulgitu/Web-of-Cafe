import { useState } from "react";
import { useCart } from "../hooks/useAppContext";
import { contributionNote } from "../lib/impact";
import { field } from "../lib/styles";

const PRESETS = [20, 50, 100];

export default function DonationPicker() {
  const { donation, setDonation } = useCart();
  const isPreset = donation === 0 || PRESETS.includes(donation);
  const [custom, setCustom] = useState(isPreset ? "" : String(donation));
  const [customOpen, setCustomOpen] = useState(!isPreset);

  const pick = (amount) => {
    setCustomOpen(false);
    setCustom("");
    setDonation(amount);
  };

  const onCustom = (value) => {
    const clean = value.replace(/\D/g, "").slice(0, 5);
    setCustom(clean);
    setDonation(Math.min(Number(clean) || 0, 10000));
  };

  const chip = (active) =>
    `px-3.5 py-2 rounded-full border text-sm font-medium transition-colors nums ${
      active ? "bg-leaf border-leaf text-white" : "border-line bg-paper text-charcoal hover:border-leaf/50"
    }`;

  return (
    <section aria-labelledby="donate-heading" className="rounded-xl border border-line bg-paper p-5">
      <h2 id="donate-heading" className="font-medium text-espresso">Add a meal for someone else</h2>
      <p className="text-sm text-charcoal-soft mt-1 leading-relaxed">
        Optional. Contributions go to our partner kitchens to cook and serve community meals alongside the food we rescue.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Contribution amount">
        <button type="button" onClick={() => pick(0)} aria-pressed={donation === 0 && !customOpen} className={chip(donation === 0 && !customOpen)}>
          No thanks
        </button>
        {PRESETS.map((a) => (
          <button key={a} type="button" onClick={() => pick(a)} aria-pressed={!customOpen && donation === a} className={chip(!customOpen && donation === a)}>
            ₹{a}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setCustomOpen(true);
            setDonation(Number(custom) || 0);
          }}
          aria-pressed={customOpen}
          className={chip(customOpen)}
        >
          Other
        </button>
      </div>

      {customOpen && (
        <div className="mt-3 max-w-[12rem]">
          <label htmlFor="custom-donation" className={field.label}>
            Amount (₹)
          </label>
          <input
            id="custom-donation"
            inputMode="numeric"
            value={custom}
            onChange={(e) => onCustom(e.target.value)}
            placeholder="e.g. 75"
            className={field.input}
            autoFocus
          />
        </div>
      )}

      <p className="mt-3 text-sm text-leaf min-h-5" aria-live="polite">
        {contributionNote(donation)}
      </p>
    </section>
  );
}
