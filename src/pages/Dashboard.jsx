import { useEffect, useState } from "react";
import ActivityFeed from "../components/rescue/ActivityFeed";
import ListingCard from "../components/rescue/ListingCard";
import ListingForm from "../components/rescue/ListingForm";
import MatchList from "../components/rescue/MatchList";
import RoleGate from "../components/RoleGate";
import { DemoNote, PageHeader, Skeleton, Stat } from "../components/ui";
import { demandHistory } from "../data/demand";
import { DEMO_DAY } from "../data/site";
import { useRescue, useToast } from "../hooks/useAppContext";
import { formatTime } from "../lib/format";
import { btn, container } from "../lib/styles";
import { getTomorrowForecast } from "../services/forecastService";

// Average daily leftovers under the old fixed prep plan, from the same history the forecast uses.
const wasteInsights = demandHistory
  .filter((c) => !c.madeToOrder)
  .map((c) => {
    const days = c.sold.flatMap((week) => week.map((sold, d) => ({ sold, made: c.parLevel[d] })));
    const leftover = days.reduce((s, d) => s + d.made - d.sold, 0) / days.length;
    const made = days.reduce((s, d) => s + d.made, 0) / days.length;
    return { label: c.label, unit: c.unit, leftover: Math.round(leftover), pct: Math.round((leftover / made) * 100) };
  });

export default function Dashboard() {
  return (
    <RoleGate role="staff" why="It shows tomorrow's prep forecast, today's surplus and partner matching for the kitchen team.">
      <StaffDashboard />
    </RoleGate>
  );
}

