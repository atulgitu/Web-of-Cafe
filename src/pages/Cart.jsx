import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DonationPicker from "../components/DonationPicker";
import FoodImage from "../components/FoodImage";
import OrderSummary from "../components/OrderSummary";
import { EmptyState, QuantityStepper } from "../components/ui";
import { useCart, useToast } from "../hooks/useAppContext";
import { formatRupees } from "../lib/format";
import { btn, container, field } from "../lib/styles";

export default function Cart() {
  const { lines, itemCount, updateQuantity, removeLine, coupon, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (applyCoupon(couponInput)) {
      showToast("Coupon applied");
      setCouponError("");
      setCouponInput("");
    } else {
      setCouponError("That code isn't valid. Try STUDENT10 or BREW20.");
    }
  };

  if (lines.length === 0) {
    return (
      <div className={`${container} py-16 max-w-2xl`}>
        <EmptyState
          title="Your cart is empty."
          action={
            <Link to="/menu" className={btn.primary}>
              Browse the menu
            </Link>
          }
        >
          The filter coffee is a good place to start.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className={`${container} py-10`}>
      <h1 className="font-serif-display text-3xl sm:text-4xl text-espresso mb-1">Your cart</h1>
      <p className="text-charcoal-soft mb-8">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
        <div className="space-y-6">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map((line) => (
              <li key={line.key} className="py-4 flex gap-4">
                <FoodImage src={line.image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-medium text-charcoal">{line.name}</h2>
                      <p className="text-xs text-charcoal-soft mt-0.5">
                        {line.size}
                        {line.addons.length > 0 && ` · ${line.addons.join(", ")}`}
                      </p>
                      {line.instructions && <p className="text-xs text-charcoal-soft italic mt-0.5">“{line.instructions}”</p>}
                    </div>
                    <span className="font-medium text-espresso nums shrink-0">{formatRupees(line.unitPrice * line.quantity)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <QuantityStepper size="sm" min={0} value={line.quantity} onChange={(q) => updateQuantity(line.key, q)} label={`${line.name} quantity`} />
                    <button type="button" onClick={() => removeLine(line.key)} className="text-xs text-charcoal-soft hover:text-red-700 underline-offset-4 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link to="/menu" className={btn.link}>
            ← Add something else
          </Link>

          <DonationPicker />
        </div>

        <aside className="bg-paper border border-line rounded-xl p-5 lg:sticky lg:top-24" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="font-medium text-espresso mb-4">
            Order summary
          </h2>

          {!coupon ? (
            <form onSubmit={handleApplyCoupon} className="mb-5">
              <label htmlFor="coupon" className="sr-only">
                Coupon code
              </label>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  aria-invalid={!!couponError}
                  aria-describedby={couponError ? "coupon-error" : undefined}
                  className={`${field.input} uppercase placeholder:normal-case`}
                />
                <button type="submit" className={btn.small}>
                  Apply
                </button>
              </div>
              {couponError && (
                <p id="coupon-error" className={field.error}>
                  {couponError}
                </p>
              )}
            </form>
          ) : (
            <div className="mb-5 flex items-center justify-between bg-leaf-soft/70 rounded-lg px-3 py-2">
              <span className="text-sm text-leaf font-medium">{coupon.code} applied</span>
              <button type="button" onClick={removeCoupon} className="text-xs text-charcoal-soft hover:text-red-700">
                Remove
              </button>
            </div>
          )}

          <OrderSummary />

          <button type="button" onClick={() => navigate("/checkout")} className={`${btn.primary} mt-5 w-full py-3`}>
            Continue to checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
