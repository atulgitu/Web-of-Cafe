// Coffee Cinnamon wordmark: a plain cup with a cinnamon curl for steam.
export default function Logo({ variant = "dark", size = 30, showWordmark = true }) {
  const ink = variant === "light" ? "#FAF6EF" : "#3B2A20";
  const spice = variant === "light" ? "#E3B98F" : "#9A5F31";

  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <path d="M9 19h17v5.5a7.5 7.5 0 01-7.5 7.5h-2A7.5 7.5 0 019 24.5V19z" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M26 20.5h1.8a3.4 3.4 0 010 6.8H25.6" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M7.5 35h20" stroke={ink} strokeWidth="2" strokeLinecap="round" />
        <path d="M17.5 15.5c-2.6 0-3.6-2.4-2.2-4 1.4-1.6 4-1 4 1.1 0 1.2-1.3 1.8-2 1" fill="none" stroke={spice} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {showWordmark && (
        <span className="font-serif-display tracking-tight leading-none whitespace-nowrap" style={{ color: ink, fontSize: size * 0.62 }}>
          Coffee <span className="italic" style={{ color: spice }}>Cinnamon</span>
        </span>
      )}
    </span>
  );
}
