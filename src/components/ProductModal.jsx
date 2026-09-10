import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function ProductModal({ item, onClose }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [size, setSize] = useState(item.sizes[0]);
  const [addons, setAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const sizeUpcharge = size === "Large" || size === "Full" ? 30 : 0;
  const addonUpcharge = addons.reduce((sum, a) => {
    const match = a.match(/\+₹(\d+)/);
    return sum + (match ? Number(match[1]) : 0);
  }, 0);
  const unitPrice = item.price + sizeUpcharge + addonUpcharge;

  const toggleAddon = (a) => {
    setAddons((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const handleAdd = () => {
    addToCart(item, { size, addons, instructions, quantity, unitPrice });
    showToast(`${item.name} added to cart`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-charcoal/50 flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-cream w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        <div className="relative">
          <img src={item.image} alt={item.name} className="w-full h-56 sm:h-64 object-cover sm:rounded-t-2xl" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif-display text-2xl text-espresso">{item.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <StarRating rating={item.rating} />
                <span className="text-xs text-charcoal-soft">· {item.category}</span>
              </div>
            </div>
            <span className="font-semibold text-lg text-espresso whitespace-nowrap">₹{unitPrice}</span>
          </div>

          <p className="mt-3 text-sm text-charcoal-soft leading-relaxed">{item.description}</p>

          {item.sizes.length > 1 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-charcoal mb-2">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {item.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                      size === s
                        ? "bg-espresso text-cream border-espresso"
                        : "border-line text-charcoal-soft hover:border-caramel"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.addons.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-charcoal mb-2">Customize</h3>
              <div className="flex flex-col gap-2">
                {item.addons.map((a) => (
                  <label key={a} className="flex items-center gap-2.5 text-sm text-charcoal-soft cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.includes(a)}
                      onChange={() => toggleAddon(a)}
                      className="w-4 h-4 accent-caramel-dark"
                    />
                    {a}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-charcoal mb-2">Special instructions</h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g. less ice, no sugar…"
              rows={2}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-caramel resize-none"
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-line rounded-full">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-lg text-charcoal-soft hover:text-espresso"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center text-lg text-charcoal-soft hover:text-espresso"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 bg-espresso text-cream font-medium py-2.5 rounded-full hover:bg-espresso-light transition-colors"
            >
              Add to Cart · ₹{unitPrice * quantity}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
