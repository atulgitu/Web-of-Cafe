import { useState } from "react";
import { Link } from "react-router-dom";
import ActivityFeed from "../components/rescue/ActivityFeed";
import { DemoNote, ErrorState, PageHeader, Skeleton, Stat } from "../components/ui";
import WeeklyChart from "../components/WeeklyChart";
import useApi from "../hooks/useApi";
import { formatKg, formatNumber, formatRupees } from "../lib/format";
import { btn, container } from "../lib/styles";

const periods = [
  { id: "week", label: "This week", note: "Since Monday" },
  { id: "month", label: "This month", note: "Since the 1st" },
  { id: "all", label: "All time", note: "Since the pilot began" },
];

export default function Impact() {
  const [period, setPeriod] = useState("all");
  const { data, error, loading, reload } = useApi(`/impact?period=${period}`);
  const activity = useApi("/impact/activity?limit=8");
  const active = periods.find((p) => p.id === period);

  return (
    <div className={`${container} py-8 sm:py-10`}>
      <PageHeader eyebrow="Impact" title="What the pilot has rescued so far.">
        Measured numbers are counted from completed pickups and saved orders in our database. The two estimates are marked as
        such.
      </PageHeader>

      <DemoNote className="mb-6 max-w-2xl">
        Sample data. Coffee Cinnamon is a student prototype, so the partners, past pickups and contributions on this page are demo
        records. The totals are genuinely calculated from those records, and anything you do in the demo changes them.
      </DemoNote>

      <div className="flex flex-wrap items-center gap-2 mb-6" role="group" aria-label="Time period">
        {periods.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={period === x.id}
            onClick={() => setPeriod(x.id)}
            className={`min-h-10 sm:min-h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
              period === x.id ? "bg-espresso text-cream border-espresso" : "border-line bg-paper text-charcoal-soft hover:text-espresso"
            }`}
          >
            {x.label}
          </button>
        ))}
        <span className="text-xs text-charcoal-soft ml-1">{active.note}</span>
      </div>

      {error && !data ? (
        <ErrorState title="We couldn't load the impact numbers." error={error} onRetry={reload} />
      ) : !data ? (
        <Skeleton className="h-28" />
      ) : (
        <div className={`transition-opacity ${loading ? "opacity-60" : ""}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-soft">Measured</p>
          <dl className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 border-y border-line py-6">
            <Stat label="Meals rescued" value={formatNumber(data.measured.mealsRescued)} tone="leaf" />
            <Stat label="Food kept out of the bin" value={formatKg(data.measured.kgRescued)} />
            <Stat label="Successful pickups" value={formatNumber(data.measured.pickups)} />
            <Stat label={`Customer contributions (${formatNumber(data.measured.contributionsCount)})`} value={formatRupees(data.measured.contributionsAmount)} />
          </dl>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-soft mt-6">Estimates</p>
          <dl className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 py-4 border-b border-dashed border-line">
            <Stat label="CO₂e avoided (estimate)" value={`≈ ${formatNumber(data.estimates.co2eKg)} kg`} />
            <Stat label="Community meals potentially funded (estimate)" value={`≈ ${formatNumber(data.estimates.mealsFunded)}`} />
          </dl>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-12 mt-14">
        <section aria-labelledby="weekly-heading">
          <h2 id="weekly-heading" className="font-serif-display text-2xl text-espresso">
            Meals rescued each week
          </h2>
          <p className="text-sm text-charcoal-soft mb-6">The first weeks were slow while partners learned the pickup routine.</p>
          {data ? <WeeklyChart series={data.weekly} /> : <Skeleton className="h-48" />}
        </section>

        <section aria-labelledby="partners-heading" className="lg:border-l lg:border-line lg:pl-10">
          <h2 id="partners-heading" className="font-serif-display text-2xl text-espresso">
            Where it went
          </h2>
          <p className="text-sm text-charcoal-soft mb-5">
            {data ? `${data.measured.activePartners} active partners · ` : ""}meals received in the last 30 days
          </p>
          {data && data.byPartner.every((p) => p.meals === 0) && (
            <p className="text-sm text-charcoal-soft">No pickups have been completed in the last 30 days.</p>
          )}
          {data && (
            <ul className="space-y-4">
              {data.byPartner.map((p) => (
                <li key={p.id}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-charcoal">
                      {p.name} <span className="text-charcoal-soft">· {p.type.toLowerCase()}</span>
                    </span>
                    <span className="text-charcoal nums">{p.meals}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-cream-dim overflow-hidden">
                    <div className="h-full rounded-full bg-sage" style={{ width: `${(p.meals / Math.max(1, ...data.byPartner.map((x) => x.meals))) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mt-16">
        <section aria-labelledby="journey-heading">
          <h2 id="journey-heading" className="font-serif-display text-2xl text-espresso mb-5">
            Recent activity
          </h2>
          {activity.data ? <ActivityFeed events={activity.data.activity} /> : <Skeleton className="h-40" />}
          <Link to="/rescue" className={`${btn.link} inline-block mt-5`}>
            Open the rescue board →
          </Link>
        </section>

        <section aria-labelledby="counting-heading">
          <h2 id="counting-heading" className="font-serif-display text-2xl text-espresso mb-5">
            How we count
          </h2>
          <ul className="text-sm text-charcoal-soft space-y-2 leading-relaxed list-disc pl-5 marker:text-line">
            <li>A meal is one portion handed over and confirmed as collected. Reserved-but-not-collected food doesn't count.</li>
            <li>Weight comes from each item's standard portion weight, not weighing on the day.</li>
            <li>
              CO₂e uses a rough average of {data?.estimates.assumptions.co2PerKgFood ?? 2.5} kg per kg of food not wasted. Real
              figures vary a lot by food type — treat it as an order of magnitude.
            </li>
            <li>
              "Meals potentially funded" assumes a partner kitchen spends about ₹{data?.estimates.assumptions.mealCostRupees ?? 45} per
              meal. We haven't verified this with each partner.
            </li>
            <li>Partner organisations and the pre-pilot history are demo data.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
