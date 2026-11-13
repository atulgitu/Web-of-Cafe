import { formatRupees } from "../lib/format";
import { Skeleton, SummaryRow } from "./ui";

// Totals as calculated by the server (POST /api/orders/quote).
export default function OrderSummary({ quote, loading }) {
  if (!quote) {
    return (
      <div className="space-y-2.5" aria-busy="true" aria-label="Calculating totals">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-full mt-3" />
      </div>
    );
  }
  return (
    <dl className={`space-y-2 text-sm transition-opacity ${loading ? "opacity-60" : ""}`}>
      <SummaryRow label="Subtotal" value={formatRupees(quote.subtotal)} />
      {quote.discount > 0 && <SummaryRow label={`Discount (${quote.coupon.code})`} value={`−${formatRupees(quote.discount)}`} tone="leaf" />}
      <SummaryRow label="Taxes (5%)" value={formatRupees(quote.tax)} />
      {quote.contribution > 0 && <SummaryRow label="Community meal contribution" value={formatRupees(quote.contribution)} tone="leaf" />}
      <SummaryRow label="Total" value={formatRupees(quote.total)} strong />
    </dl>
  );
}
