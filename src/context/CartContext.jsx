import usePersistentState from "../hooks/usePersistentState";
import { CartContext } from "./contexts";

// The cart only remembers *what* was chosen. Prices shown here are a preview;
// the server recalculates everything (see useQuote and POST /api/orders).
function lineKey({ id, size, addons = [], instructions = "" }) {
  return `${id}|${size || ""}|${[...addons].sort().join(",")}|${instructions}`;
}

// The cart is read back from localStorage, which can hold anything: an old format,
// a half-written value, something edited by hand. Keep only lines that look right,
// so bad data gives an empty cart instead of a crashed app.
const MAX_QUANTITY = 50; // same limit the server enforces
function cleanLines(stored) {
  if (!Array.isArray(stored)) return [];
  return stored
    .filter((l) => l && typeof l.key === "string" && typeof l.id === "string" && typeof l.name === "string")
    .map((l) => ({
      ...l,
      addons: Array.isArray(l.addons) ? l.addons : [],
      quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.round(Number(l.quantity)) || 1)),
      unitPrice: Number(l.unitPrice) || 0,
    }));
}

export function CartProvider({ children }) {
  const [storedLines, setStoredLines] = usePersistentState("cc_cart", []);
  const lines = cleanLines(storedLines);
  const setLines = (update) => setStoredLines((prev) => update(cleanLines(prev)));
  const [couponCode, setCouponCode] = usePersistentState("cc_coupon", null);
  const [storedContribution, setContribution] = usePersistentState("cc_contribution", 0);
  const contribution = Number.isInteger(storedContribution) && storedContribution > 0 ? storedContribution : 0;

  const addToCart = (item, { size = null, addons = [], instructions = "", quantity = 1, unitPrice }) => {
    const key = lineKey({ id: item.id, size, addons, instructions });
    setLines((prev) =>
      prev.some((l) => l.key === key)
        ? prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) } : l))
        : [...prev, { key, id: item.id, name: item.name, image: item.image, size, addons, instructions, quantity, unitPrice }]
    );
  };

  const updateQuantity = (key, quantity) =>
    setLines((prev) =>
      quantity <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) } : l))
    );

  const removeLine = (key) => setLines((prev) => prev.filter((l) => l.key !== key));

  const clearCart = () => {
    setStoredLines([]);
    setCouponCode(null);
    setContribution(0);
  };

  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const previewSubtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  // What the API expects for a quote or order.
  const orderRequest = {
    lines: lines.map((l) => ({ menuItemId: l.id, size: l.size, addons: l.addons, quantity: l.quantity, instructions: l.instructions || undefined })),
    couponCode,
    contribution,
  };

  return (
    <CartContext.Provider
      value={{
        lines,
        itemCount,
        previewSubtotal,
        addToCart,
        updateQuantity,
        removeLine,
        clearCart,
        couponCode,
        setCouponCode,
        contribution,
        setContribution,
        orderRequest,
        lineKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
