import { formatTime, formatWindow, minutesUntil } from "../../lib/format";
import { StatusBadge, Tag, VegMark } from "../ui";

// One surplus listing. `children` holds whatever actions the current role has.
// Order of information follows what a partner needs first: food, quantity, deadline, place.
export default function ListingCard({ listing, children, compact = false }) {
  const deadline = new Date(listing.pickupEnd) < new Date(listing.bestBefore) ? listing.pickupEnd : listing.bestBefore;
  const left = minutesUntil(deadline);
  const urgent = listing.status === "available" && left > 0 && left <= 120;
  // Still marked available, but the food's best-before time has passed.
  const expired = listing.status === "available" && minutesUntil(listing.bestBefore) <= 0;
  const unit = listing.category === "Bakery" ? "pieces" : "portions";

  return (
    <article className={`bg-paper border rounded-xl ${listing.status === "collected" ? "border-line/70 opacity-90" : "border-line"} ${compact ? "p-4" : "p-4 sm:p-5"}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-start gap-2 font-serif-display text-lg text-espresso leading-snug min-w-0 [&>span:first-child]:mt-1.5">
          <VegMark veg={listing.veg} />
          {/* wraps instead of cutting long names off ("Butter & Chocolate Croiss…") */}
          <span className="min-w-0 break-words">{listing.item}</span>
        </h3>
        <StatusBadge status={expired ? "expired" : listing.status} />
      </div>

      <div className="mt-3 flex items-baseline gap-2 flex-wrap">
        <span className="font-serif-display text-3xl text-espresso nums">{listing.portions}</span>
        <span className="text-sm text-charcoal-soft">{unit}</span>
        {listing.preparedNote && <span className="text-sm text-charcoal-soft">· {listing.preparedNote}</span>}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-charcoal-soft">Pickup window</dt>
          <dd className="text-charcoal nums">{formatWindow(listing.pickupStart, listing.pickupEnd)}</dd>
        </div>
        <div>
          <dt className="text-xs text-charcoal-soft">Best before</dt>
          <dd className={`nums ${urgent ? "text-caramel-dark font-medium" : "text-charcoal"}`}>{formatTime(listing.bestBefore)}</dd>
        </div>
        {!compact && (
          <div className="col-span-2">
            <dt className="text-xs text-charcoal-soft">Where</dt>
            <dd className="text-charcoal">{listing.location}</dd>
          </div>
        )}
        {listing.partnerName && (
          <div className="col-span-2">
            <dt className="text-xs text-charcoal-soft">{listing.status === "collected" ? "Collected by" : "Reserved by"}</dt>
            <dd className="text-charcoal">
              {listing.partnerName}
              {listing.partnerDistanceKm != null && <span className="text-charcoal-soft"> · ~{listing.partnerDistanceKm} km</span>}
            </dd>
          </div>
        )}
      </dl>

      {urgent && <p className="mt-3 text-sm font-medium text-caramel-dark">Pickup before {formatTime(deadline)}</p>}

      {!compact && listing.dietary.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {listing.dietary.map((d) => (
            <Tag key={d}>{d}</Tag>
          ))}
        </div>
      )}

      {expired ? (
        <p className="mt-4 pt-4 border-t border-line text-sm text-charcoal-soft">Past its best-before time, so it can no longer be reserved.</p>
      ) : (
        children && <div className="mt-4 pt-4 border-t border-line flex flex-wrap items-center gap-2">{children}</div>
      )}
    </article>
  );
}
