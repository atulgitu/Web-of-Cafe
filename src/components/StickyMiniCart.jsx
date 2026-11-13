import { Link, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useAppContext";
import { formatRupees } from "../lib/format";

const shownOn = ["/", "/menu"];

// Mobile: a persistent cart bar above the bottom navigation.
export default function StickyMiniCart() {
  const { itemCount, previewSubtotal } = useCart();
  const { pathname } = useLocation();

  if (itemCount === 0 || !shownOn.includes(pathname)) return null;

  return (
    <Link
      to="/cart"
      className="lg:hidden fixed left-3 right-3 z-40 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] bg-espresso text-cream rounded-full shadow-lg px-5 py-3.5 flex items-center justify-between animate-sheet-up"
    >
      <span className="text-sm font-medium nums">
        {itemCount} item{itemCount > 1 ? "s" : ""} · {formatRupees(previewSubtotal)}
      </span>
      <span className="text-sm font-semibold">View cart →</span>
    </Link>
  );
}
