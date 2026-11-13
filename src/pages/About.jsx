import { Link } from "react-router-dom";
import { Eyebrow } from "../components/ui";
import { CAFE } from "../data/site";
import { btn, container } from "../lib/styles";

const status = [
  {
    id: "real",
    heading: "Real in this project",
    tone: "text-leaf",
    items: [
      "Node.js + Express REST API with a PostgreSQL database",
      "Accounts with hashed passwords, login tokens and role checks (customer, staff, partner)",
      "Orders priced and validated on the server, saved with their line items",
      "Contributions saved and counted, with or without an order",
      "Rescue listings, reservations, releases and completed pickups",
      "Impact totals calculated from completed-pickup records in the database",
      "Forecast and partner-matching logic running on our own server — no outside AI service",
      "Installable web app (PWA) with an offline-friendly shell",
    ],
  },
  {
    id: "prototype",
    heading: "Simplified or sample data",
    tone: "text-caramel-dark",
    items: [
      "There is no online payment: orders are paid at the counter on pickup",
      "Forecasting is a transparent statistical baseline, not a trained machine-learning model",
      "Matching weights are set by hand, not learned from outcomes",
      "Partner distances are typed in, not measured by a mapping service",
      "Partner organisations, sales history and past pickups are sample data",
      "CO₂e and meals-funded figures are rough estimates",
    ],
  },
  {
    id: "production",
    heading: "What a real deployment would need",
    tone: "text-charcoal-soft",
    items: [
      "A payment gateway and refunds",
      "Verified onboarding for community partners, with agreements on food safety and liability",
      "Real geolocation and travel times",
      "A forecasting model trained on months of point-of-sale data, weather and local events",
      "Notifications (SMS/WhatsApp) when food is listed",
      "Monitoring, backups and a proper security review",
    ],
  },
];

const sections = [
  ["cafe", "The café"],
  ["problem", "The problem"],
  ["approach", "Our approach"],
  ["forecast", "Demand forecasting"],
  ["matching", "Partner matching"],
  ["architecture", "How it's built"],
  ["limitations", "Limitations"],
  ["status", "What's real"],
];

const code = (text) => <code className="text-xs bg-cream-dim px-1 py-0.5 rounded">{text}</code>;