function StaffDashboard() {
  const { listings, clock, today, activity, markCollected } = useRescue();
  const { showToast } = useToast();
  const [forecast, setForecast] = useState(null);
  const [newListingId, setNewListingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getTomorrowForecast().then((f) => !cancelled && setForecast(f));
    return () => {
      cancelled = true;
    };
  }, []);

  const open = listings.filter((l) => l.status === "available");
  const reserved = listings.filter((l) => l.status === "reserved").sort((a, b) => a.pickupStart - b.pickupStart);

  return (
    <div className={`${container} py-10`}>
      <PageHeader
        eyebrow={`Café staff · ${DEMO_DAY.label}`}
        title="Kitchen dashboard"
        aside={
          <p className="text-sm text-charcoal-soft sm:text-right">
            Demo clock <span className="font-medium text-espresso nums">{formatTime(clock)}</span>
          </p>
        }
      >
        Plan tomorrow's prep, list what's left tonight, and keep an eye on pickups.
      </PageHeader>

      {/* FORECAST */}
      <section aria-labelledby="forecast-heading" className="mb-16">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 id="forecast-heading" className="font-serif-display text-2xl text-espresso">
              Tomorrow's forecast
            </h2>
            <p className="text-sm text-charcoal-soft">{DEMO_DAY.tomorrowShort} · based on the last four weeks of sales</p>
          </div>
        </div>

        {!forecast ? (
          <ForecastSkeleton />
        ) : (
          <>
            <div className="border border-line rounded-xl bg-paper overflow-hidden">
              <div className="hidden md:grid grid-cols-[1.3fr_0.8fr_0.8fr_1.2fr_1.3fr] gap-4 px-5 py-3 border-b border-line text-xs font-medium text-charcoal-soft">
                <span>Category</span>
                <span>Last {DEMO_DAY.tomorrow}</span>
                <span>Usual</span>
                <span>Forecast</span>
                <span>Prep plan</span>
              </div>
              <ul className="divide-y divide-line">
                {forecast.items.map((f) => (
                  <ForecastRow key={f.id} f={f} />
                ))}
              </ul>
            </div>

            <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-4 items-start">
              <p className="text-sm text-charcoal leading-relaxed max-w-2xl">
                Prepping to the forecast instead of the usual fixed amounts means about{" "}
                <strong className="font-semibold text-leaf">{forecast.totals.portionsSaved} fewer portions</strong> made tomorrow (
                {forecast.totals.recommendedPrep} instead of {forecast.totals.usualPrep}). On recent {DEMO_DAY.tomorrow}s the old plan
                left around {forecast.totals.avgOldWaste} portions unsold.
              </p>
              <DemoNote className="md:max-w-xs">
                {forecast.method}. Not a trained model — see About for how it works and what a real one would need.
              </DemoNote>
            </div>
          </>
        )}
      </section>

      <div className="grid lg:grid-cols-[1fr_320px] gap-12">
        <div className="space-y-14 min-w-0">
          {/* LIST SURPLUS */}
          <section aria-labelledby="list-heading">
            <h2 id="list-heading" className="font-serif-display text-2xl text-espresso mb-1">
              List tonight's surplus
            </h2>
            <p className="text-sm text-charcoal-soft mb-5">Takes about 20 seconds at the counter. Partners see it straight away.</p>
            <div className="border border-line rounded-xl bg-paper p-5">
              <ListingForm onCreated={setNewListingId} />
            </div>
          </section>

          {/* NEEDS A PARTNER */}
          <section aria-labelledby="match-heading">
            <h2 id="match-heading" className="font-serif-display text-2xl text-espresso mb-1">
              Needs a partner <span className="text-base font-sans text-charcoal-soft nums">({open.length})</span>
            </h2>
            <p className="text-sm text-charcoal-soft mb-5">
              Suggestions weigh quantity still needed, collection window, distance and how close the food is to its best-before.
            </p>
            {open.length === 0 ? (
              <p className="text-sm text-charcoal-soft border border-dashed border-line rounded-xl px-5 py-8 text-center">
                Everything listed is spoken for. Nice.
              </p>
            ) : (
              <div className="space-y-6">
                {open.map((l) => (
                  <div key={l.id} className={`grid md:grid-cols-2 gap-4 ${l.id === newListingId ? "animate-fade-in-up" : ""}`}>
                    <ListingCard listing={l} now={clock} compact />
                    <div className="border border-line rounded-xl p-4 bg-paper">
                      <MatchList listing={l} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* PICKUPS */}
          <section aria-labelledby="pickups-heading">
            <h2 id="pickups-heading" className="font-serif-display text-2xl text-espresso mb-5">
              Pickups booked
            </h2>
            {reserved.length === 0 ? (
              <p className="text-sm text-charcoal-soft">No pickups waiting.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {reserved.map((l) => (
                  <ListingCard key={l.id} listing={l} now={clock} compact>
                    <button
                      type="button"
                      onClick={() => {
                        markCollected(l.id);
                        showToast("Pickup confirmed");
                      }}
                      className={btn.primary}
                    >
                      Confirm pickup
                    </button>
                  </ListingCard>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-10">
          <section>
            <h2 className="font-medium text-espresso mb-4">Today so far</h2>
            <dl className="grid grid-cols-2 gap-5">
              <Stat label="Rescued" value={today.rescued} tone="leaf" />
              <Stat label="Waiting" value={today.available + today.reserved} />
            </dl>
          </section>

          <section aria-labelledby="waste-heading">
            <h2 id="waste-heading" className="font-medium text-espresso">
              Where waste came from
            </h2>
            <p className="text-xs text-charcoal-soft mt-1 mb-4">Average unsold per day under the old fixed prep, last 4 weeks.</p>
            <ul className="space-y-3">
              {wasteInsights.map((w) => (
                <li key={w.label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal">{w.label}</span>
                    <span className="text-charcoal-soft nums">
                      {w.leftover} {w.unit} · {w.pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-cream-dim overflow-hidden">
                    <div className="h-full bg-caramel/70 rounded-full" style={{ width: `${Math.min(100, w.pct * 3)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="dash-activity">
            <h2 id="dash-activity" className="font-medium text-espresso mb-4">
              Activity
            </h2>
            <ActivityFeed events={activity} limit={6} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function ForecastRow({ f }) {
  const range = `${f.low}–${f.high}`;
  return (
    <li className="px-5 py-4 md:grid md:grid-cols-[1.3fr_0.8fr_0.8fr_1.2fr_1.3fr] md:gap-4 md:items-start">
      <div>
        <p className="font-medium text-espresso">{f.label}</p>
        <p className="text-xs text-charcoal-soft mt-1 leading-relaxed md:max-w-[16rem]">{f.explanation}</p>
      </div>

      {/* On mobile the numbers sit in a compact row under the label */}
      <dl className="mt-3 grid grid-cols-3 gap-3 text-sm md:contents">
        <div className="md:pt-0.5">
          <dt className="text-xs text-charcoal-soft md:sr-only">Last {DEMO_DAY.tomorrow}</dt>
          <dd className="text-charcoal nums">{f.previous}</dd>
        </div>
        <div className="md:pt-0.5">
          <dt className="text-xs text-charcoal-soft md:sr-only">Usual</dt>
          <dd className="text-charcoal nums">{f.usual}</dd>
        </div>
        <div>
          <dt className="text-xs text-charcoal-soft md:sr-only">Forecast</dt>
          <dd>
            <span className="font-serif-display text-2xl text-espresso nums">{f.predicted}</span>
            <span className="block text-xs text-charcoal-soft nums">
              likely {range} · {f.confidence.toLowerCase()} confidence
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-3 md:mt-0 text-sm">
        {f.madeToOrder ? (
          <p className="text-charcoal-soft">
            Made to order. Stock milk and beans for about <span className="text-charcoal nums">{f.high}</span> {f.unit}.
          </p>
        ) : (
          <>
            <p className="text-charcoal">
              Prep <span className="font-semibold nums">{f.recommendedPrep}</span>{" "}
              <span className="text-charcoal-soft">
                instead of <span className="line-through nums">{f.usualPrep}</span>
              </span>
            </p>
            <p className="text-xs text-leaf mt-0.5 nums">
              {f.portionsSaved} fewer {f.unit} · ~{f.expectedLeftover} spare
            </p>
          </>
        )}
      </div>
    </li>
  );
}

function ForecastSkeleton() {
  return (
    <div className="border border-line rounded-xl bg-paper p-5 space-y-5" aria-busy="true" aria-label="Loading forecast">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="grid grid-cols-[1.3fr_0.8fr_0.8fr_1.2fr_1.3fr] gap-4 items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
