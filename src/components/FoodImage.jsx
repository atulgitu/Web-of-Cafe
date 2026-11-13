import { useState } from "react";

const FALLBACK = "/placeholder-food.svg";

// Remote photos can fail (offline, blocked CDN); fall back to a neutral cup.
export default function FoodImage({ src, alt, className = "", eager = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? FALLBACK : src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`bg-cream-dim ${className}`}
    />
  );
}
