import { useMemo } from "react";
import usePersistentState from "../hooks/usePersistentState";
import { CartContext } from "./contexts";

const COUPONS = { STUDENT10: 0.1, BREW20: 0.2 };
const TAX_RATE = 0.05;

function lineKey(item) {
  return `${item.id}|${item.size || ""}|${(item.addons || []).slice().sort().join(",")}|${item.instructions || ""}`;
}

export function CartProvider({ children }) {
  const [lines, setLines] = usePersistentState("brewcare_cart", []);
  const [coupon, setCoupon] = usePersistentState("brewcare_coupon", null);
  // Optional "Donate a meal" contribution, in rupees. Not taxed, not discounted.
  const [donation, setDonation] = usePersistentState("brewcare_donation", 0);

  const addToCart = (item, { size, addons = [], instructions = "", quantity = 1, unitPrice }) => {
    const key = lineKey({ id: item.id, size, addons, instructions });
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [...prev, { key, id: item.id, name: item.name, image: item.image, size, addons, instructions, quantity, unitPrice }];
    });
  };

  const updateQuantity = (key, quantity) => {
    if (quantity <= 0) {
      setLines((prev) => prev.filter((l) => l.key !== key));
      return;
    }
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, quantity } : l)));
  };

  const removeLine = (key) => setLines((prev) => prev.filter((l) => l.key !== key));

  const clearCart = () => {
    setLines([]);
    setCoupon(null);
    setDonation(0);
  };

  const applyCoupon = (code) => {
    const normalized = code.trim().toUpperCase();
    if (COUPONS[normalized]) {
      setCoupon({ code: normalized, discount: COUPONS[normalized] });
      return true;
    }
    return false;
  };

  const removeCoupon = () => setCoupon(null);

  const totals = useMemo(() => {
    const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
    const discount = coupon ? Math.round(subtotal * coupon.discount) : 0;
    const tax = Math.round((subtotal - discount) * TAX_RATE);
    const foodTotal = subtotal - discount + tax;
    return { itemCount, subtotal, discount, tax, foodTotal, total: foodTotal + (lines.length ? donation : 0) };
  }, [lines, coupon, donation]);

  return (
    <CartContext.Provider
      value={{
        lines,
        addToCart,
        updateQuantity,
        removeLine,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        donation,
        setDonation,
        ...totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
