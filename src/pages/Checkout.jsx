import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import OrderSummary from "../components/OrderSummary";
import { Spinner } from "../components/ui";
import { useAuth, useCart, useRescue, useToast } from "../hooks/useAppContext";
import { contributionNote } from "../lib/impact";
import { formatRupees } from "../lib/format";
import { btn, container, field } from "../lib/styles";

const steps = ["Details", "Payment"];

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className={field.label}>
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={field.error}>
          {error}
        </p>
      )}
    </div>
  );
}

const inputProps = (id, error) => ({
  id,
  className: field.input,
  "aria-invalid": !!error,
  "aria-describedby": error ? `${id}-error` : undefined,
});

export default function Checkout() {
  const { lines, total, donation, clearCart } = useCart();
  const { user, addOrder } = useAuth();
  const { recordDonation } = useRescue();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [fulfilment, setFulfilment] = useState("pickup");
  const [form, setForm] = useState({
    name: user?.name && !user.guest ? user.name : "",
    phone: user?.phone || "",
    address: user?.addresses?.[0]?.line || "",
  });
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [processing, setProcessing] = useState(false);

  if (lines.length === 0 && !processing) return <Navigate to="/cart" replace />;

  const prepTime = fulfilment === "pickup" ? "12–15 mins" : "30–40 mins";

  const validateDetails = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your name";
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone)) errs.phone = "Enter a valid phone number";
    if (fulfilment === "delivery" && !form.address.trim()) errs.address = "We need an address to deliver to";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs = {};
    if (paymentMethod === "upi" && !/^[\w.-]+@[\w]+$/.test(upi.trim())) errs.upi = "Enter a UPI ID like name@bank";
    if (paymentMethod === "card") {
      if (!/^\d{16}$/.test(card.number.replace(/\s/g, ""))) errs.number = "Enter a 16-digit card number";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) errs.expiry = "Use MM/YY";
      if (!/^\d{3}$/.test(card.cvv)) errs.cvv = "3 digits";
      if (!card.name.trim()) errs.cardName = "Name on card is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = async () => {
    if (!validatePayment()) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const order = {
      id: `BC-${Math.floor(10000 + Math.random() * 89999)}`,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      lines,
      items: lines.map((l) => l.name),
      total,
      donation,
      fulfilment,
      prepTime,
      customer: form,
      status: "Preparing",
    };
    try {
      sessionStorage.setItem("brewcare_last_order", JSON.stringify(order));
    } catch {
      // confirmation page falls back to the profile if storage is blocked
    }
    addOrder({ id: order.id, date: order.date, items: order.items, total, donation, status: "Preparing" });
    if (donation > 0) recordDonation(donation);
    clearCart();
    showToast(donation > 0 ? "Order placed — thank you for the contribution" : "Order placed");
    navigate("/order-confirmation", { replace: true });
  };

  const segment = (active) =>
    `flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
      active ? "border-espresso bg-cream-dim text-espresso" : "border-line text-charcoal-soft hover:border-espresso/30"
    }`;

  return (
    <div className={`${container} py-10`}>
      <h1 className="font-serif-display text-3xl sm:text-4xl text-espresso mb-6">Checkout</h1>

      <ol className="flex items-center gap-3 mb-8 text-sm" aria-label="Checkout steps">
        {steps.map((label, i) => {
          const n = i + 1;
          return (
            <li key={label} className="flex items-center gap-2" aria-current={step === n ? "step" : undefined}>
              <span
                className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${
                  step > n ? "bg-leaf text-white" : step === n ? "bg-espresso text-cream" : "bg-cream-dim text-charcoal-soft"
                }`}
              >
                {step > n ? "✓" : n}
              </span>
              <span className={step === n ? "text-espresso font-medium" : "text-charcoal-soft"}>{label}</span>
              {n < steps.length && <span className="w-10 h-px bg-line ml-1" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">
        <div className="bg-paper border border-line rounded-xl p-5 sm:p-6">
          {step === 1 && (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (validateDetails()) {
                  setErrors({});
                  setStep(2);
                }
              }}
              className="space-y-5"
            >
              <Field id="co-name" label="Full name" error={errors.name}>
                <input {...inputProps("co-name", errors.name)} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field id="co-phone" label="Phone number" error={errors.phone}>
                <input
                  {...inputProps("co-phone", errors.phone)}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>

              <fieldset>
                <legend className={field.label}>Pickup or delivery?</legend>
                <div className="flex gap-3">
                  {["pickup", "delivery"].map((opt) => (
                    <button key={opt} type="button" aria-pressed={fulfilment === opt} onClick={() => setFulfilment(opt)} className={`${segment(fulfilment === opt)} capitalize`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </fieldset>

              {fulfilment === "delivery" && (
                <Field id="co-address" label="Delivery address" error={errors.address}>
                  <textarea
                    {...inputProps("co-address", errors.address)}
                    className={`${field.input} resize-none`}
                    rows={2}
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </Field>
              )}

              <p className="text-sm text-charcoal-soft">
                Ready in about <span className="font-medium text-espresso">{prepTime}</span>
                {fulfilment === "pickup" && " at the front counter"}.
              </p>

              <button type="submit" className={`${btn.primary} w-full py-3`}>
                Continue to payment
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-xs text-charcoal-soft bg-cream-dim rounded-lg px-3 py-2">
                Demo payment screen — nothing is charged. Any valid-looking details will work.
              </p>

              <fieldset>
                <legend className="sr-only">Payment method</legend>
                <div className="flex gap-3">
                  {[
                    ["upi", "UPI"],
                    ["card", "Card"],
                    ["cod", fulfilment === "pickup" ? "Pay at counter" : "Cash"],
                  ].map(([m, label]) => (
                    <button key={m} type="button" aria-pressed={paymentMethod === m} onClick={() => setPaymentMethod(m)} className={segment(paymentMethod === m)}>
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {paymentMethod === "upi" && (
                <Field id="co-upi" label="UPI ID" error={errors.upi}>
                  <input {...inputProps("co-upi", errors.upi)} placeholder="yourname@okbank" value={upi} onChange={(e) => setUpi(e.target.value)} />
                </Field>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <Field id="co-card" label="Card number" error={errors.number}>
                    <input
                      {...inputProps("co-card", errors.number)}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field id="co-exp" label="Expiry" error={errors.expiry}>
                      <input {...inputProps("co-exp", errors.expiry)} autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                    </Field>
                    <Field id="co-cvv" label="CVV" error={errors.cvv}>
                      <input {...inputProps("co-cvv", errors.cvv)} inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                    </Field>
                  </div>
                  <Field id="co-cardname" label="Name on card" error={errors.cardName}>
                    <input {...inputProps("co-cardname", errors.cardName)} autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                  </Field>
                </div>
              )}

              {paymentMethod === "cod" && <p className="text-sm text-charcoal-soft">Pay when you collect your order.</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className={btn.secondary}>
                  Back
                </button>
                <button type="button" onClick={placeOrder} disabled={processing} className={`${btn.primary} flex-1 py-3`}>
                  {processing && <Spinner />}
                  {processing ? "Placing order…" : `Place order · ${formatRupees(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="bg-paper border border-line rounded-xl p-5 lg:sticky lg:top-24">
          <h2 className="font-medium text-espresso mb-3">Your order</h2>
          <ul className="text-sm space-y-1.5 mb-4 pb-4 border-b border-line">
            {lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span className="text-charcoal">
                  {l.quantity} × {l.name}
                </span>
                <span className="text-charcoal-soft nums">{formatRupees(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <OrderSummary />
          {donation > 0 ? (
            <p className="mt-4 text-xs text-leaf leading-relaxed">{contributionNote(donation)}</p>
          ) : (
            <p className="mt-4 text-xs text-charcoal-soft leading-relaxed">
              Want to add a community meal? <Link to="/cart" className="underline underline-offset-2 hover:text-espresso">You can from your cart.</Link>
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
