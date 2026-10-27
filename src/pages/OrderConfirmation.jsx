import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useRescue } from "../hooks/useAppContext";
import { formatRupees } from "../lib/format";
import { contributionNote } from "../lib/impact";
import { btn, container } from "../lib/styles";

const trackerStages = ["Order placed", "Preparing", "Ready", "Completed"];

function readLastOrder() {
  try {
    return JSON.parse(sessionStorage.getItem("brewcare_last_order"));
  } catch {
    return null;
  }
}

export default function OrderConfirmation() {
  const [order] = useState(readLastOrder);
  const [stageIndex, setStageIndex] = useState(0);
  const { today } = useRescue();

  useEffect(() => {
    if (!order) return;
    const timers = [setTimeout(() => setStageIndex(1), 1500), setTimeout(() => setStageIndex(2), 3500)];
    return () => timers.forEach(clearTimeout);
  }, [order]);

  if (!order) return <Navigate to="/profile" replace />;

  return (
    <div className={`${container} max-w-2xl py-14`}>
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-leaf">Order {order.id}</p>
      <h1 className="font-serif-display text-3xl sm:text-4xl text-espresso mt-2">Thanks — we're on it.</h1>
      <p className="text-charcoal-soft mt-2">
        {order.fulfilment === "pickup" ? "Collect from the front counter" : "Out for delivery"} in about {order.prepTime}.
      </p>

      <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Order progress">
        {trackerStages.map((stage, i) => (
          <li key={stage} aria-current={i === stageIndex ? "step" : undefined}>
            <div className={`h-1 rounded-full transition-colors duration-500 ${i <= stageIndex ? "bg-leaf" : "bg-line"}`} />
            <p className={`mt-2 text-xs ${i <= stageIndex ? "text-espresso font-medium" : "text-charcoal-soft"}`}>{stage}</p>
          </li>
        ))}
      </ol>

      {order.donation > 0 && (
        <section className="mt-8 rounded-xl bg-leaf-soft/70 border border-leaf/20 p-5">
          <h2 className="font-medium text-leaf">Thank you for the {formatRupees(order.donation)} contribution.</h2>
          <p className="text-sm text-charcoal mt-1 leading-relaxed">
            {contributionNote(order.donation)} It goes to the same partner kitchens that collect our surplus — {today.rescued} meals
            have already gone out today.
          </p>
        </section>
      )}

      <section className="mt-8 border-t border-line pt-6">
        <h2 className="sr-only">Order details</h2>
        <ul className="space-y-2 text-sm">
          {order.lines.map((line) => (
            <li key={line.key} className="flex justify-between gap-3">
              <span className="text-charcoal">
                {line.quantity} × {line.name} <span className="text-charcoal-soft">({line.size})</span>
              </span>
              <span className="text-charcoal-soft nums">{formatRupees(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
          {order.donation > 0 && (
            <li className="flex justify-between gap-3 text-leaf">
              <span>Community meal contribution</span>
              <span className="nums">{formatRupees(order.donation)}</span>
            </li>
          )}
        </ul>
        <p className="mt-4 pt-3 border-t border-line flex justify-between font-semibold text-espresso">
          <span>Paid</span>
          <span className="nums">{formatRupees(order.total)}</span>
        </p>
        {order.fulfilment === "delivery" && <p className="text-sm text-charcoal-soft mt-3">Delivering to {order.customer.address}</p>}
      </section>

      <div className="flex flex-col sm:flex-row gap-3 mt-10">
        <Link to="/menu" className={`${btn.secondary} flex-1 py-3`}>
          Order something else
        </Link>
        <Link to="/profile" className={`${btn.primary} flex-1 py-3`}>
          View your orders
        </Link>
      </div>
    </div>
  );
}
