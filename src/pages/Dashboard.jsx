import { useState } from "react";
import ActivityFeed from "../components/rescue/ActivityFeed";
import OrdersPanel from "../components/OrdersPanel";
import ListingCard from "../components/rescue/ListingCard";
import ListingForm from "../components/rescue/ListingForm";
import MatchList from "../components/rescue/MatchList";
import RoleGate from "../components/RoleGate";
import { Note, ErrorState, PageHeader, Skeleton, Spinner, Stat } from "../components/ui";
import useApi from "../hooks/useApi";
import { useToast } from "../hooks/useAppContext";
import useOnline from "../hooks/useOnline";
import { api } from "../lib/api";
import { formatDate, formatRupees, formatTime } from "../lib/format";
import { btn, container } from "../lib/styles";

export default function Dashboard() {
  return (
    <RoleGate role="STAFF" why="It shows today's orders, tomorrow's prep forecast, tonight's surplus and partner matching for the kitchen team.">
      <StaffDashboard />
    </RoleGate>
  );
}

function StaffDashboard() {
  const dash = useApi("/dashboard");
  const forecast = useApi("/forecast");
  const messages = useApi("/contact");
  const { showToast } = useToast();
  const online = useOnline();
  const [regenerating, setRegenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const regenerate = async () => {
    setRegenerating(true);
    try {
      await api("/forecast/generate", { method: "POST" });
      forecast.reload();
      dash.reload();
      showToast("Forecast updated from the latest sales history");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRegenerating(false);
    }
  };

  const complete = async (id) => {
    try {
      await api(`/rescue/${id}/complete`, { method: "POST" });
      showToast("Pickup confirmed — added to today's impact");
      dash.reload();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (dash.error && !dash.data) {
    return (
      <div className={`${container} py-10`}>
        <ErrorState title="We couldn't load the kitchen dashboard." error={dash.error} onRetry={dash.reload} />
      </div>
    );
  }

  const d = dash.data;
  const open = d?.listings.filter((l) => l.status === "available") ?? [];
  const reserved = d?.listings.filter((l) => l.status === "reserved") ?? [];

  return (
    <div className={`${container} py-8 sm:py-10`}>
      <PageHeader eyebrow={`Café staff · ${formatDate(new Date())}`} title="Kitchen dashboard">
        Today's orders, tomorrow's prep, and tonight's surplus — in one place.
      </PageHeader>

      {/* TODAY */}
      <section aria-label="Today so far" className="border-y border-line py-5 mb-12">
        {d ? (
          <dl className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-5">
            <Stat label="Orders today" value={d.orders.orders} />
            <Stat label="Food revenue" value={formatRupees(d.orders.revenue)} />
            <Stat label="Contributions with orders" value={formatRupees(d.orders.contributions)} />
            <Stat label="Surplus on the board" value={d.board.availablePortions + d.board.reservedPortions} />
            <Stat label="Rescued today" value={d.board.rescuedToday} tone="leaf" />
          </dl>
        ) : (
          <Skeleton className="h-14" />
        )}
      </section>

      {/* ORDERS */}
      <section aria-labelledby="orders-heading" className="mb-16">
        <h2 id="orders-heading" className="font-serif-display text-2xl text-espresso mb-1">
          Orders
        </h2>
        <p className="text-sm text-charcoal-soft mb-5">
          Website orders start as "Waiting for WhatsApp confirmation". Change it to Confirmed when the customer's message arrives.
        </p>
        <OrdersPanel />
      </section>

      {/* FORECAST */}
      <section aria-labelledby="forecast-heading" className="mb-16">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 id="forecast-heading" className="font-serif-display text-2xl text-espresso">
              Tomorrow's prep{forecast.data && ` · ${forecast.data.weekday}`}
            </h2>
            {forecast.data && (
              <p className="text-sm text-charcoal-soft">
                Generated {formatTime(forecast.data.generatedAt)} from the last four {forecast.data.weekday}s of sales.
                {!forecast.data.historyIsCurrent && (
                  <span className="text-caramel-dark"> Sales data ends {formatDate(`${forecast.data.historyThrough}T00:00:00`)} — enter newer sales for a better forecast.</span>
                )}
              </p>
            )}
          </div>
          <button type="button" onClick={regenerate} disabled={regenerating || !online} className={btn.small}>
            {regenerating && <Spinner />} Update forecast
          </button>
        </div>

        {forecast.error ? (
          <ErrorState title="We couldn't load the forecast." error={forecast.error} onRetry={forecast.reload} />
        ) : !forecast.data ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <>
            <ul className="border border-line rounded-xl bg-paper divide-y divide-line">
              <li className="hidden md:grid grid-cols-[1.5fr_0.7fr_1fr_1.2fr] gap-4 px-5 py-3 text-xs font-medium text-charcoal-soft" aria-hidden="true">
                <span>Category</span>
                <span>Usual</span>
                <span>Forecast</span>
                <span>Prep plan</span>
              </li>
              {forecast.data.items.map((f) => (
                <ForecastRow key={f.category} f={f} />
              ))}
            </ul>
            <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-4 items-start">
              <p className="text-sm text-charcoal leading-relaxed max-w-2xl">
                Prepping to the forecast instead of the usual fixed amounts means about{" "}
                <strong className="font-semibold text-leaf">{forecast.data.totals.portionsSaved} fewer portions</strong> made tomorrow (
                {forecast.data.totals.recommendedPrep} instead of {forecast.data.totals.usualPrep}).
              </p>
              <Note label="Method" className="md:max-w-xs">{forecast.data.method}. Not a trained ML model.</Note>
            </div>
          </>
        )}
      </section>

      <div className="grid lg:grid-cols-[1fr_320px] gap-12">
        <div className="space-y-14 min-w-0">
          <section aria-labelledby="list-heading">
            <h2 id="list-heading" className="font-serif-display text-2xl text-espresso mb-1">
              Add surplus
            </h2>
            <p className="text-sm text-charcoal-soft mb-5">Takes about 20 seconds. Partners see it on their phones straight away.</p>
            <div className="border border-line rounded-xl bg-paper p-4 sm:p-5">
              <ListingForm onSaved={dash.reload} />
            </div>
          </section>

          <section aria-labelledby="match-heading">
            <h2 id="match-heading" className="font-serif-display text-2xl text-espresso mb-1">
              Needs a partner <span className="text-base font-sans text-charcoal-soft nums">({open.length})</span>
            </h2>
            <p className="text-sm text-charcoal-soft mb-5">Suggestions are scored on quantity still needed, collection window, distance and urgency.</p>
            {!d ? (
              <Skeleton className="h-48 rounded-xl" />
            ) : open.length === 0 ? (
              <p className="text-sm text-charcoal-soft border border-dashed border-line rounded-xl px-5 py-8 text-center">Everything listed is spoken for.</p>
            ) : (
              <div className="space-y-6">
                {open.map((l) => (
                  <div key={l.id} className="grid md:grid-cols-2 gap-3">
                    {editingId === l.id ? (
                      <div className="border border-line rounded-xl p-4 bg-paper md:col-span-2">
                        <p className="font-medium text-espresso mb-3">Edit {l.item}</p>
                        <ListingForm
                          listing={l}
                          onSaved={() => {
                            setEditingId(null);
                            dash.reload();
                          }}
                          onCancel={() => setEditingId(null)}
                        />
                      </div>
                    ) : (
                      <>
                        <ListingCard listing={l} compact>
                          <button type="button" onClick={() => setEditingId(l.id)} className={btn.small}>
                            Edit listing
                          </button>
                        </ListingCard>
                        <div className="border border-line rounded-xl p-4 bg-paper">
                          <MatchList listing={l} onAssigned={dash.reload} />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="pickups-heading">
            <h2 id="pickups-heading" className="font-serif-display text-2xl text-espresso mb-5">
              Upcoming pickups
            </h2>
            {reserved.length === 0 ? (
              <p className="text-sm text-charcoal-soft">No pickups waiting.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {reserved.map((l) => (
                  <ListingCard key={l.id} listing={l} compact>
                    <button type="button" disabled={!online} onClick={() => complete(l.id)} className={btn.primary}>
                      Confirm pickup
                    </button>
                  </ListingCard>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-10">
          <section aria-labelledby="messages-heading">
            <h2 id="messages-heading" className="font-medium text-espresso mb-3">
              Messages from the contact form
            </h2>
            {messages.error ? (
              <p className="text-sm text-red-700">Couldn't load messages. {messages.error.message}</p>
            ) : !messages.data ? (
              <Skeleton className="h-24" />
            ) : messages.data.messages.length === 0 ? (
              <p className="text-sm text-charcoal-soft">No messages yet.</p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {messages.data.messages.slice(0, 5).map((m) => (
                  <li key={m.id} className="py-2.5 text-sm">
                    <p className="font-medium text-espresso break-words">
                      {m.name} <span className="font-normal text-charcoal-soft">· {m.topic}</span>
                    </p>
                    <p className="text-charcoal-soft break-words line-clamp-3">{m.message}</p>
                    <p className="text-xs text-charcoal-soft mt-0.5 break-all">
                      {formatTime(m.receivedAt)} · <a href={`mailto:${m.email}`} className="underline underline-offset-2">{m.email}</a>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="dash-activity">
            <h2 id="dash-activity" className="font-medium text-espresso mb-4">
              Today's activity
            </h2>
            {d ? <ActivityFeed events={d.activity} /> : <Skeleton className="h-40" />}
          </section>
        </aside>
      </div>
    </div>
  );
}

function ForecastRow({ f }) {
  return (
    <li className="px-4 sm:px-5 py-4 md:grid md:grid-cols-[1.5fr_0.7fr_1fr_1.2fr] md:gap-4 md:items-start">
      <div>
        <p className="font-medium text-espresso">{f.label}</p>
        <p className="text-xs text-charcoal-soft mt-1 leading-relaxed md:max-w-[18rem]">{f.explanation}</p>
      </div>
      {/* On phones the numbers sit in a compact row under the label */}
      <dl className="mt-3 grid grid-cols-3 gap-3 text-sm md:contents">
        <div className="md:pt-0.5">
          <dt className="text-xs text-charcoal-soft md:sr-only">Usual</dt>
          <dd className="text-charcoal nums">{f.usual}</dd>
        </div>
        <div className="col-span-2 md:col-span-1">
          <dt className="text-xs text-charcoal-soft md:sr-only">Forecast</dt>
          <dd>
            <span className="font-serif-display text-2xl text-espresso nums">{f.predicted}</span>
            <span className="block text-xs text-charcoal-soft nums">
              likely {f.low}–{f.high} · {f.confidence.toLowerCase()} confidence
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
              Prepare <span className="font-semibold nums">{f.recommendedPrep}</span>{" "}
              {f.usualPrep != null && (
                <span className="text-charcoal-soft">
                  instead of <span className="line-through nums">{f.usualPrep}</span>
                </span>
              )}
            </p>
            {f.usualPrep != null && (
              <p className="text-xs text-leaf mt-0.5 nums">
                {Math.max(0, f.usualPrep - f.recommendedPrep)} fewer {f.unit}
              </p>
            )}
          </>
        )}
      </div>
    </li>
  );
}
