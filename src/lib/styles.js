// Shared Tailwind class strings, so buttons and fields look the same everywhere.

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

export const btn = {
  primary: `${btnBase} bg-espresso text-cream px-5 py-2.5 hover:bg-espresso-light`,
  secondary: `${btnBase} border border-espresso/20 text-espresso px-5 py-2.5 hover:bg-cream-dim`,
  leaf: `${btnBase} bg-leaf text-white px-5 py-2.5 hover:bg-[#33492F]`,
  small: `${btnBase} border border-line bg-paper text-espresso px-3.5 py-1.5 hover:border-espresso/30`,
  link: "text-sm font-medium text-caramel-dark underline-offset-4 hover:underline",
};

export const field = {
  input:
    "w-full px-3.5 py-2.5 rounded-lg border border-line bg-paper text-sm text-charcoal placeholder:text-charcoal-soft/60 focus:outline-none focus:ring-2 focus:ring-caramel/50 focus:border-caramel",
  label: "block text-sm font-medium text-charcoal mb-1.5",
  error: "text-xs text-red-700 mt-1",
};

export const container = "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8";
