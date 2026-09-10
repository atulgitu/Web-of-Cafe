import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const hiddenOn = ["/cart", "/checkout", "/order-confirmation"];

export default function StickyMiniCart() {
  const { itemCount, total } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  if (itemCount === 0 || hiddenOn.includes(location.pathname)) return null;

  return (
    <button
      onClick={() => navigate("/cart")}
      className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-espresso text-cream rounded-full shadow-lg px-5 py-3.5 flex items-center justify-between animate-fade-in-up"
    >
      <span className="text-sm font-medium">
        {itemCount} item{itemCount > 1 ? "s" : ""} &middot; ₹{total}
      </span>
      <span className="text-sm font-semibold flex items-center gap-1">
        View Cart
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}
