import { getPartner } from "../../data/partners";
import { formatTime, formatWindow } from "../../lib/format";
import { StatusBadge, Tag, VegMark } from "../ui";

// One surplus listing. `children` holds whatever actions the current role has.
export default function ListingCard({ listing, now, children, compact = false }) {
  const partner = listing.partnerId ? getPartner(listing.partnerId) : null;
  const deadline = Math.min(listing.pickupEnd, listing.bestBefore);
  const minutesLeft = deadline - now;
  const urgent = listing.status === "available" && minutesLeft > 0 && minutesLeft <= 120;
  const unit = listing.category === "Bakery" ? "pieces" : "portions";

  return (
    <article
      className={`bg-paper border rounded-xl transition-colors ${
        listing.status === "collected" ? "border-line/70 bg-paper/60" : "border-line"
      } ${compact ? "p-4" : "p-5"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-serif-display text-lg text-espresso leading-snug">
            <VegMark veg={listing.veg} />
            <span className="truncate">{listing.item}</span>
          </h3>
          <p className="text-sm text-charcoal-soft mt-0.5">{listing.prepared}</p>
        </div>
        <StatusBadge status={listing.status} />
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-serif-display text-3xl text-espresso nums">{listing.portions}</span>
        <span className="text-sm text-charcoal-soft">{unit}</span>
        {urgent && <span className="ml-auto text-xs font-medium text-caramel-dark">Pickup before {formatTime(deadline)}</span>}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-charcoal-soft">Pickup</dt>
          <dd className="text-charcoal nums">{formatWindow(listing.pickupStart, listing.pickupEnd)}</dd>
        </div>
        <div>
          <dt className="text-xs text-charcoal-soft">Best before</dt>
          <dd className="text-charcoal nums">{formatTime(listing.bestBefore)}</dd>
        </div>
        {!compact && (
          <div className="col-span-2">
            <dt className="text-xs text-charcoal-soft">Where</dt>
            <dd className="text-charcoal">Back counter, Brew &amp; Care Indiranagar</dd>
          </div>
        )}
        {partner && (
          <div className="col-span-2">
            <dt className="text-xs text-charcoal-soft">{listing.status === "collected" ? "Collected by" : "Reserved by"}</dt>
            <dd className="text-charcoal">
              {partner.name} <span className="text-charcoal-soft">· {partner.distanceKm} km</span>
            </dd>
          </div>
        )}
      </dl>

      {!compact && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {listing.dietary.map((d) => (
            <Tag key={d}>{d}</Tag>
          ))}
        </div>
      )}

      {children && <div className="mt-5 pt-4 border-t border-line flex flex-wrap items-center gap-2">{children}</div>}
    </article>
  );
}
