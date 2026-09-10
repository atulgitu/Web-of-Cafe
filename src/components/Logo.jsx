export default function Logo({ variant = "dark", size = 30, showWordmark = true }) {
  const ink = variant === "light" ? "#FAF6EF" : "#3B2A20";
  const mark = variant === "light" ? "#FAF6EF" : "#3B2A20";
  const markBg = variant === "light" ? "rgba(250,246,239,0.14)" : "rgba(192,133,82,0.16)";

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="19" fill={markBg} />
        <path
          d="M12 17h13v6.5a6 6 0 01-6 6h-1a6 6 0 01-6-6V17z"
          fill="none"
          stroke={mark}
          strokeWidth="1.8"
        />
        <path
          d="M25 18.5h2.2a3.4 3.4 0 010 6.8H25"
          fill="none"
          stroke={mark}
          strokeWidth="1.8"
        />
        <path
          d="M15.5 14c.6-1.4-.5-2-.1-3.4M20 14c.6-1.4-.5-2-.1-3.4"
          fill="none"
          stroke={mark}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span
          className="font-serif-display tracking-tight leading-none"
          style={{ color: ink, fontSize: size * 0.62 }}
        >
          Brew & Bean
        </span>
      )}
    </span>
  );
}
