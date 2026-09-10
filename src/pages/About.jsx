const team = [
  { name: "Arjun Nair", role: "Founder & Head Roaster", initials: "AN" },
  { name: "Meera Pillai", role: "Head Barista", initials: "MP" },
  { name: "Farhan Sheikh", role: "Kitchen Lead", initials: "FS" },
];

const values = [
  { title: "Quality over shortcuts", text: "We roast in small batches every week rather than buying pre-roasted beans in bulk." },
  { title: "Honest pricing", text: "No hidden service charges — the price on the menu is what you pay." },
  { title: "A neighbourhood feel", text: "We know most of our regulars by their order, not their name on an app." },
];

export default function About() {
  return (
    <div>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <span className="text-xs font-semibold tracking-wide uppercase text-caramel-dark">Our Story</span>
        <h1 className="font-serif-display text-3xl sm:text-4xl text-espresso mt-2 max-w-xl">
          Started with one filter, one kettle, and a lot of stubbornness.
        </h1>
        <div className="mt-6 grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-charcoal-soft text-sm leading-relaxed">
            <p>
              Brew & Bean opened its doors in 2019 in a small 400 sq. ft. space in Indiranagar, with a single filter
              coffee setup and a handful of regulars from the office next door. What started as a lunchtime coffee
              counter slowly grew into a full café — but the filter coffee is still made the same way it was on day one.
            </p>
            <p>
              We work with a small estate in Chikmagalur for our beans and roast in batches small enough to finish
              within two weeks, because we'd rather run out of a blend than serve it stale. The menu has grown to
              include cold brews, teas and a short but carefully tested food menu, but everything is still made
              to order in our open kitchen.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80"
            alt="Brew & Bean café interior"
            className="rounded-2xl w-full h-64 object-cover"
          />
        </div>
      </section>

      <section className="bg-cream-dim py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif-display text-2xl text-espresso mb-8">What we care about</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title}>
                <h3 className="font-medium text-espresso mb-1.5">{v.title}</h3>
                <p className="text-sm text-charcoal-soft leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-serif-display text-2xl text-espresso mb-8">The team behind the counter</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {team.map((t) => (
            <div key={t.name} className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-caramel/20 text-caramel-dark font-serif-display text-lg flex items-center justify-center mb-3">
                {t.initials}
              </div>
              <p className="font-medium text-charcoal">{t.name}</p>
              <p className="text-sm text-charcoal-soft">{t.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
