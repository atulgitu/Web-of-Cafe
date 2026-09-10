import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "brewbean_cart";

function lineKey(item) {
  return `${item.id}|${item.size || ""}|${(item.addons || []).slice().sort().join(",")}|${item.instructions || ""}`;
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const addToCart = (item, { size, addons = [], instructions = "", quantity = 1, unitPrice }) => {
    const key = lineKey({ id: item.id, size, addons, instructions });
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l));
      }
      return [
        ...prev,
        {
          key,
          id: item.id,
          name: item.name,
          image: item.image,
          size,
          addons,
          instructions,
          quantity,
          unitPrice,
        },
      ];
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
  };

  const applyCoupon = (code) => {
    const normalized = code.trim().toUpperCase();
    const valid = { STUDENT10: 0.1, BREW20: 0.2 };
    if (valid[normalized]) {
      setCoupon({ code: normalized, discount: valid[normalized] });
      return true;
    }
    return false;
  };

  const removeCoupon = () => setCoupon(null);

  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0), [lines]);
  const discount = useMemo(() => (coupon ? Math.round(subtotal * coupon.discount) : 0), [coupon, subtotal]);
  const taxable = subtotal - discount;
  const tax = useMemo(() => Math.round(taxable * 0.05), [taxable]);
  const total = taxable + tax;

  return (
    <CartContext.Provider
      value={{
        lines,
        addToCart,
        updateQuantity,
        removeLine,
        clearCart,
        itemCount,
        subtotal,
        discount,
        tax,
        total,
        coupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
