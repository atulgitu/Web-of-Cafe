import { Link } from "react-router-dom";
import { Eyebrow } from "../components/ui";
import { ASSUMPTIONS } from "../data/site";
import { btn, container } from "../lib/styles";

const status = [
  {
    heading: "Working in this prototype",
    tone: "text-leaf",
    items: [
      "Menu, cart, coupons and a three-step checkout (payment is simulated)",
      "Optional meal contribution at checkout, counted on the impact page",
      "Surplus listings with pickup windows, best-before times and statuses",
      "Partner reservations, releases and pickup confirmation",
      "Staff listing form and partner suggestions for each listing",
      "Impact totals calculated from individual pickups",
    ],
  },
  {
    heading: "Simulated",
    tone: "text-caramel-dark",
    items: [
      "Sales history, partners and pickups are demo data",
      "The forecast is a statistical baseline, not a trained model",
      "Partner matching uses hand-set weights, not learned ones",
      "Login, roles and payments run entirely in the browser",
      "A fixed demo clock (Tuesday evening) keeps every page consistent",
    ],
  },
  {
    heading: "What a real version would need",
    tone: "text-charcoal-soft",
    items: [
      "A backend and database, with real staff and partner accounts",
      "Point-of-sale integration so sales history updates itself",
      "A forecasting model trained on months of data, with weather, holidays and local events",
      "Learning match weights from which pickups actually happened",
      "SMS or WhatsApp alerts to partners when food is listed",
      "Food-safety checks agreed with each partner (temperatures, labelling, allergens)",
    ],
  },
];

export default function About() {
  return (
    <div>
      <section className={`${container} pt-12 pb-16 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-end`}>
        <div>
          <Eyebrow>About the project</Eyebrow>
          <h1 className="font-serif-display text-4xl sm:text-5xl text-espresso mt-3 leading-[1.08]">
            A café that tries to make the right amount, and has a plan for the rest.
          </h1>
        </div>
        <p className="text-charcoal-soft leading-relaxed lg:pb-2">
          Brew &amp; Care is a college project. We took a working café ordering site and asked what it would take for the
          same system to cut food waste and get leftovers to people who need them. This page explains what we built, what's
          simulated, and where it falls short.
        </p>
      </section>

      <div className={`${container} grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16`}>
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-2 text-sm">
            {[
              ["problem", "The problem"],
              ["approach", "Our approach"],
              ["ai", "Where the “AI” is"],
              ["impact", "Social impact"],
              ["limitations", "Limitations"],
              ["status", "What's real"],
            ].map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-charcoal-soft hover:text-espresso">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-2xl space-y-16 text-charcoal leading-relaxed">
          <section id="problem" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">The problem</h2>
            <p>
              Food businesses regularly prepare more than they sell. A café has to have sandwiches in the cabinet at 8 AM and
              rice ready at noon, before it knows how many people will come. Most plan with fixed daily amounts that barely
              change, so on a quiet day the extra goes in the bin.
            </p>
            <p className="mt-3">
              At the same time, community kitchens and shelters a few kilometres away are short of food. The food exists; the
              problem is timing and coordination. Leftovers are usually only noticed at closing, when it's too late to arrange
              a pickup.
            </p>
          </section>

          <section id="approach" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">Our approach</h2>
            <ol className="space-y-3 list-decimal pl-5 marker:text-caramel-dark">
              <li>
                <strong className="font-medium">Make less surplus.</strong> Forecast tomorrow's demand from recent sales and prep
                closer to it.
              </li>
              <li>
                <strong className="font-medium">List surplus early.</strong> Staff list leftovers as soon as the rush ends, with a
                pickup window and a best-before time.
              </li>
              <li>
                <strong className="font-medium">Match it to the right partner.</strong> Suggest who can actually use it and get
                there in time.
              </li>
              <li>
                <strong className="font-medium">Count what happened.</strong> Impact figures come from completed pickups, so they
                can't drift away from reality.
              </li>
            </ol>
            <p className="mt-4">Customers keep ordering as normal. They can add a small contribution at checkout if they want to.</p>
          </section>

          <section id="ai" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">Where the “AI” is, honestly</h2>
            <p>
              The prototype has two decision-support features. Neither is a trained machine-learning model yet. Both are
              simple, explainable baselines, written so a real model could replace them later without changing the rest of
              the app.
            </p>
            <h3 className="font-medium text-espresso mt-6">1. Demand forecast</h3>
            <p className="mt-1">
              For each category it takes the last four same weekdays (for example, the last four Wednesdays) and weights recent
              weeks more: 10%, 20%, 30%, 40%. It then adjusts for the trend over the last seven days, capped at ±10%. The
              spread of those four days gives a likely range. The suggested prep is the forecast plus half that margin.
            </p>
            <p className="mt-2 text-sm text-charcoal-soft">
              Code: <code className="text-xs bg-cream-dim px-1 py-0.5 rounded">src/lib/forecast.js</code>, called through{" "}
              <code className="text-xs bg-cream-dim px-1 py-0.5 rounded">src/services/forecastService.js</code> so it can be
              swapped for an API.
            </p>
            <h3 className="font-medium text-espresso mt-6">2. Surplus matching</h3>
            <p className="mt-1">
              For each partner it checks dietary rules first (a vegetarian kitchen never gets chicken). It then scores four
              things: how much of the listing they still need (40%), whether their collection window overlaps the pickup
              deadline (25%), distance (20%) and, for food close to its best-before, who can come soonest (15%). Staff see the
              score and the reasons, and make the final call.
            </p>
            <p className="mt-2 text-sm text-charcoal-soft">
              Code: <code className="text-xs bg-cream-dim px-1 py-0.5 rounded">src/lib/matching.js</code>
            </p>
          </section>

          <section id="impact" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">Social impact</h2>
            <p>
              Even a small café throws away a noticeable amount of food each week. Under the old fixed prep plan in our demo
              data, roughly a fifth to a quarter of sandwiches, pastries and meals went unsold each day. The forecast aims to
              shrink that number, and the rescue board makes sure what's left is eaten.
            </p>
            <p className="mt-3">
              Contributions at checkout are estimated at about ₹{ASSUMPTIONS.mealCost} per community meal. It's a useful,
              low-pressure way for customers to help, and they can always choose not to.
            </p>
            <Link to="/impact" className={`${btn.link} inline-block mt-3`}>
              See the impact numbers →
            </Link>
          </section>

          <section id="limitations" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">Limitations</h2>
            <ul className="space-y-2 list-disc pl-5 marker:text-line">
              <li>Four weeks of history is too little to capture holidays, exams, rain or festivals, all of which change café demand a lot.</li>
              <li>The forecast works by category, not by individual item, and it can't predict one-off events.</li>
              <li>Matching uses straight-line distance and assumes partners' collection windows are fixed.</li>
              <li>The CO₂ figure is an order-of-magnitude estimate with a single average factor.</li>
              <li>Food safety (holding temperatures, allergen labelling, liability) needs agreements we haven't modelled.</li>
              <li>Everything runs in the browser. Data lives in localStorage, so it's per device and can be reset.</li>
            </ul>
          </section>

          <section id="status" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-6">What's real, what's simulated, what's next</h2>
            <div className="space-y-8">
              {status.map((s) => (
                <div key={s.heading}>
                  <h3 className={`text-sm font-semibold uppercase tracking-wide ${s.tone}`}>{s.heading}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-charcoal-soft list-disc pl-5 marker:text-line">
                    {s.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
