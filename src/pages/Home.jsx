import { useState } from "react";
import { Link } from "react-router-dom";
import FoodImage from "../components/FoodImage";
import MenuItemCard from "../components/MenuItemCard";
import ProductModal from "../components/ProductModal";
import { Eyebrow } from "../components/ui";
import { getItemById } from "../data/menu";
import { getPartner } from "../data/partners";
import { CAFE, DEMO_DAY } from "../data/site";
import { useRescue } from "../hooks/useAppContext";
import { formatKg, formatNumber, formatTime } from "../lib/format";
import { btn, container } from "../lib/styles";

const highlights = ["c1", "m1", "d5", "cd1"].map(getItemById);

const steps = [
  { title: "You order as usual", text: "Coffee, breakfast, a rajma bowl at lunch. Nothing changes at the counter." },
  {
    title: "We forecast tomorrow",
    text: "Each evening, recent sales suggest how much to prep for the next day, so the kitchen makes closer to what sells.",
  },
  { title: "Leftovers get listed", text: "Whatever's unsold by evening is listed with a portion count, pickup window and best-before time." },
  { title: "A partner is matched", text: "The system suggests the community partner who can use it and collect in time." },
  { title: "Food reaches people", text: "Volunteers collect from our back counter, and it's served the same night." },
];

