import { useState } from "react";
import { useCart } from "../hooks/useAppContext";
import { contributionNote } from "../lib/format";
import { field } from "../lib/styles";

const PRESETS = [20, 50, 100];
const MAX = 10000;

// Optional "contribute a meal" step in the cart.
export default function DonationPicker() {
  const { contribution, setContribution } = useCart();
  const isPreset = contribution === 0 || PRESETS.includes(contribution);
  const [custom, setCustom] = useState(isPreset ? "" : String(contribution));
  const [customOpen, setCustomOpen] = useState(!isPreset);

  const pick = (amount) => {
    setCustomOpen(false);
    setCustom("");
    setContribution(amount);
  };

  const onCustom = (value) => {
    const clean = value.replace(/\D/g, "").slice(0, 5);
    setCustom(clean);
    setContribution(Math.min(Number(clean) || 0, MAX));
  };

  const chip = (active) =>
    `min-h-10 px-4 rounded-full border text-sm font-medium transition-colors nums ${
      active ? "bg-leaf border-leaf text-white" : "border-line bg-paper text-charcoal hover:border-leaf/50"
    }`;

  return (
    <section aria-labelledby="donate-heading" className="rounded-xl border border-line bg-paper p-5">
      <h2 id="donate-heading" className="font-medium text-espresso">
        Contribute a community meal
      </h2>
      <p className="text-sm text-charcoal-soft mt-1 leading-relaxed">
        Optional. Add a small contribution to help support community meals at the kitchens that collect our surplus food.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Contribution amount">
        <button type="button" onClick={() => pick(0)} aria-pressed={contribution === 0 && !customOpen} className={chip(contribution === 0 && !customOpen)}>
          No thanks
        </button>
        {PRESETS.map((a) => (
          <button key={a} type="button" onClick={() => pick(a)} aria-pressed={!customOpen && contribution === a} className={chip(!customOpen && contribution === a)}>
            ₹{a}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setCustomOpen(true);
            setContribution(Number(custom) || 0);
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
          <input id="custom-donation" inputMode="numeric" value={custom} onChange={(e) => onCustom(e.target.value)} placeholder="e.g. 75" className={field.input} autoFocus />
        </div>
      )}

      <p className="mt-3 text-sm text-leaf min-h-5" aria-live="polite">
        {contributionNote(contribution)}
      </p>
    </section>
  );
}
