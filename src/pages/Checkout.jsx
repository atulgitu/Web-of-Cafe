import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const steps = ["Order Details", "Payment", "Confirmation"];

export default function Checkout() {
  const { lines, subtotal, discount, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [fulfilment, setFulfilment] = useState("pickup");
  const [form, setForm] = useState({
    name: user?.name && user.name !== "Guest" ? user.name : "",
    phone: user?.phone || "",
    address: user?.addresses?.[0]?.line || "",
  });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [processing, setProcessing] = useState(false);

  if (lines.length === 0) {
    navigate("/cart");
    return null;
  }

  const prepTime = fulfilment === "pickup" ? "12–15 mins" : "30–40 mins";

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    if (fulfilment === "delivery" && !form.address.trim()) errs.address = "Delivery address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    if (paymentMethod !== "card") return true;
    const errs = {};
    if (!/^\d{16}$/.test(card.number.replace(/\s/g, ""))) errs.number = "Enter a valid 16-digit card number";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) errs.expiry = "Use MM/YY format";
    if (!/^\d{3}$/.test(card.cvv)) errs.cvv = "3-digit CVV";
    if (!card.name.trim()) errs.name = "Name on card is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goToPayment = () => {
    if (validateStep1()) {
      setErrors({});
      setStep(2);
    }
  };

  const placeOrder = async () => {
    if (!validatePayment()) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1400));
    const orderId = `BB-${Math.floor(10000 + Math.random() * 89999)}`;
    const order = {
      id: orderId,
      items: lines,
      total,
      fulfilment,
      prepTime,
      customer: form,
      placedAt: new Date().toISOString(),
    };
    sessionStorage.setItem("brewbean_last_order", JSON.stringify(order));
    setProcessing(false);
    clearCart();
    showToast("Order placed successfully!");
    navigate("/order-confirmation");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif-display text-3xl text-espresso mb-6">Checkout</h1>

      <ol className="flex items-center mb-8">
        {steps.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <li key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                    done ? "bg-sage-dark text-white" : active ? "bg-espresso text-cream" : "bg-cream-dim text-charcoal-soft"
                  }`}
                >
                  {done ? "✓" : n}
                </div>
                <span className={`text-xs text-center ${active ? "text-espresso font-medium" : "text-charcoal-soft"}`}>{label}</span>
              </div>
              {n < steps.length && <div className={`h-px flex-1 mx-1 ${step > n ? "bg-sage-dark" : "bg-line"}`} />}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <div className="bg-white border border-line rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Full name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Phone number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              placeholder="+91 98765 43210"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Order type</label>
            <div className="flex gap-3">
              {["pickup", "delivery"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFulfilment(opt)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    fulfilment === opt ? "border-espresso bg-cream-dim text-espresso" : "border-line text-charcoal-soft"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {fulfilment === "delivery" && (
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Delivery address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel resize-none"
              />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
            </div>
          )}

          <div className="bg-cream-dim rounded-lg px-4 py-3 text-sm text-charcoal-soft">
            Estimated preparation time: <span className="font-medium text-espresso">{prepTime}</span>
          </div>

          <button
            onClick={goToPayment}
            className="w-full bg-espresso text-cream font-medium py-3 rounded-full hover:bg-espresso-light transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border border-line rounded-xl p-6 space-y-5">
          <div className="bg-cream-dim rounded-lg px-4 py-3 text-xs text-charcoal-soft">
            This is a safe mock payment screen for demo purposes — no real transaction occurs.
          </div>

          <div className="flex gap-3">
            {["card", "upi", "cod"].map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium uppercase transition-colors ${
                  paymentMethod === m ? "border-espresso bg-cream-dim text-espresso" : "border-line text-charcoal-soft"
                }`}
              >
                {m === "cod" ? "Cash" : m}
              </button>
            ))}
          </div>

          {paymentMethod === "card" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Card number</label>
                <input
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  placeholder="4242 4242 4242 4242"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
                />
                {errors.number && <p className="text-xs text-red-600 mt-1">{errors.number}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Expiry</label>
                  <input
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    placeholder="MM/YY"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
                  />
                  {errors.expiry && <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">CVV</label>
                  <input
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
                  />
                  {errors.cvv && <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Name on card</label>
                <input
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
            </div>
          )}

          {paymentMethod === "upi" && (
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">UPI ID</label>
              <input placeholder="yourname@upi" className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel" />
            </div>
          )}

          {paymentMethod === "cod" && (
            <p className="text-sm text-charcoal-soft">Pay with cash when your order is ready for pickup or delivery.</p>
          )}

          <div className="border-t border-line pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-charcoal-soft"><span>Subtotal</span><span>₹{subtotal}</span></div>
            {discount > 0 && <div className="flex justify-between text-sage-dark"><span>Discount</span><span>−₹{discount}</span></div>}
            <div className="flex justify-between text-charcoal-soft"><span>Taxes</span><span>₹{tax}</span></div>
            <div className="flex justify-between font-semibold text-espresso text-base"><span>Total</span><span>₹{total}</span></div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-5 py-3 rounded-full border border-line text-charcoal-soft font-medium hover:bg-cream-dim transition-colors">
              Back
            </button>
            <button
              onClick={placeOrder}
              disabled={processing}
              className="flex-1 bg-espresso text-cream font-medium py-3 rounded-full hover:bg-espresso-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {processing && <Spinner />}
              {processing ? "Placing order…" : `Place Order · ₹${total}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
