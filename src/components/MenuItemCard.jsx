import { useState } from "react";
import { TAGS } from "../data/site";
import { useCart, useToast } from "../hooks/useAppContext";
import { formatRupees } from "../lib/format";
import FoodImage from "./FoodImage";
import { QuantityStepper, Tag, VegMark } from "./ui";

export default function MenuItemCard({ item, onOpen }) {
  const { lines, addToCart, updateQuantity, lineKey } = useCart();
  const { showToast } = useToast();
  const [pulse, setPulse] = useState(false);

  // Quick add uses the default size and no add-ons.
  const defaultSize = item.sizes[0]?.label ?? null;
  const quickKey = lineKey({ id: item.id, size: defaultSize });
  const inCart = lines.find((l) => l.key === quickKey);
  // A few items are baked in small daily batches; the server refuses orders beyond what's left.
  const left = item.batch ? item.batch.left : Infinity;
  const soldOut = left <= 0;

  const quickAdd = () => {
    addToCart(item, { size: defaultSize, unitPrice: item.price + (item.sizes[0]?.extra || 0) });
    showToast(`${item.name} added to your cart`);
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
  };

  return (
    <article className="group relative flex flex-col bg-paper border border-line rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-[0_6px_20px_-12px_rgba(59,42,32,0.35)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <FoodImage src={item.image} alt="" className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${soldOut ? "grayscale opacity-70" : ""}`} />
        {item.batch && (
          <span className={`absolute bottom-2 left-2 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-medium ${soldOut ? "text-charcoal" : "text-caramel-dark"}`}>
            {soldOut ? "Sold out today" : `${left} left today`}
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-1">
        <h3 className="flex items-start gap-2 font-medium text-charcoal leading-snug text-[15px]">
          <VegMark veg={item.veg} className="mt-1" />
          {/* Stretched button: tapping anywhere on the card opens details, except the add controls */}
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="text-left after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-caramel-dark"
          >
            {item.name}
          </button>
        </h3>
        <p className="text-sm text-charcoal-soft line-clamp-2 leading-snug">{item.description}</p>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {item.tags.slice(0, 2).map((t) => (
              <Tag key={t} tone={TAGS[t]?.tone}>
                {TAGS[t]?.label || t}
              </Tag>
            ))}
          </div>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2 relative z-10">
          <span className="font-semibold text-espresso nums">{formatRupees(item.price)}</span>
          {soldOut && !inCart ? (
            <span className="min-h-9 flex items-center text-sm font-medium text-charcoal-soft">Sold out</span>
          ) : inCart ? (
            <QuantityStepper size="sm" min={0} max={left} value={inCart.quantity} onChange={(q) => updateQuantity(quickKey, q)} label={`${item.name} quantity`} />
          ) : (
            <button
              type="button"
              onClick={quickAdd}
              aria-label={`Add ${item.name} to cart`}
              className={`min-h-9 text-sm font-medium px-4 rounded-full border transition-colors ${
                pulse ? "bg-leaf border-leaf text-white" : "border-espresso/20 text-espresso hover:bg-espresso hover:text-cream"
              }`}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