export default function About() {
  return (
    <div>
      <section className={`${container} pt-10 sm:pt-12 pb-14 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-end`}>
        <div>
          <Eyebrow>About Coffee Cinnamon</Eyebrow>
          <h1 className="font-serif-display text-4xl sm:text-5xl text-espresso mt-3 leading-[1.08]">
            A café that tries to cook the right amount, and has a plan for the rest.
          </h1>
        </div>
        <p className="text-charcoal-soft leading-relaxed lg:pb-2">
          Coffee Cinnamon is a café invented for a college project. The website is real and working: you can order from the menu,
          and the kitchen can forecast tomorrow's cooking and pass unsold food to community partners. This page describes the café,
          then explains how each part works and what is still simplified.
        </p>
      </section>

      <div className={`${container} grid lg:grid-cols-[200px_1fr] gap-10 lg:gap-16`}>
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-2 text-sm">
            {sections.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="text-charcoal-soft hover:text-espresso">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-2xl space-y-16 text-charcoal leading-relaxed">
          <section id="cafe" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">The café</h2>
            <p>
              We're a small counter-service café on 5th Cross in {CAFE.area}, Bengaluru. Mornings are filter coffee and breakfast.
              At lunch the kitchen cooks rajma chawal, pulao and wraps, and the croissants and banana bread are baked before we
              open. Most food is made in small batches, so on a busy day the croissants can be gone by four.
            </p>
            <p className="mt-3">
              You can order ahead on this site and collect from the front counter about {CAFE.pickupMinutes} minutes later, or just
              walk in. In the evening, whatever hasn't sold is listed for community kitchens and shelters nearby to collect from
              the side entrance.
            </p>
            <dl className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm border-y border-line py-4">
              <div>
                <dt className="font-medium text-espresso">Where</dt>
                <dd className="text-charcoal-soft mt-0.5">{CAFE.address}</dd>
              </div>
              <div>
                <dt className="font-medium text-espresso">Open</dt>
                {CAFE.hoursText.map((h) => (
                  <dd key={h.days} className="text-charcoal-soft mt-0.5 nums">
                    {h.days}: {h.time}
                  </dd>
                ))}
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/menu" className={btn.primary}>
                See the menu
              </Link>
              <Link to="/contact" className={btn.secondary}>
                Contact us
              </Link>
            </div>
          </section>

          <section id="problem" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">The problem</h2>
            <p>
              Cafés have to prepare food before they know how many customers will come. Most plan with fixed daily amounts, so
              on a quiet day the extra sandwiches, pastries and rice go in the bin.
            </p>
            <p className="mt-3">
              Meanwhile community kitchens and shelters a few kilometres away could use that food. The problem is timing and
              coordination: leftovers are usually only noticed at closing, when it's too late to arrange a pickup.
            </p>
          </section>

          <section id="approach" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">Our approach</h2>
            <ol className="space-y-3 list-decimal pl-5 marker:text-caramel-dark">
              <li><strong className="font-medium">Make less surplus.</strong> Forecast tomorrow's demand from recent sales and prepare closer to it.</li>
              <li><strong className="font-medium">List surplus early.</strong> Staff list leftovers as soon as a rush ends, with a pickup window and best-before time.</li>
              <li><strong className="font-medium">Match it to the right partner.</strong> Suggest who can use it and get there in time.</li>
              <li><strong className="font-medium">Count what actually happened.</strong> Impact numbers come only from pickups confirmed as collected.</li>
            </ol>
          </section>

          <section id="forecast" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">Demand forecasting</h2>
            <p>
              For each category, the server takes the last four values for the same weekday — say, the last four Wednesdays —
              and weights recent weeks more: 10%, 20%, 30%, 40%. It multiplies that by the trend over the last seven days
              compared with the seven before, capped at ±10% so one odd week can't swing the plan.
            </p>
            <p className="mt-3">
              The spread of those four days gives a likely range. The recommended preparation is the forecast plus half that
              margin, as a buffer against running out. The same history always gives the same answer, and each forecast is
              stored with the exact inputs used, so it can be checked by hand.
            </p>
            <p className="mt-3 text-sm text-charcoal-soft">
              Code: {code("server/src/services/forecastService.js")}. A trained model could replace it later without changing
              the rest of the app.
            </p>
          </section>

          <section id="matching" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">Surplus matching</h2>
            <p>
              Dietary rules come first: a vegetarian-only kitchen is never offered chicken. Each remaining partner gets a
              score from four factors: how much of the listing they still need (40%), whether their collection window fits
              before the food's deadline (25%), distance (20%), and — for food close to its best-before — who can come
              soonest (15%).
            </p>
            <p className="mt-3">
              Staff see the score and the reasons ("2.1 km away", "Can collect from 7:00 PM", "Still needs 18 portions") and
              make the final decision. The score shown at the time is saved with the pickup.
            </p>
            <p className="mt-3 text-sm text-charcoal-soft">Code: {code("server/src/services/matchingService.js")}</p>
          </section>

          <section id="architecture" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">How it's built</h2>
            <p>
              The app is a React progressive web app that talks to our own REST API (Node.js + Express). The API stores
              everything in PostgreSQL: users, menu, orders, contributions, rescue listings, pickups, sales history, forecasts
              and an append-only log of impact events. No external AI service is used — the forecast and matching run inside
              our server.
            </p>
            <p className="mt-3">
              Prices are always recalculated on the server, so changing a price in the browser has no effect. Staff and
              partner actions are checked against the signed-in account's role on every request.
            </p>
          </section>

          <section id="limitations" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-3">Limitations</h2>
            <ul className="space-y-2 list-disc pl-5 marker:text-line">
              <li>Four weeks of history is too little to capture holidays, exams, rain or festivals.</li>
              <li>The forecast works by category, not by individual dish, and it can't anticipate one-off events.</li>
              <li>Matching uses fixed collection windows and approximate distances.</li>
              <li>The CO₂e figure uses a single average factor and is only an order of magnitude.</li>
              <li>Food safety (holding temperatures, allergen labelling, liability) needs agreements this project doesn't cover yet.</li>
            </ul>
          </section>

          <section id="status" className="scroll-mt-24">
            <h2 className="font-serif-display text-2xl text-espresso mb-6">What's real, what's simplified, what's next</h2>
            <div className="space-y-8">
              {status.map((s) => (
                <div key={s.id}>
                  <h3 className={`text-sm font-semibold uppercase tracking-wide ${s.tone}`}>{s.heading}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-charcoal-soft list-disc pl-5 marker:text-line">
                    {s.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link to="/impact" className={`${btn.link} inline-block mt-8`}>
              See the impact numbers →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
