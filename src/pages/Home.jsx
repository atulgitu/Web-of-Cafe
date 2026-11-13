import { useState } from "react";
import { Link } from "react-router-dom";
import FoodImage from "../components/FoodImage";
import MenuItemCard from "../components/MenuItemCard";
import ProductModal from "../components/ProductModal";
import { ErrorState, Eyebrow, Skeleton } from "../components/ui";
import { CAFE } from "../data/site";
import useApi from "../hooks/useApi";
import useMenu from "../hooks/useMenu";
import { formatDate, formatKg, formatNumber, formatRupees, formatTime, formatWindow } from "../lib/format";
import { cafeStatus } from "../lib/hours";
import { btn, container } from "../lib/styles";

const FEATURED = ["c1", "m1", "d5", "cd1"];
const HERO_IMAGE = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1100&q=80";

const flow = [
  { side: "cafe", title: "You order", text: "Coffee, breakfast, a rajma bowl at lunch — nothing changes at the counter." },
  { side: "cafe", title: "We forecast", text: "Recent sales suggest how much each category will sell tomorrow." },
  { side: "cafe", title: "The kitchen preps to it", text: "Closer to what sells, instead of the same fixed amounts every day." },
  { side: "rescue", title: "Leftovers are listed", text: "Whatever's unsold goes on the board with a pickup window and best-before time." },
  { side: "rescue", title: "A partner reserves", text: "A community kitchen or shelter nearby claims what they can use." },
  { side: "rescue", title: "Pickup is confirmed", text: "Volunteers collect from our back counter and mark it done." },
  { side: "rescue", title: "Impact is recorded", text: "Each completed pickup adds to the numbers you see on this site." },
];

