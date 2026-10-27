import { useCart } from "../hooks/useAppContext";
import { formatRupees } from "../lib/format";
import { SummaryRow } from "./ui";

export default function OrderSummary() {
  const { subtotal, discount, coupon, tax, donation, total } = useCart();
  return (
    <dl className="space-y-2 text-sm">
      <SummaryRow label="Subtotal" value={formatRupees(subtotal)} />
      {discount > 0 && <SummaryRow label={`Discount (${coupon.code})`} value={`−${formatRupees(discount)}`} tone="leaf" />}
      <SummaryRow label="Taxes (5%)" value={formatRupees(tax)} />
      {donation > 0 && <SummaryRow label="Community meal contribution" value={formatRupees(donation)} tone="leaf" />}
      <SummaryRow label="Total" value={formatRupees(total)} strong />
    </dl>
  );
}
