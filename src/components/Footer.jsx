import { Link } from "react-router-dom";
import { CAFE } from "../data/site";
import Logo from "./Logo";

const columns = [
  {
    title: "Café",
    links: [
      { to: "/menu", label: "Menu" },
      { to: "/offers", label: "Offers" },
      { to: "/cart", label: "Your cart" },
      { to: "/contact", label: "Contact & hours" },
    ],
  },
  {
    title: "Food rescue",
    links: [
      { to: "/rescue", label: "Today's surplus" },
      { to: "/impact", label: "Impact" },
      { to: "/partner", label: "For community partners" },
      { to: "/dashboard", label: "For café staff" },
    ],
  },
  {
    title: "Project",
    links: [
      { to: "/about", label: "How it works" },
      { to: "/about#limitations", label: "What's simulated" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-cream-dim/60 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo size={28} />
          <p className="text-sm text-charcoal-soft leading-relaxed mt-3 max-w-xs">
            A neighbourhood café in Indiranagar that plans its kitchen around real demand and sends what's left to people
            who can use it.
          </p>
          <p className="text-sm text-charcoal-soft mt-4">
            {CAFE.address}
            <br />
            {CAFE.phone}
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-xs font-semibold tracking-[0.14em] uppercase text-espresso mb-3">{col.title}</h2>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-charcoal-soft hover:text-espresso transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-charcoal-soft">
          © 2026 Brew &amp; Care · A college project prototype. Partner organisations and figures are illustrative demo data.
        </p>
      </div>
    </footer>
  );
}
