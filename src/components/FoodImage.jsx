import { useState } from "react";

// Shown only if a photo fails to load: a plain cup outline on the café's cream,
// never another product's photo.
const FALLBACK = "/placeholder-food.svg";

// Product photos are stored in the project (public/menu, public/images) as small WebP
// files. width/height let the browser reserve the space before the image arrives,
// so the layout doesn't jump; the CSS classes decide the size actually shown.
export default function FoodImage({ src, alt, className = "", eager = false, width = 640, height = 480 }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? FALLBACK : src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`bg-cream-dim ${className}`}
    />
  );
}
