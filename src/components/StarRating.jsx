export default function StarRating({ rating, size = 14 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      <svg width={size} height={size} viewBox="0 0 20 20" fill="var(--color-caramel-dark)" aria-hidden="true">
        <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z" />
      </svg>
      <span className="text-xs font-medium text-charcoal-soft">{rating.toFixed(1)}</span>
    </span>
  );
}