export default function Home() {
  const [activeItem, setActiveItem] = useState(null);
  const { listings, today, impact } = useRescue();
  const nextReserved = listings
    .filter((l) => l.status === "reserved")
    .sort((a, b) => a.pickupStart - b.pickupStart)[0];

  return (
    <div>
      {/* HERO */}
      <section className={`${container} pt-10 pb-14 lg:pt-16 lg:pb-20 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center`}>
        <div className="animate-fade-in-up">
          <Eyebrow>Café &amp; food rescue · Indiranagar</Eyebrow>
          <h1 className="mt-4 font-serif-display text-[2.6rem] sm:text-6xl leading-[1.04] tracking-tight text-espresso">
            Good food shouldn't go to waste.
          </h1>
          <p className="mt-5 text-lg text-charcoal-soft leading-relaxed max-w-lg">
            Brew &amp; Care is a neighbourhood café that preps to a forecast instead of a guess. What's still left at
            the end of the day goes to a community kitchen nearby, not the bin.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/menu" className={`${btn.primary} px-6 py-3`}>
              Order now
            </Link>
            <Link to="/impact" className={`${btn.secondary} px-6 py-3`}>
              See our impact
            </Link>
          </div>
          <p className="mt-6 text-sm text-charcoal-soft">
            Open today until 10:30 PM · Pickup in about 15 minutes
          </p>
        </div>

        <div className="relative animate-fade-in-up" style={{ animationDelay: "80ms" }}>
          <FoodImage
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1100&q=80"
            alt="A cappuccino and a croissant on a wooden café table"
            eager
            className="w-full h-80 sm:h-[30rem] object-cover rounded-2xl"
          />
          {nextReserved && (
            <div className="absolute -bottom-6 left-4 right-4 sm:left-auto sm:-left-8 sm:right-auto sm:w-72 bg-paper border border-line rounded-xl px-4 py-3.5 shadow-[0_10px_30px_-18px_rgba(59,42,32,0.6)]">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-leaf">Tonight, {formatTime(nextReserved.pickupStart)}</p>
              <p className="text-sm text-charcoal mt-1 leading-snug">
                {nextReserved.portions} {nextReserved.item.toLowerCase()} going to {getPartner(nextReserved.partnerId).name}.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* TODAY */}
      <section aria-labelledby="today-heading" className="border-y border-line bg-paper/70 mt-6">
        <div className={`${container} py-7 grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center`}>
          <div>
            <h2 id="today-heading" className="font-serif-display text-xl text-espresso">
              Today at Brew &amp; Care
            </h2>
            <p className="text-xs text-charcoal-soft mt-0.5">{DEMO_DAY.label} · updated {formatTime(DEMO_DAY.startMinutes)}</p>
          </div>
          <dl className="grid grid-cols-3 gap-4 md:justify-self-center md:gap-14">
            <TodayFigure value={today.available} label="portions waiting for pickup" />
            <TodayFigure value={today.rescued} label="already rescued today" tone="leaf" />
            <TodayFigure value={today.nextPickup ? formatTime(today.nextPickup) : "—"} label="next pickup" small />
          </dl>
          <Link to="/rescue" className={btn.link}>
            See what's available →
          </Link>
        </div>
      </section>

      {/* MENU HIGHLIGHTS */}
      <section className={`${container} pt-20`}>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif-display text-3xl text-espresso">From the counter</h2>
            <p className="text-charcoal-soft mt-1">What regulars order most, plus a couple we're proud of.</p>
          </div>
          <Link to="/menu" className={`${btn.link} shrink-0`}>
            Full menu →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {highlights.map((item) => (
            <MenuItemCard key={item.id} item={item} onOpen={setActiveItem} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`${container} pt-24`} aria-labelledby="how-heading">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2 id="how-heading" className="font-serif-display text-3xl sm:text-4xl text-espresso mt-3 leading-tight">
              The café side and the rescue side run on the same day's numbers.
            </h2>
            <p className="text-charcoal-soft mt-4 leading-relaxed">
              Most café waste is food made in good faith for customers who didn't come. We try to make less of it, and
              to move what's left quickly while it's still good.
            </p>
            <Link to="/about" className={`${btn.link} inline-block mt-5`}>
              How the forecast and matching work →
            </Link>
          </div>
          <ol className="border-l border-line">
            {steps.map((s, i) => (
              <li key={s.title} className="relative pl-8 pb-8 last:pb-0">
                <span className="absolute -left-[13px] top-0 w-[26px] h-[26px] rounded-full bg-cream border border-line text-xs font-semibold text-espresso flex items-center justify-center nums">
                  {i + 1}
                </span>
                <h3 className="font-medium text-espresso">{s.title}</h3>
                <p className="text-sm text-charcoal-soft mt-1 leading-relaxed max-w-md">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* IMPACT */}
      <section className="mt-24 bg-espresso text-cream">
        <div className={`${container} py-16 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center`}>
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#D9B48F]">Since {CAFE.pilotStarted}</p>
            <h2 className="font-serif-display text-3xl sm:text-4xl mt-3 leading-tight">Twelve weeks into the pilot, here's where it stands.</h2>
            <dl className="mt-10 grid grid-cols-2 gap-y-8 gap-x-6">
              <ImpactFigure value={formatNumber(impact.allTime.meals)} label="meals rescued" />
              <ImpactFigure value={formatKg(impact.allTime.kg)} label="of food kept out of the bin" />
              <ImpactFigure value={impact.activePartners} label="community partners" />
              <ImpactFigure value={`≈ ${formatNumber(impact.co2)} kg`} label="CO₂e avoided (estimate)" />
            </dl>
            <Link to="/impact" className="inline-block mt-10 text-sm font-medium text-cream underline underline-offset-4 decoration-cream/40 hover:decoration-cream">
              See the full impact breakdown
            </Link>
          </div>
          <figure className="border-l-2 border-[#D9B48F]/60 pl-6">
            <blockquote className="font-serif-display text-xl sm:text-2xl leading-snug text-cream/95">
              “The sandwiches come with a time on them and they're always ready when we get there. That sounds small, but
              it's the reason this works for a kitchen run by volunteers.”
            </blockquote>
            <figcaption className="mt-4 text-sm text-cream/70">
              Lakshmi R., Indiranagar Community Kitchen
              <span className="block text-xs text-cream/50 mt-1">Demo partner — illustrative quote</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* VISIT */}
      <section className={`${container} pt-20 grid md:grid-cols-[1fr_1fr] gap-8 items-start`}>
        <div>
          <h2 className="font-serif-display text-3xl text-espresso">Come by</h2>
          <p className="text-charcoal-soft mt-2">{CAFE.address}</p>
          <dl className="mt-4 text-sm space-y-1.5 max-w-xs">
            {CAFE.hours.map((h) => (
              <div key={h.days} className="flex justify-between">
                <dt className="text-charcoal-soft">{h.days}</dt>
                <dd className="text-charcoal nums">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="md:border-l md:border-line md:pl-8">
          <h3 className="font-medium text-espresso">Run a kitchen, shelter or pantry nearby?</h3>
          <p className="text-sm text-charcoal-soft mt-1.5 leading-relaxed">
            We're looking for one or two more partners who can collect in the evenings within about 5 km. It's free, and
            you choose what you can take.
          </p>
          <Link to="/contact" className={`${btn.link} inline-block mt-3`}>
            Get in touch →
          </Link>
        </div>
      </section>

      {activeItem && <ProductModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}

function TodayFigure({ value, label, tone, small }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-xs text-charcoal-soft mt-0.5 leading-snug">{label}</dt>
      <dd className={`font-serif-display nums ${small ? "text-2xl sm:text-3xl" : "text-3xl"} ${tone === "leaf" ? "text-leaf" : "text-espresso"}`}>
        {value}
      </dd>
    </div>
  );
}

function ImpactFigure({ value, label }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-sm text-cream/70 mt-1">{label}</dt>
      <dd className="font-serif-display text-3xl sm:text-4xl nums">{value}</dd>
    </div>
  );
}
