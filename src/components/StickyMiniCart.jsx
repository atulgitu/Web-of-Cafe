import { Link, useLocation } from "react-router-dom";
import { useCart } from "../hooks/useAppContext";
import { formatRupees } from "../lib/format";

const shownOn = ["/", "/menu"];

export default function StickyMiniCart() {
  const { itemCount, total } = useCart();
  const { pathname } = useLocation();

  if (itemCount === 0 || !shownOn.includes(pathname)) return null;

  return (
    <Link
      to="/cart"
      className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-espresso text-cream rounded-full shadow-lg px-5 py-3.5 flex items-center justify-between animate-sheet-up"
    >
      <span className="text-sm font-medium nums">
        {itemCount} item{itemCount > 1 ? "s" : ""} · {formatRupees(total)}
      </span>
      <span className="text-sm font-semibold">View cart →</span>
    </Link>
  );
}
