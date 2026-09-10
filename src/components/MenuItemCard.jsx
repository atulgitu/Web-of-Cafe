import { useState } from "react";
import StarRating from "./StarRating";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function MenuItemCard({ item, onOpen, wide = false, featured = false }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [justAdded, setJustAdded] = useState(false);

  const quickAdd = (e) => {
    e.stopPropagation();
    addToCart(item, { size: item.sizes[0], addons: [], instructions: "", quantity: 1, unitPrice: item.price });
    showToast(`${item.name} added to your cart.`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onOpen(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(item)}
      className={`group text-left bg-white border border-line rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${
        wide ? "flex flex-row" : "flex flex-col"
      } ${featured ? "sm:col-span-2 sm:row-span-1" : ""}`}
    >
      <div className={`relative overflow-hidden ${wide ? "w-32 sm:w-40 shrink-0" : featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span
          className={`absolute top-2 left-2 w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
            item.veg ? "border-sage-dark" : "border-red-600"
          } bg-white/90`}
          title={item.veg ? "Vegetarian" : "Non-vegetarian"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${item.veg ? "bg-sage-dark" : "bg-red-600"}`} />
        </span>
      </div>
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-charcoal leading-snug">{item.name}</h3>
          <StarRating rating={item.rating} />
        </div>
        <p className="text-sm text-charcoal-soft line-clamp-2 leading-snug">{item.description}</p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-semibold text-espresso">₹{item.price}</span>
          <button
            onClick={quickAdd}
            aria-label={`Add ${item.name} to cart`}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-150 ${
              justAdded ? "bg-sage-dark text-white" : "bg-cream-dim text-espresso hover:bg-caramel hover:text-white"
            }`}
          >
            {justAdded ? "Added ✓" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
