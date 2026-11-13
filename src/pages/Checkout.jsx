import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import OrderSummary from "../components/OrderSummary";
import { Spinner } from "../components/ui";
import { CAFE } from "../data/site";
import { useAuth, useCart } from "../hooks/useAppContext";
import useOnline from "../hooks/useOnline";
import useQuote from "../hooks/useQuote";
import { api } from "../lib/api";
import { formatRupees } from "../lib/format";
import { canOrderNow, pickupSlots } from "../lib/hours";
import { rememberOrder } from "../lib/orders";
import { btn, container, field, focusFirstInvalid } from "../lib/styles";

const steps = ["Your details", "Review"];
// Same rule as the server: an Indian mobile number, with or without +91 / 0.
const MOBILE = /^(?:\+?91|0)?[6-9]\d{9}$/;
const ASAP = "asap";

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className={field.label}>
        {label}
        {hint && <span className="font-normal text-charcoal-soft"> {hint}</span>}
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
  "aria-invalid": Boolean(error),
  "aria-describedby": error ? `${id}-error` : undefined,
});

export default function Checkout() {
  const { lines, orderRequest, clearCart } = useCart();
  const { user } = useAuth();
  const { quote, error: quoteError, loading: quoting } = useQuote();
  const online = useOnline();
  const navigate = useNavigate();

  // Work the time options out once, when the page opens.
  const [slots] = useState(() => pickupSlots());
  const [asapAllowed] = useState(() => canOrderNow());

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    pickup: asapAllowed ? ASAP : slots[0]?.value || "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Set synchronously on the first click. The disabled button only takes effect after
  // React re-renders, so fast double clicks used to send several orders.
  const submitting = useRef(false);

  if (lines.length === 0 && !placing) return <Navigate to="/cart" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const pickupLabel = form.pickup === ASAP ? `As soon as possible (about ${CAFE.pickupMinutes} min)` : slots.find((s) => s.value === form.pickup)?.label;

  const validateDetails = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!MOBILE.test(form.phone.replace(/[\s-]/g, ""))) errs.phone = "Enter a 10-digit mobile number, like 98765 43210.";
    if (!form.pickup) errs.pickup = "Please choose a pickup time.";
    if (form.notes.length > 300) errs.notes = "Please keep notes under 300 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const placeOrder = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setSubmitError("");
    setPlacing(true);
    try {
      const { order } = await api("/orders", {
        method: "POST",
        body: {
          ...orderRequest,
          customer: { name: form.name.trim(), phone: form.phone },
          pickupAt: form.pickup === ASAP ? null : form.pickup,
          notes: form.notes.trim() || undefined,
        },
      });
      // Saved on the server first, then kept on this device for the confirmation page.
      rememberOrder(order);
      clearCart();
      navigate(`/order/${order.id}`, { replace: true, state: { order } });
    } catch (err) {
      submitting.current = false;
      setPlacing(false);
      setSubmitError(err.message || "We couldn't save your order. Please try again.");
      // The server names fields like "customer.phone"; show those on the details step.
      const f = err.fields || {};
      const details = { name: f["customer.name"], phone: f["customer.phone"], notes: f.notes, pickup: f.pickupAt };
      if (Object.values(details).some(Boolean)) {
        setErrors(details);
        setStep(1);
      }
    }
  };

  return (
    <div className={`${container} py-8 sm:py-10`}>
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
          {submitError && (
            <p role="alert" className="text-sm text-red-700 mb-4">
              {submitError}
            </p>
          )}

          {step === 1 && (
            <form
              noValidate
              aria-label="Your details"
              onSubmit={(e) => {
                e.preventDefault();
                if (validateDetails()) setStep(2);
                else focusFirstInvalid(e.currentTarget);
              }}
              className="space-y-5"
            >
              <p className="text-sm text-charcoal-soft">
                Pickup only, paid at the counter. You'll confirm the order by sending it to us on WhatsApp in the next step.
              </p>
              <Field id="co-name" label="Your name" error={errors.name}>
                <input {...inputProps("co-name", errors.name)} autoComplete="name" maxLength={80} value={form.name} onChange={set("name")} />
              </Field>
              <Field id="co-phone" label="Mobile number" hint="(so we can reach you about the order)" error={errors.phone}>
                <input {...inputProps("co-phone", errors.phone)} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={form.phone} onChange={set("phone")} />
              </Field>
              <Field id="co-pickup" label="Pickup time" error={errors.pickup}>
                <select {...inputProps("co-pickup", errors.pickup)} value={form.pickup} onChange={set("pickup")}>
                  {asapAllowed && <option value={ASAP}>As soon as possible (about {CAFE.pickupMinutes} min)</option>}
                  {slots.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {!asapAllowed && <p className="text-xs text-charcoal-soft mt-1">We're closed right now, so the earliest time is when we next open.</p>}
              </Field>
              <Field id="co-notes" label="Notes" hint="(optional)" error={errors.notes}>
                <textarea
                  {...inputProps("co-notes", errors.notes)}
                  className={`${field.input} resize-y`}
                  rows={2}
                  maxLength={300}
                  placeholder="Allergies, who's collecting, anything else"
                  value={form.notes}
                  onChange={set("notes")}
                />
              </Field>
              <button type="submit" className={`${btn.primary} w-full py-3`}>
                Review order
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-medium text-espresso">Check your order</h2>
              <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <dt className="text-charcoal-soft">Name</dt>
                <dd className="text-charcoal break-words">{form.name.trim()}</dd>
                <dt className="text-charcoal-soft">Mobile</dt>
                <dd className="text-charcoal nums">{form.phone}</dd>
                <dt className="text-charcoal-soft">Pickup</dt>
                <dd className="text-charcoal">{pickupLabel}</dd>
                <dt className="text-charcoal-soft">Payment</dt>
                <dd className="text-charcoal">At the counter when you collect</dd>
                <dt className="text-charcoal-soft">Notes</dt>
                <dd className="text-charcoal break-words">{form.notes.trim() || "None"}</dd>
              </dl>
              <button type="button" onClick={() => setStep(1)} className={btn.link}>
                Change details
              </button>

              <div className="border-t border-line pt-4 text-sm text-charcoal leading-relaxed">
                <p className="font-medium text-espresso">What happens next</p>
                <ol className="mt-2 space-y-1 list-decimal pl-5 text-charcoal-soft">
                  <li>We save your order and give it an order number.</li>
                  <li>WhatsApp opens with the order typed out, addressed to Coffee Cinnamon ({CAFE.phone}).</li>
                  <li>You press Send. The kitchen starts once we've seen your message.</li>
                </ol>
              </div>

              {quoteError && (
                <p role="alert" className="text-sm text-red-700">
                  {quoteError.message}{" "}
                  <Link to="/cart" className="underline underline-offset-2">
                    Fix it in your cart
                  </Link>
                </p>
              )}
              {!online && <p className="text-sm text-caramel-dark">You're offline. Reconnect to place your order.</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className={btn.secondary}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={placing || !online || !quote || quoting || Boolean(quoteError) || Boolean(quote?.couponError)}
                  className={`${btn.primary} flex-1 py-3`}
                >
                  {placing && <Spinner />}
                  {placing ? "Saving your order…" : quote ? `Place order · ${formatRupees(quote.total)}` : "Calculating…"}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="bg-paper border border-line rounded-xl p-5 lg:sticky lg:top-24" aria-labelledby="co-summary">
          <h2 id="co-summary" className="font-medium text-espresso mb-3">
            Your order
          </h2>
          <ul className="text-sm space-y-1.5 mb-4 pb-4 border-b border-line">
            {lines.map((l, i) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span className="text-charcoal min-w-0 break-words">
                  {l.quantity} × {l.name}
                </span>
                <span className="text-charcoal-soft nums shrink-0">{quote ? formatRupees(quote.lines[i]?.lineTotal ?? 0) : ""}</span>
              </li>
            ))}
          </ul>
          <OrderSummary quote={quote} loading={quoting} />
          <p className="mt-4 text-xs text-charcoal-soft">
            <Link to="/cart" className="underline underline-offset-2 hover:text-espresso">
              Edit cart
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
