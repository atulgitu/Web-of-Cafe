import { useState } from "react";
import useApi from "../hooks/useApi";
import { useToast } from "../hooks/useAppContext";
import { api } from "../lib/api";
import { formatRupees, formatTime } from "../lib/format";
import { ORDER_STATUSES, statusLabel } from "../lib/orders";
import { btn, field } from "../lib/styles";
import { ErrorState, Skeleton } from "./ui";

const open = (o) => !["completed", "cancelled"].includes(o.status);

// Staff: today's orders and anything still open, with a status for each.
// New website orders start as "Waiting for WhatsApp confirmation" until the
// customer's message arrives on the café's WhatsApp.
export default function OrdersPanel() {
  const { data, error, loading, reload } = useApi("/orders/today");
  const [showDone, setShowDone] = useState(false);

  if (error && !data) return <ErrorState title="We couldn't load orders." error={error} onRetry={reload} />;
  if (!data) return <Skeleton className="h-48 rounded-xl" />;

  const orders = showDone ? data.orders : data.orders.filter(open);
  return (
    <div className={loading ? "opacity-70 transition-opacity" : ""}>
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
        <label className="flex items-center gap-2 text-charcoal-soft min-h-9">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} className="w-4 h-4 accent-caramel-dark" />
          Show collected and cancelled
        </label>
        <button type="button" onClick={reload} className={`${btn.small} ml-auto`}>
          Refresh
        </button>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-charcoal-soft border border-dashed border-line rounded-xl px-5 py-8 text-center">No open orders.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} onChanged={reload} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderRow({ order, onChanged }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const digits = order.phone.replace(/\D/g, "");

  const setStatus = async (status) => {
    setSaving(true);
    try {
      await api(`/orders/${order.id}/status`, { method: "PATCH", body: { status } });
      showToast(`${order.code}: ${statusLabel(status)}`);
      onChanged();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="py-4 grid gap-3 sm:grid-cols-[1fr_auto] text-sm">
      <div className="min-w-0">
        <p className="font-medium text-espresso">
          {order.code} <span className="font-normal text-charcoal-soft">· {formatTime(order.createdAt)} · {formatRupees(order.total)}</span>
        </p>
        <p className="text-charcoal break-words">
          {order.customerName} ·{" "}
          <a href={`tel:+${digits}`} className="underline underline-offset-2 nums">
            {order.phone}
          </a>
        </p>
        <p className="text-charcoal-soft break-words">{order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
        <p className="text-charcoal-soft">Pickup: {order.pickupAt ? formatTime(order.pickupAt) : "as soon as possible"}</p>
        {order.notes && <p className="text-charcoal-soft italic break-words">“{order.notes}”</p>}
      </div>
      <div className="sm:w-56">
        <label htmlFor={`status-${order.id}`} className="sr-only">
          Status of {order.code}
        </label>
        <select
          id={`status-${order.id}`}
          value={ORDER_STATUSES.some((s) => s.id === order.status) ? order.status : "confirmed"}
          disabled={saving}
          onChange={(e) => setStatus(e.target.value)}
          className={`${field.input} ${order.status === "pending" ? "border-caramel" : ""}`}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}
