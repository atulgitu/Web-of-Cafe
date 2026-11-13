import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { EmptyState, ErrorState, Skeleton } from "../components/ui";
import { CAFE } from "../data/site";
import useApi from "../hooks/useApi";
import { useAuth } from "../hooks/useAppContext";
import { contributionNote, formatRupees, formatTime } from "../lib/format";
import { findRecentOrder, statusLabel } from "../lib/orders";
import { btn, container } from "../lib/styles";
import { lineOptions, orderMessage, pickupText, whatsappUrl } from "../lib/whatsapp";

export default function OrderConfirmation() {
  const { id } = useParams();
  const { user, checking } = useAuth();
  // Straight after checkout the order arrives with the navigation; after a refresh
  // it comes from this device's recent orders; signed-in customers can also load it.
  const local = useLocation().state?.order ?? findRecentOrder(id);
  const remote = useApi(!local && user ? `/orders/${id}` : null);
  const order = local ?? remote.data?.order;

  if (!order) {
    if (checking || remote.loading) {
      return (
        <div className={`${container} max-w-2xl py-14 space-y-4`} aria-busy="true">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      );
    }
    return (
      <div className={`${container} max-w-2xl py-14`}>
        <h1 className="sr-only">Order</h1>
        {remote.error ? (
          <ErrorState title="We couldn't load this order." error={remote.error} onRetry={remote.reload} />
        ) : (
          <EmptyState
            title="We can't show this order here."
            action={
              <a href={whatsappUrl("Hello Coffee Cinnamon, I have a question about my order.")} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                Message us on WhatsApp
              </a>
            }
          >
            Orders are only shown on the device they were placed from, or when you're logged in to the account that placed them.
          </EmptyState>
        )}
      </div>
    );
  }

  return <OrderDetails order={order} />;
}

function OrderDetails({ order }) {
  const [copied, setCopied] = useState(false);
  const message = orderMessage(order);
  const pending = order.status === "pending";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`${container} max-w-2xl py-12 sm:py-14`}>
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-caramel-dark">Order {order.code}</p>
      {pending ? (
        <>
          <h1 className="font-serif-display text-3xl sm:text-4xl text-espresso mt-2">Your order is ready to send.</h1>
          <p className="text-charcoal mt-3 leading-relaxed">
            Send it to Coffee Cinnamon on WhatsApp to confirm. We start making it once your message reaches us.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" className={`${btn.leaf} py-3 px-6`}>
              <WhatsAppMark />
              Confirm on WhatsApp
            </a>
            <button type="button" onClick={copy} className={`${btn.secondary} py-3`}>
              {copied ? "Message copied" : "Copy the message"}
            </button>
          </div>
          <p className="text-xs text-charcoal-soft mt-3 leading-relaxed" aria-live="polite">
            Opens a chat with {CAFE.phone}, with your order typed in. Press <strong className="font-medium">Send</strong> in WhatsApp.
            {copied && " Copied: you can also paste it into WhatsApp yourself."}
          </p>
        </>
      ) : (
        <>
          <h1 className="font-serif-display text-3xl sm:text-4xl text-espresso mt-2">{statusLabel(order.status)}</h1>
          <p className="text-charcoal-soft mt-2">Placed {formatTime(order.createdAt)}.</p>
        </>
      )}

      <details className="mt-8 group">
        <summary className="cursor-pointer text-sm font-medium text-espresso min-h-8 flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform" aria-hidden="true">›</span>
          See the WhatsApp message
        </summary>
        <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm text-charcoal bg-paper border border-line rounded-lg p-4">{message}</pre>
      </details>

      <section className="mt-8 border-t border-line pt-6" aria-labelledby="order-items">
        <h2 id="order-items" className="sr-only">
          Order details
        </h2>
        <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 mb-5">
          <dt className="text-charcoal-soft">Pickup</dt>
          <dd className="text-charcoal">
            {pickupText(order)} · front counter,{" "}
            {CAFE.address.split(",").slice(0, 2).join(",")}
          </dd>
          <dt className="text-charcoal-soft">Payment</dt>
          <dd className="text-charcoal">At the counter when you collect</dd>
        </dl>
        <ul className="space-y-2 text-sm">
          {order.items.map((line, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span className="text-charcoal min-w-0 break-words">
                {line.quantity} × {line.name}
                {lineOptions(line).length > 0 && <span className="text-charcoal-soft"> ({lineOptions(line).join(", ")})</span>}
              </span>
              <span className="text-charcoal-soft nums shrink-0">{formatRupees(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 pt-3 border-t border-line space-y-1.5 text-sm">
          {order.discount > 0 && (
            <div className="flex justify-between text-leaf">
              <dt>Discount ({order.couponCode})</dt>
              <dd className="nums">−{formatRupees(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-charcoal-soft">
            <dt>Tax (5%)</dt>
            <dd className="nums">{formatRupees(order.tax)}</dd>
          </div>
          {order.contribution > 0 && (
            <div className="flex justify-between text-leaf">
              <dt>Community meal contribution</dt>
              <dd className="nums">{formatRupees(order.contribution)}</dd>
            </div>
          )}
          <div className="flex justify-between font-semibold text-espresso text-base pt-1">
            <dt>Total, to pay at the counter</dt>
            <dd className="nums">{formatRupees(order.total)}</dd>
          </div>
        </dl>
        {order.contribution > 0 && <p className="text-xs text-leaf mt-3">{contributionNote(order.contribution)}</p>}
      </section>

      <div className="flex flex-col sm:flex-row gap-3 mt-10">
        <Link to="/menu" className={`${btn.secondary} flex-1 py-3`}>
          Back to the menu
        </Link>
      </div>
    </div>
  );
}

// WhatsApp's speech-bubble mark, drawn simply in the button's own colour.
function WhatsAppMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.7-1.2 2.1 2.1 0 00.2-1.2c-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}
