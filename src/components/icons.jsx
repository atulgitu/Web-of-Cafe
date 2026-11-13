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

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-4.5v-6h-5v6H5a1 1 0 01-1-1v-9.5z" strokeLinejoin="round" />
  </svg>
);

export const CupIcon = () => (
  <svg {...base}>
    <path d="M5 9h12v4.5A5.5 5.5 0 0111.5 19h-1A5.5 5.5 0 015 13.5V9z" />
    <path d="M17 10.5h1.2a2.3 2.3 0 010 4.6H17" />
    <path d="M9 5.5c.5-1 0-1.6.4-2.5M12.5 5.5c.5-1 0-1.6.4-2.5" strokeLinecap="round" />
  </svg>
);

export const BagHeartIcon = () => (
  <svg {...base}>
    <path d="M4.5 8h15l-1 12a1 1 0 01-1 .9h-11a1 1 0 01-1-.9l-1-12z" strokeLinejoin="round" />
    <path d="M12 17.5s-3-1.8-3-3.7c0-1 .8-1.8 1.7-1.8.6 0 1 .3 1.3.7.3-.4.7-.7 1.3-.7.9 0 1.7.8 1.7 1.8 0 1.9-3 3.7-3 3.7z" />
    <path d="M9 8V6.5a3 3 0 016 0V8" strokeLinecap="round" />
  </svg>
);

export const ChartIcon = () => (
  <svg {...base}>
    <path d="M4 20h16" strokeLinecap="round" />
    <path d="M7 16v-5M12 16V7M17 16v-8" strokeLinecap="round" strokeWidth="2.4" />
  </svg>
);

export const ClipboardIcon = () => (
  <svg {...base}>
    <rect x="5" y="5" width="14" height="16" rx="2" />
    <path d="M9 5V3.5h6V5M9 11h6M9 15h4" strokeLinecap="round" />
  </svg>
);
