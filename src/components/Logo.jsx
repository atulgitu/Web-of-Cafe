// Brew & Care mark: a cup with a single leaf rising in place of steam.
export default function Logo({ variant = "dark", size = 30, showWordmark = true }) {
  const ink = variant === "light" ? "#FAF6EF" : "#3B2A20";
  const leaf = variant === "light" ? "#C9D6BC" : "#3F5B3A";

  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <path d="M10 18h16v6a7 7 0 01-7 7h-2a7 7 0 01-7-7v-6z" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M26 19.5h2a3.5 3.5 0 010 7h-2.4" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M8 34.5h20" stroke={ink} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 15c-3.5-1.2-4.6-4.6-3.2-8.5 3.6.9 5.6 3.9 3.2 8.5z" fill={leaf} />
        <path d="M18 15c.9-2.6 2.6-4.2 5-5" fill="none" stroke={leaf} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {showWordmark && (
        <span className="font-serif-display tracking-tight leading-none" style={{ color: ink, fontSize: size * 0.64 }}>
          Brew <span className="italic font-normal">&amp;</span> Care
        </span>
      )}
    </span>
  );
}
