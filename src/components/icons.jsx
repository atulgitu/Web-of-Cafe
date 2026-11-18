// The handful of icons the app uses. Stroke icons, sized by the parent's font colour.
const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true };

export const CartIcon = () => (
  <svg {...base} width={20} height={20}>
    <path d="M5 8h14l-1.2 11.2a2 2 0 01-2 1.8H8.2a2 2 0 01-2-1.8L5 8z" strokeLinejoin="round" />
    <path d="M9 8V6.5a3 3 0 016 0V8" strokeLinecap="round" />
  </svg>
);

export const UserIcon = () => (
  <svg {...base} width={20} height={20}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
  </svg>
);
