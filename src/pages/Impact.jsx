import { useState } from "react";
import { Link } from "react-router-dom";
import ActivityFeed from "../components/rescue/ActivityFeed";
import { PageHeader, Stat } from "../components/ui";
import WeeklyChart from "../components/WeeklyChart";
import { partners } from "../data/partners";
import { CURRENT_WEEK, pickupLog } from "../data/rescue";
import { ASSUMPTIONS, CAFE, DEMO_DAY } from "../data/site";
import { useRescue } from "../hooks/useAppContext";
import { formatKg, formatNumber, formatRupees } from "../lib/format";
import { btn, container } from "../lib/styles";

const periods = [
  { id: "week", label: "This week", note: `Since Monday ${CURRENT_WEEK}` },
  { id: "month", label: "October", note: "Weeks starting in October" },
  { id: "allTime", label: "All time", note: `Since ${CAFE.pilotStarted}` },
];

export default function Impact() {
  const { impact, activity, listings } = useRescue();
  const [period, setPeriod] = useState("allTime");
  const p = impact[period];
  const activePeriod = periods.find((x) => x.id === period);

  // Where food went over the detailed log (last 9 days, including today).
  const byPartner = partners
    .map((pt) => ({
      ...pt,
      meals:
        pickupLog.filter((r) => r.partnerId === pt.id).reduce((s, r) => s + r.portions, 0) +
        listings.filter((l) => l.status === "collected" && l.partnerId === pt.id).reduce((s, l) => s + l.portions, 0),
    }))
    .sort((a, b) => b.meals - a.meals);
  const maxMeals = Math.max(...byPartner.map((x) => x.meals));

  return (
    <div className={`${container} py-10`}>
      <PageHeader eyebrow="Impact" title="What the pilot has rescued so far.">
        Every number here is counted from individual pickups — portions handed over and signed for — not estimated from sales.
        The two estimates (CO₂ and meals funded) are marked.
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2 mb-6" role="group" aria-label="Time period">
        {periods.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={period === x.id}
            onClick={() => setPeriod(x.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              period === x.id ? "bg-espresso text-cream border-espresso" : "border-line bg-paper text-charcoal-soft hover:text-espresso"
            }`}
          >
            {x.label}
          </button>
        ))}
        <span className="text-xs text-charcoal-soft ml-1">{activePeriod.note}</span>
      </div>

      <dl key={period} className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 border-y border-line py-6 animate-fade-in">
        <Stat label="Meals rescued" value={formatNumber(p.meals)} tone="leaf" />
        <Stat label="Food kept out of the bin" value={formatKg(p.kg)} />
        <Stat label="Successful pickups" value={p.pickups} />
        <Stat label="CO₂e avoided (estimate)" value={`≈ ${formatNumber(p.kg * ASSUMPTIONS.co2PerKg)} kg`} />
      </dl>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-12 mt-14">
        <section aria-labelledby="weekly-heading">
          <h2 id="weekly-heading" className="font-serif-display text-2xl text-espresso">
            Meals rescued each week
          </h2>
          <p className="text-sm text-charcoal-soft mb-6">
            The first weeks were slow while partners learned the pickup routine. The current week is still in progress.
          </p>
          <WeeklyChart series={impact.series} highlight={CURRENT_WEEK} />
        </section>

        <section aria-labelledby="community-heading" className="lg:border-l lg:border-line lg:pl-10">
          <h2 id="community-heading" className="font-serif-display text-2xl text-espresso">
            From customers
          </h2>
          <dl className="mt-5 space-y-5">
            <Stat label={`contributions added at checkout (${formatNumber(impact.contributions.count)} orders)`} value={formatRupees(impact.contributions.amount)} />
            <Stat label={`community meals that could fund, at about ₹${ASSUMPTIONS.mealCost} each (estimate)`} value={`≈ ${formatNumber(impact.mealsFunded)}`} />
          </dl>
          <Link to="/menu" className={`${btn.secondary} mt-6`}>
            Add one with your next order
          </Link>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mt-16">
        <section aria-labelledby="partners-heading">
          <h2 id="partners-heading" className="font-serif-display text-2xl text-espresso">
            Where it went
          </h2>
          <p className="text-sm text-charcoal-soft mb-5">
            {impact.activePartners} active partners · meals received over the last 9 days
          </p>
          <ul className="space-y-4">
            {byPartner.map((pt) => (
              <li key={pt.id}>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-charcoal">
                    {pt.name} <span className="text-charcoal-soft">· {pt.type.toLowerCase()}</span>
                  </span>
                  <span className="text-charcoal nums">{pt.meals}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-cream-dim overflow-hidden">
                  <div className="h-full rounded-full bg-sage" style={{ width: `${(pt.meals / maxMeals) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="journey-heading">
          <h2 id="journey-heading" className="font-serif-display text-2xl text-espresso">
            Today, step by step
          </h2>
          <p className="text-sm text-charcoal-soft mb-5">{DEMO_DAY.label}</p>
          <ActivityFeed events={activity} limit={7} />
          <Link to="/rescue" className={`${btn.link} inline-block mt-5`}>
            Open the rescue board →
          </Link>
        </section>
      </div>

      <section aria-labelledby="counting-heading" className="mt-16 border-t border-line pt-8 grid md:grid-cols-[0.6fr_1.4fr] gap-6">
        <h2 id="counting-heading" className="font-medium text-espresso">
          How we count
        </h2>
        <ul className="text-sm text-charcoal-soft space-y-2 leading-relaxed list-disc pl-5 marker:text-line">
          <li>A meal is one portion handed over: one sandwich, one bowl, or one pastry. Pastries are small, so weight is the fairer comparison.</li>
          <li>Weight comes from the standard portion weight of each item, not weighing on the day.</li>
          <li>
            CO₂e uses a rough average of {ASSUMPTIONS.co2PerKg} kg per kg of food not wasted. Real figures vary a lot by food type, so treat it as an
            order of magnitude.
          </li>
          <li>
            “Meals funded” assumes a partner kitchen spends about ₹{ASSUMPTIONS.mealCost} per meal. We haven't verified this with every partner.
          </li>
          <li>All partner organisations and numbers on this site are demo data for the prototype.</li>
        </ul>
      </section>
    </div>
  );
}
