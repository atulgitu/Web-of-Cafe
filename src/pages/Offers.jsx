import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";
import { btn, container } from "../lib/styles";

const offers = [
  {
    title: "Student combo",
    code: "STUDENT10",
    text: "10% off your order. Show your college ID at pickup.",
    when: "All day, every day",
    applies: true,
  },
  {
    title: "Weekend treat",
    code: "CINNAMON20",
    text: "20% off the whole bill on Saturdays and Sundays.",
    when: "Sat – Sun",
    applies: true,
  },
  {
    title: "Morning coffee combo",
    text: "Any regular coffee with a veg grilled sandwich for ₹240. It's on the menu under Breakfast.",
    when: "Before 11 AM",
  },
  {
    title: "Evening bakery",
    text: "After 8 PM, whatever's left in the bakery cabinet is ₹20 off. What still doesn't sell goes to our partners.",
    when: "After 8 PM, in the café",
  },
];

export default function Offers() {
  return (
    <div className={`${container} py-10 max-w-4xl`}>
      <PageHeader eyebrow="Offers" title="A few ways to pay a little less.">
        Codes can be applied in your cart.
      </PageHeader>

      <ul className="divide-y divide-line border-y border-line">
        {offers.map((o) => (
          <li key={o.title} className="py-5 grid sm:grid-cols-[1fr_auto] gap-3 sm:items-center">
            <div>
              <h2 className="font-medium text-espresso">{o.title}</h2>
              <p className="text-sm text-charcoal-soft mt-1 leading-relaxed">{o.text}</p>
              <p className="text-xs text-charcoal-soft mt-2">{o.when}</p>
            </div>
            {o.code && (
              <span className="justify-self-start sm:justify-self-end font-mono text-sm px-3 py-1.5 rounded-md border border-dashed border-caramel/60 text-caramel-dark">
                {o.code}
              </span>
            )}
          </li>
        ))}
      </ul>

      <Link to="/menu" className={`${btn.primary} mt-8`}>
        Start an order
      </Link>
    </div>
  );
}
