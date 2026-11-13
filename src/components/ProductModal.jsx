import { useEffect, useRef, useState } from "react";
import { TAGS } from "../data/site";
import { useCart, useToast } from "../hooks/useAppContext";
import { formatRupees } from "../lib/format";
import { btn, field } from "../lib/styles";
import FoodImage from "./FoodImage";
import { QuantityStepper, Tag, VegMark } from "./ui";

export default function ProductModal({ item, onClose }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [size, setSize] = useState(item.sizes[0]?.label ?? null);
  const [addons, setAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const left = item.batch ? item.batch.left : Infinity;
  const soldOut = left <= 0;
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      // keep Tab inside the dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll("button, input, textarea, [href]");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  // Preview only — the server recalculates prices from the menu when you order.
  const sizeExtra = item.sizes.find((s) => s.label === size)?.extra || 0;
  const unitPrice = item.price + sizeExtra + item.addons.filter((a) => addons.includes(a.label)).reduce((s, a) => s + a.extra, 0);

  const toggleAddon = (a) => setAddons((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const handleAdd = () => {
    addToCart(item, { size, addons, instructions: instructions.trim(), quantity, unitPrice });
    showToast(`${quantity} × ${item.name} added to your cart`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-charcoal/50 flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-cream w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl animate-sheet-up"
      >
        <div className="relative">
          <FoodImage src={item.image} alt={item.name} eager className="w-full h-52 sm:h-64 object-cover sm:rounded-t-2xl" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 bg-paper/95 hover:bg-paper rounded-full w-9 h-9 flex items-center justify-center shadow"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="product-title" className="font-serif-display text-2xl text-espresso flex items-center gap-2">
                <VegMark veg={item.veg} />
                {item.name}
              </h2>
              <p className="mt-1 text-xs text-charcoal-soft">
                {item.category}
              </p>
            </div>
            <span className="font-semibold text-lg text-espresso whitespace-nowrap nums">{formatRupees(unitPrice)}</span>
          </div>

          <p className="mt-3 text-sm text-charcoal-soft leading-relaxed">{item.description}</p>

          {(item.tags.length > 0 || item.batch) && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {item.tags.map((t) => (
                <Tag key={t} tone={TAGS[t]?.tone}>
                  {TAGS[t]?.label || t}
                </Tag>
              ))}
              {item.batch && (
                <span className="text-xs text-caramel-dark ml-1">
                  {item.batch.note} · {soldOut ? "sold out for today" : `only ${left} left`}
                </span>
              )}
            </div>
          )}

          {item.lowWasteNote && (
            <p className="mt-4 border-l-2 border-leaf pl-3 text-sm text-leaf leading-relaxed">{item.lowWasteNote}</p>
          )}

          {item.sizes.length > 1 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-charcoal mb-2">Size</legend>
              <div className="flex gap-2 flex-wrap">
                {item.sizes.map(({ label: s, extra }) => (
                  <label
                    key={s}
                    className={`cursor-pointer px-4 py-1.5 rounded-full text-sm border transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-caramel-dark ${
                      size === s ? "bg-espresso text-cream border-espresso" : "border-line text-charcoal-soft hover:border-caramel"
                    }`}
                  >
                    <input type="radio" name="size" value={s} checked={size === s} onChange={() => setSize(s)} className="sr-only" />
                    {s}
                    {extra > 0 && <span className="opacity-70"> +₹{extra}</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {item.addons.length > 0 && (
            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-charcoal mb-2">Customise</legend>
              <div className="flex flex-col gap-2">
                {item.addons.map(({ label: a, extra }) => (
                  <label key={a} className="flex items-center gap-3 text-sm text-charcoal-soft cursor-pointer w-fit min-h-8">
                    <input type="checkbox" checked={addons.includes(a)} onChange={() => toggleAddon(a)} className="w-5 h-5 accent-caramel-dark" />
                    {a}
                    {extra > 0 && <span className="text-charcoal-soft/80 nums">+₹{extra}</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-5">
            <label htmlFor="instructions" className={field.label}>
              Anything we should know? <span className="font-normal text-charcoal-soft">(optional)</span>
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Less ice, no sugar, allergies…"
              rows={2}
              className={`${field.input} resize-none`}
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <QuantityStepper value={quantity} max={left} onChange={(q) => setQuantity(Math.max(1, q))} />
            <button type="button" onClick={handleAdd} disabled={soldOut} className={`${btn.primary} flex-1 py-3`}>
              {soldOut ? (
                "Sold out today"
              ) : (
                <>
                  Add to cart · <span className="nums">{formatRupees(unitPrice * quantity)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
