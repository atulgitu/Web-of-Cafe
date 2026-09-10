const offers = [
  {
    title: "Morning Coffee Combo",
    code: "MORNING",
    text: "Any regular coffee + a grilled sandwich for ₹240, available till 11 AM every day.",
    tag: "Daily · Before 11 AM",
  },
  {
    title: "Student Combo",
    code: "STUDENT10",
    text: "Show your student ID and get 10% off on combo orders above ₹200.",
    tag: "All day, every day",
  },
  {
    title: "Buy 2 Get 1",
    code: "B2G1",
    text: "Order any 2 cold drinks and get a third one free — mix and match.",
    tag: "Weekdays only",
  },
  {
    title: "Weekend Special",
    code: "BREW20",
    text: "20% off your total bill on weekends when you order 3 or more items.",
    tag: "Sat – Sun",
  },
];

export default function Offers() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif-display text-3xl text-espresso">Offers</h1>
        <p className="text-charcoal-soft text-sm mt-1">Apply these codes at checkout or in your cart.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {offers.map((o) => (
          <div key={o.title} className="bg-white border border-line rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-medium text-espresso">{o.title}</h2>
              <span className="text-xs font-mono px-2 py-1 rounded bg-cream-dim text-caramel-dark whitespace-nowrap">{o.code}</span>
            </div>
            <p className="text-sm text-charcoal-soft mt-2 leading-relaxed">{o.text}</p>
            <p className="text-xs text-charcoal-soft mt-3 uppercase tracking-wide">{o.tag}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
