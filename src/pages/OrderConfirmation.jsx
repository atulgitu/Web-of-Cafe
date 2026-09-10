import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const trackerStages = ["Order Placed", "Preparing", "Ready", "Completed"];

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem("brewbean_last_order");
    if (!raw) {
      navigate("/");
      return;
    }
    setOrder(JSON.parse(raw));
  }, [navigate]);

  useEffect(() => {
    if (!order) return;
    const timers = [
      setTimeout(() => setStageIndex(1), 1500),
      setTimeout(() => setStageIndex(2), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [order]);

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-sage/15 flex items-center justify-center mb-4 animate-pop">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage-dark)" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-serif-display text-3xl text-espresso">Your order is confirmed!</h1>
        <p className="text-charcoal-soft text-sm mt-2">Order ID: <span className="font-medium text-espresso">{order.id}</span></p>
      </div>

      <div className="bg-white border border-line rounded-xl p-6 mb-6">
        <h2 className="font-medium text-espresso mb-4">Order status</h2>
        <div className="flex items-center">
          {trackerStages.map((stage, i) => (
            <div key={stage} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    i <= stageIndex ? "bg-sage-dark text-white" : "bg-cream-dim text-charcoal-soft"
                  }`}
                >
                  {i <= stageIndex ? "✓" : i + 1}
                </div>
                <span className={`text-[11px] text-center leading-tight ${i <= stageIndex ? "text-espresso font-medium" : "text-charcoal-soft"}`}>
                  {stage}
                </span>
              </div>
              {i < trackerStages.length - 1 && (
                <div className={`h-px flex-1 -mt-4 ${i < stageIndex ? "bg-sage-dark" : "bg-line"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal-soft">{order.fulfilment === "pickup" ? "Pickup" : "Delivery"}</span>
          <span className="font-medium text-espresso">ETA {order.prepTime}</span>
        </div>
        {order.fulfilment === "delivery" && (
          <p className="text-sm text-charcoal-soft">{order.customer.address}</p>
        )}
        <div className="border-t border-line pt-4 space-y-2">
          {order.items.map((line) => (
            <div key={line.key} className="flex justify-between text-sm">
              <span className="text-charcoal">
                {line.quantity}× {line.name} <span className="text-charcoal-soft">({line.size})</span>
              </span>
              <span className="text-charcoal-soft">₹{line.unitPrice * line.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-line pt-3 flex justify-between font-semibold text-espresso">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Link to="/menu" className="flex-1 text-center px-5 py-3 rounded-full border border-line text-charcoal-soft font-medium hover:bg-cream-dim transition-colors">
          Order More
        </Link>
        <Link to="/profile" className="flex-1 text-center px-5 py-3 rounded-full bg-espresso text-cream font-medium hover:bg-espresso-light transition-colors">
          View Orders
        </Link>
      </div>
    </div>
  );
}
