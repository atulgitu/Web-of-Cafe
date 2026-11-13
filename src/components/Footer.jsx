import { Link } from "react-router-dom";
import { CAFE } from "../data/site";
import Logo from "./Logo";

const columns = [
  {
    title: "Café",
    links: [
      { to: "/menu", label: "Menu" },
      { to: "/offers", label: "Offers" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Food rescue",
    links: [
      { to: "/rescue", label: "Tonight's surplus" },
      { to: "/impact", label: "Impact" },
      { to: "/contact", label: "Become a community partner" },
    ],
  },
  {
    title: "Project",
    links: [
      { to: "/about", label: "About the café" },
      { to: "/about#forecast", label: "How the forecast works" },
      { to: "/about#status", label: "What's real and what's sample data" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-cream-dim/60 mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="sm:col-span-2 md:col-span-1">
          <Logo size={28} />
          <p className="text-sm text-charcoal-soft mt-4">{CAFE.address}</p>
          <dl className="text-sm mt-3 space-y-0.5">
            {CAFE.hoursText.map((h) => (
              <div key={h.days} className="flex gap-3">
                <dt className="text-charcoal-soft w-20 shrink-0">{h.days}</dt>
                <dd className="text-charcoal nums whitespace-nowrap">{h.time}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm mt-3">
            <a href={`tel:${CAFE.phone.replace(/\s/g, "")}`} className="inline-block py-1 text-charcoal-soft hover:text-espresso">
              {CAFE.phone}
            </a>
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-xs font-semibold tracking-[0.14em] uppercase text-espresso mb-3">{col.title}</h2>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="inline-block py-0.5 text-charcoal-soft hover:text-espresso transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-charcoal-soft flex flex-col sm:flex-row sm:justify-between gap-2">
          <p>Built as a student project exploring how technology can help cafés reduce food waste.</p>
          <p>Partner organisations and impact figures are sample data · © 2026 Coffee Cinnamon</p>
        </div>
      </div>
    </footer>
  );
}
