import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function Cart() {
  const { lines, updateQuantity, removeLine, subtotal, discount, tax, total, coupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (applyCoupon(couponInput)) {
      showToast("Coupon applied!");
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("Invalid or expired coupon code");
    }
  };

  if (lines.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-cream-dim flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-charcoal-soft">
            <circle cx="9" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.5 3h2l2.6 12.4a2 2 0 002 1.6h8.8a2 2 0 002-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-serif-display text-2xl text-espresso mb-2">Your cup is waiting.</h1>
        <p className="text-charcoal-soft text-sm mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/menu" className="inline-block px-6 py-3 rounded-full bg-espresso text-cream font-medium hover:bg-espresso-light transition-colors">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif-display text-3xl text-espresso mb-6">Your Cart</h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-3">
          {lines.map((line) => (
            <div key={line.key} className="bg-white border border-line rounded-xl p-4 flex gap-4 animate-fade-in">
              <img src={line.image} alt={line.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-charcoal">{line.name}</h3>
                    <p className="text-xs text-charcoal-soft mt-0.5">
                      {line.size}
                      {line.addons.length > 0 && ` · ${line.addons.join(", ")}`}
                    </p>
                    {line.instructions && (
                      <p className="text-xs text-charcoal-soft italic mt-0.5">Note: {line.instructions}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeLine(line.key)}
                    aria-label={`Remove ${line.name}`}
                    className="text-charcoal-soft hover:text-red-600 shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center border border-line rounded-full">
                    <button
                      onClick={() => updateQuantity(line.key, line.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal-soft hover:text-espresso"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                    <button
                      onClick={() => updateQuantity(line.key, line.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal-soft hover:text-espresso"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold text-espresso">₹{line.unitPrice * line.quantity}</span>
                </div>
              </div>
            </div>
          ))}

          <Link to="/menu" className="inline-block text-sm font-medium text-caramel-dark hover:underline mt-2">
            ← Continue Shopping
          </Link>
        </div>

        <div className="bg-white border border-line rounded-xl p-5 h-fit lg:sticky lg:top-24">
          <h2 className="font-medium text-espresso mb-4">Order Summary</h2>

          {!coupon ? (
            <form onSubmit={handleApplyCoupon} className="mb-4">
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
                />
                <button type="submit" className="px-4 py-2 rounded-lg bg-cream-dim text-espresso text-sm font-medium hover:bg-line transition-colors">
                  Apply
                </button>
              </div>
              {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
              <p className="text-xs text-charcoal-soft mt-1.5">Try STUDENT10 or BREW20</p>
            </form>
          ) : (
            <div className="mb-4 flex items-center justify-between bg-sage/10 border border-sage/25 rounded-lg px-3 py-2">
              <span className="text-sm text-sage-dark font-medium">{coupon.code} applied</span>
              <button onClick={removeCoupon} className="text-xs text-charcoal-soft hover:text-red-600">Remove</button>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-charcoal-soft">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sage-dark">
                <span>Discount</span>
                <span>−₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal-soft">
              <span>Taxes (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="border-t border-line pt-2 flex justify-between font-semibold text-espresso text-base">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-5 w-full bg-espresso text-cream font-medium py-3 rounded-full hover:bg-espresso-light transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