export default function Home() {
  const { data, error, reload } = useApi("/overview");
  // Three states for everything that depends on the live numbers:
  // loading (no data, no error yet), failed (error, nothing to show), ready (data).
  const failed = Boolean(error) && !data;
  const { items } = useMenu();
  const [activeItem, setActiveItem] = useState(null);
  const status = cafeStatus();
  const evening = new Date().getHours() >= 17;
  const tonight = evening ? "Tonight" : "Today";
  const featured = FEATURED.map((id) => items.find((m) => m.id === id)).filter(Boolean);
  const next = data?.board.nextPickup;

  return (
    <div>
      {/* HERO */}
      <section className={`${container} pt-8 sm:pt-12 lg:pt-16 grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-16 items-center`}>
        <div className="animate-fade-in-up">
          <Eyebrow>Café &amp; food rescue · {CAFE.area}</Eyebrow>
          <h1 className="mt-4 font-serif-display text-[2.5rem] leading-[1.04] sm:text-6xl tracking-tight text-espresso">
            Good food shouldn't go to waste.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-charcoal-soft leading-relaxed max-w-lg">
            Coffee Cinnamon is a neighbourhood café that plans each day's cooking around how much people actually order.
            Whatever is still left in the evening is collected by community kitchens nearby, not thrown away.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/menu" className={`${btn.primary} px-6 py-3`}>
              Order now
            </Link>
            <Link to="/rescue" className={`${btn.secondary} px-6 py-3`}>
              See {tonight.toLowerCase()}'s rescue
            </Link>
          </div>
          <p className="mt-5 text-sm text-charcoal-soft flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status.isOpen ? "bg-leaf" : "bg-charcoal-soft/50"}`} aria-hidden="true" />
            {status.label} · {status.pickup}
          </p>
        </div>

        <figure className="relative animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <FoodImage src={HERO_IMAGE} alt="Two cappuccinos and a croissant on a wooden café table" eager className="w-full h-64 sm:h-96 lg:h-[30rem] object-cover rounded-2xl" />
          {data && data.board.rescuedToday > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-paper/95 px-3 py-1 text-xs font-medium text-leaf">
              {data.board.rescuedToday} portions rescued today
            </span>
          )}
          {next && (
            <figcaption className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-paper/95 rounded-xl px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-leaf">
                {tonight} · {formatTime(next.at)}
              </p>
              <p className="text-sm text-charcoal mt-0.5 leading-snug">
                {next.portions} {next.item.toLowerCase()} <span aria-hidden="true">→</span>
                <span className="sr-only">going to</span> {next.partnerName}
              </p>
            </figcaption>
          )}
        </figure>
      </section>

      {/* LIVE STRIP */}
      <section aria-label="Right now at Coffee Cinnamon" className="mt-10 lg:mt-14 border-y border-line bg-paper/70">
        <dl className={`${container} grid grid-cols-2 md:grid-cols-4`}>
          <LiveFigure label={status.short} value={status.isOpen ? `Pickup ~${CAFE.pickupMinutes} min` : "Order ahead"} />
          <LiveFigure label="Today" failed={failed} value={data ? `${data.ordersToday} ${data.ordersToday === 1 ? "order" : "orders"} prepared` : null} />
          <LiveFigure label="Rescue" failed={failed} value={data ? `${data.board.availablePortions} portions available` : null} tone="leaf" />
          <LiveFigure label="Impact" failed={failed} value={data ? `${data.board.rescuedToday} meals rescued today` : null} />
        </dl>
        {failed && (
          <p role="status" className={`${container} pb-3 text-sm text-charcoal-soft`}>
            Today's numbers couldn't be loaded. {error.message}{" "}
            <button type="button" onClick={reload} className="font-medium text-caramel-dark underline underline-offset-2 py-1">
              Try again
            </button>
          </p>
        )}
      </section>

      {/* FEATURED MENU */}
      <section className={`${container} pt-16 sm:pt-20`} aria-labelledby="menu-heading">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 id="menu-heading" className="font-serif-display text-3xl text-espresso">From the counter</h2>
            <p className="text-charcoal-soft mt-1">What regulars order most, and a couple we're proud of.</p>
          </div>
          <Link to="/menu" className={`${btn.link} shrink-0 hidden sm:inline`}>
            Explore full menu →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {featured.length
            ? featured.map((item) => <MenuItemCard key={item.id} item={item} onOpen={setActiveItem} />)
            : FEATURED.map((id) => <Skeleton key={id} className="h-72 rounded-xl" />)}
        </div>
        <Link to="/menu" className={`${btn.link} inline-block mt-5 sm:hidden`}>
          Explore full menu →
        </Link>
      </section>

      {/* TONIGHT'S RESCUE */}
      <section className={`${container} pt-20`} aria-labelledby="rescue-heading">
        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-14 items-start">
          <div>
            <Eyebrow>Food rescue</Eyebrow>
            <h2 id="rescue-heading" className="font-serif-display text-3xl sm:text-4xl text-espresso mt-3">
              {tonight}'s rescue
            </h2>
            <p className="font-serif-display text-5xl text-leaf mt-4 nums">
              {data ? data.board.availablePortions : <span aria-label={failed ? "not available" : "loading"}>—</span>}
            </p>
            <p className="text-charcoal-soft">portions available for community partners</p>
            <Link to="/rescue" className={`${btn.link} inline-block mt-5`}>
              Community partners can reserve →
            </Link>
          </div>
          <div>
            {failed ? (
              <ErrorState title="We couldn't load today's rescue list." error={error} onRetry={reload} />
            ) : !data ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : data.tonight.length === 0 ? (
              <p className="text-charcoal-soft border-t border-line pt-4">
                No surplus listed yet. The kitchen usually posts what's left after the lunch and evening rush.
              </p>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {data.tonight.map((l) => (
                  <li key={l.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-espresso">{l.item}</p>
                      <p className="text-sm text-charcoal-soft nums">Pickup {formatWindow(l.pickupStart, l.pickupEnd)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-serif-display text-xl text-espresso nums">{l.portions}</p>
                      <p className={`text-xs ${l.status === "available" ? "text-leaf" : "text-caramel-dark"}`}>
                        {l.status === "available" ? "available" : `reserved`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ONE KITCHEN, TWO OUTCOMES */}
      <section className={`${container} pt-24`} aria-labelledby="flow-heading">
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 id="flow-heading" className="font-serif-display text-3xl sm:text-4xl text-espresso mt-3">
            One kitchen. Two outcomes.
          </h2>
          <p className="text-charcoal-soft mt-3 leading-relaxed">
            The same day's numbers decide how much we cook and where the leftovers go. Less is wasted in the first place,
            and what remains is eaten.
          </p>
        </div>
        {/* Phones and tablets: a vertical timeline, one step per row.
            Wide screens (lg, 1024px+): the seven steps sit side by side.
            It used to switch at 768px, which squeezed each step into ~85px. */}
        <ol className="mt-10 grid gap-x-4 gap-y-6 max-w-xl lg:max-w-none lg:grid-cols-7">
          {flow.map((step, i) => (
            <li key={step.title} className="relative lg:pt-6 pl-8 lg:pl-0">
              {/* the line: espresso for the café side, green for the rescue side */}
              <span
                aria-hidden="true"
                className={`absolute left-[7px] top-0 bottom-[-1.5rem] w-0.5 lg:left-0 lg:right-[-1rem] lg:top-[7px] lg:bottom-auto lg:h-0.5 lg:w-auto ${
                  step.side === "cafe" ? "bg-espresso/70" : "bg-leaf/70"
                } ${i === flow.length - 1 ? "lg:right-0 bottom-0" : ""}`}
              />
              <span
                aria-hidden="true"
                className={`absolute left-0 top-0 w-4 h-4 rounded-full border-2 bg-cream ${step.side === "cafe" ? "border-espresso" : "border-leaf"}`}
              />
              {(i === 0 || i === 3) && (
                <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${step.side === "cafe" ? "text-espresso" : "text-leaf"}`}>
                  {step.side === "cafe" ? "The café" : "The rescue"}
                </p>
              )}
              <h3 className="font-medium text-espresso text-[15px]">{step.title}</h3>
              <p className="text-sm text-charcoal-soft mt-1 leading-snug">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* TODAY TIMELINE + FORECAST */}
      <section className={`${container} pt-24 grid lg:grid-cols-2 gap-14`}>
        <div aria-labelledby="today-heading">
          <Eyebrow>Today at Coffee Cinnamon</Eyebrow>
          <h2 id="today-heading" className="font-serif-display text-2xl text-espresso mt-3 mb-6">
            The day so far
          </h2>
          {failed ? (
            <p className="text-sm text-charcoal-soft border-t border-line pt-4">Today's activity isn't available right now.</p>
          ) : !data ? (
            <Skeleton className="h-48" />
          ) : (
            <ol>
              {[...data.activity].reverse().map((e) => (
                <li key={e.id} className="grid grid-cols-[4.75rem_1fr] gap-3 pb-4">
                  <time dateTime={e.at} className="text-xs font-medium text-charcoal-soft pt-0.5 nums">
                    {formatTime(e.at)}
                  </time>
                  <p className={`text-sm leading-snug border-l pl-4 ${e.type === "pickup_completed" ? "border-leaf text-charcoal" : "border-line text-charcoal-soft"}`}>
                    {e.message}
                  </p>
                </li>
              ))}
              <li className="grid grid-cols-[4.75rem_1fr] gap-3">
                <span className="text-xs font-medium text-leaf pt-0.5">Now</span>
                <p className="text-sm leading-snug border-l border-leaf pl-4 text-charcoal">
                  {data.ordersToday === 0 ? "No orders yet today" : `${data.ordersToday} ${data.ordersToday === 1 ? "order" : "orders"} prepared so far today`}
                </p>
              </li>
            </ol>
          )}
        </div>

        <div aria-labelledby="forecast-heading">
          <Eyebrow>Planning the kitchen</Eyebrow>
          <h2 id="forecast-heading" className="font-serif-display text-2xl text-espresso mt-3">
            Preparing tomorrow without guessing.
          </h2>
          <p className="text-sm text-charcoal-soft mt-2 leading-relaxed">
            Each morning we look at the last four {data?.forecast?.weekday || "same weekday"}s, recent sales trends and how much the kitchen
            used to prepare, then recommends quantities with a small safety buffer.
          </p>
          {data && !data.forecast && (
            <p className="mt-6 text-sm text-charcoal-soft border-t border-line pt-4">
              No forecast today: there isn't enough recent sales history to base one on. It returns once the café has four weeks of sales
              recorded.
            </p>
          )}
          {data?.forecast && !data.forecast.historyIsCurrent && (
            <p className="mt-4 text-xs text-caramel-dark">
              Based on sales recorded up to {formatDate(`${data.forecast.historyThrough}T00:00:00`)} — no newer sales data has been entered.
            </p>
          )}
          {data?.forecast && (
            <table className="w-full mt-6 text-sm">
              <caption className="sr-only">Forecast for {data.forecast.weekday}</caption>
              <thead>
                <tr className="text-xs text-charcoal-soft text-left border-b border-line">
                  <th scope="col" className="font-medium pb-2">{data.forecast.weekday}</th>
                  <th scope="col" className="font-medium pb-2 text-right">Expected</th>
                  <th scope="col" className="font-medium pb-2 text-right">Prepare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.forecast.items.map((f) => (
                  <tr key={f.category}>
                    <th scope="row" className="py-3 text-left font-medium text-espresso">{f.label}</th>
                    <td className="py-3 text-right nums">
                      <span className="font-serif-display text-lg text-espresso">{f.predicted}</span>
                      <span className="block text-xs text-charcoal-soft">{f.low}–{f.high}</span>
                    </td>
                    <td className="py-3 text-right nums">
                      {f.madeToOrder ? <span className="text-xs text-charcoal-soft">made to order</span> : <span className="font-medium text-leaf">{f.recommendedPrep}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-xs text-charcoal-soft mt-4">
            A transparent statistical model, not a trained AI. <Link to="/about#forecast" className="underline underline-offset-2 hover:text-espresso">How it works</Link>
          </p>
        </div>
      </section>

      {/* PARTNER */}
      {data?.nextPartner && next && (
        <section className={`${container} pt-24`} aria-labelledby="partner-heading">
          <div className="border-y border-line py-10 grid md:grid-cols-[0.8fr_1.2fr] gap-6 md:gap-14">
            <div>
              <Eyebrow>{tonight}'s community partner</Eyebrow>
              <h2 id="partner-heading" className="font-serif-display text-2xl sm:text-3xl text-espresso mt-3">
                {data.nextPartner.name}
              </h2>
              <p className="text-sm text-charcoal-soft mt-1">
                {data.nextPartner.type} · {data.nextPartner.area} · about {data.nextPartner.distanceKm} km away
              </p>
            </div>
            <div>
              <dl className="grid grid-cols-2 gap-6">
                <div className="flex flex-col-reverse">
                  <dt className="text-xs text-charcoal-soft mt-1">pickup from our back counter</dt>
                  <dd className="font-serif-display text-2xl text-espresso nums">{formatTime(next.at)}</dd>
                </div>
                <div className="flex flex-col-reverse">
                  <dt className="text-xs text-charcoal-soft mt-1">{next.item.toLowerCase()}</dt>
                  <dd className="font-serif-display text-2xl text-espresso nums">{next.portions}</dd>
                </div>
              </dl>
              <p className="text-sm text-charcoal-soft mt-5 leading-relaxed">{data.nextPartner.note}</p>
              <p className="text-xs text-charcoal-soft mt-3">Partner organisations on this site are sample data.</p>
            </div>
          </div>
        </section>
      )}

      {/* IMPACT PREVIEW */}
      <section className="mt-24 bg-espresso text-cream" aria-labelledby="impact-heading">
        <div className={`${container} py-14 sm:py-16`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#E3B98F]">Since the pilot began · {CAFE.pilotStarted}</p>
              <h2 id="impact-heading" className="font-serif-display text-3xl sm:text-4xl mt-3">What's been rescued so far</h2>
            </div>
            <Link to="/impact" className="inline-block py-1 text-sm font-medium underline underline-offset-4 decoration-cream/40 hover:decoration-cream">
              See full impact →
            </Link>
          </div>
          {data ? (
            <>
              <p className="mt-10 text-[11px] font-semibold uppercase tracking-wide text-cream/70">Measured from completed pickups and orders</p>
              <dl className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6">
                <ImpactFigure value={formatNumber(data.impact.measured.mealsRescued)} label="meals rescued" />
                <ImpactFigure value={formatKg(data.impact.measured.kgRescued)} label="of food kept out of the bin" />
                <ImpactFigure value={formatNumber(data.impact.measured.pickups)} label="successful pickups" />
                <ImpactFigure value={formatRupees(data.impact.measured.contributionsAmount)} label="customer contributions" />
              </dl>
              <p className="mt-10 text-[11px] font-semibold uppercase tracking-wide text-cream/70">Estimates</p>
              <dl className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-6 text-cream/85">
                <ImpactFigure small value={`≈ ${formatNumber(data.impact.estimates.co2eKg)} kg`} label="CO₂e avoided (estimate)" />
                <ImpactFigure small value={`≈ ${formatNumber(data.impact.estimates.mealsFunded)}`} label="community meals potentially funded (estimate)" />
              </dl>
              <p className="mt-8 text-xs text-cream/80 max-w-2xl leading-relaxed">
                <span className="mr-2 rounded border border-cream/40 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide">Sample data</span>
                These totals are calculated from the sample pickups and orders in our database, not from a real café's history.
              </p>
            </>
          ) : (
            <p className="mt-10 text-cream/80">{failed ? "Impact figures couldn't be loaded right now." : "Loading…"}</p>
          )}
        </div>
      </section>

      {activeItem && <ProductModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}

function LiveFigure({ label, value, tone, failed }) {
  return (
    <div className="py-4 pr-4 md:py-5 [&:nth-child(n+3)]:border-t md:[&:nth-child(n+3)]:border-t-0 border-line md:border-l md:first:border-l-0 md:pl-5 md:first:pl-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-soft">{label}</dt>
      <dd className={`mt-1 text-[15px] font-medium ${tone === "leaf" ? "text-leaf" : "text-espresso"}`}>
        {value ?? (failed ? <span className="font-normal text-charcoal-soft">Not available</span> : <Skeleton className="h-5 w-32" />)}
      </dd>
    </div>
  );
}

function ImpactFigure({ value, label, small }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-sm text-cream/70 mt-1">{label}</dt>
      <dd className={`font-serif-display nums ${small ? "text-2xl" : "text-3xl sm:text-4xl"}`}>{value}</dd>
    </div>
  );
}
