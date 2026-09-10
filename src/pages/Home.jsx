import { Link } from "react-router-dom";
import { useState } from "react";
import { menuItems } from "../data/menu";
import { reviews } from "../data/reviews";
import MenuItemCard from "../components/MenuItemCard";
import ProductModal from "../components/ProductModal";
import StarRating from "../components/StarRating";

const todaysSpecial = menuItems.find((m) => m.id === "c6");
const popularDrinks = menuItems.filter((m) => m.category === "Coffee" || m.category === "Cold Drinks")
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 4);
const featuredFood = menuItems.filter((m) => m.category === "Snacks" || m.category === "Desserts")
  .sort((a, b) => b.popularity - a.popularity)
  .slice(0, 4);

const whyPoints = [
  {
    title: "Beans, sourced with care",
    text: "We work directly with growers in Chikmagalur and Coorg for beans roasted weekly in small batches.",
  },
  {
    title: "Made to order",
    text: "Nothing sits on a shelf. Every cup and plate is prepared after you order, not before.",
  },
  {
    title: "A place to linger",
    text: "Comfortable seating, steady wifi and staff who won't rush you out the door.",
  },
];

export default function Home() {
  const [activeItem, setActiveItem] = useState(null);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <span className="text-xs font-semibold tracking-[0.14em] uppercase text-caramel-dark">
              Crafted Daily &middot; Served Fresh
            </span>
            <h1 className="mt-4 font-serif-display text-4xl sm:text-5xl leading-[1.12] text-espresso">
              Your daily cup,<br />made better.
            </h1>
            <p className="mt-4 text-charcoal-soft text-base sm:text-lg max-w-md leading-relaxed">
              Freshly brewed coffee, handcrafted drinks and comfort food made for your everyday moments.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="px-6 py-3 rounded-lg bg-espresso text-cream font-medium hover:bg-espresso-light active:scale-[0.99] transition-all"
              >
                Explore Menu
              </Link>
              <Link
                to="/menu"
                className="px-6 py-3 rounded-lg border border-espresso/20 text-espresso font-medium hover:bg-cream-dim transition-colors"
              >
                Order Now
              </Link>
            </div>
          </div>
          <div className="relative animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80"
              alt="Cappuccino and pastry on a warm café table"
              className="rounded-2xl w-full h-72 sm:h-[26rem] object-cover shadow-lg"
            />
            <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg px-4 py-3 hidden sm:flex items-center gap-3 border border-line">
              <StarRating rating={4.7} size={16} />
              <span className="text-xs text-charcoal-soft">from 1,200+ regulars</span>
            </div>
          </div>
        </div>
      </section>

      {/* TODAY'S SPECIAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-line rounded-2xl overflow-hidden grid md:grid-cols-[1fr_1.2fr]">
          <img src={todaysSpecial.image} alt={todaysSpecial.name} className="h-56 md:h-full w-full object-cover" />
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <span className="text-xs font-semibold tracking-wide uppercase text-caramel-dark">Today's Special</span>
            <h2 className="font-serif-display text-2xl text-espresso mt-1.5">{todaysSpecial.name}</h2>
            <p className="text-charcoal-soft text-sm mt-2 max-w-md leading-relaxed">{todaysSpecial.description}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="font-semibold text-espresso text-lg">₹{todaysSpecial.price}</span>
              <button
                onClick={() => setActiveItem(todaysSpecial)}
                className="px-5 py-2 rounded-full bg-caramel text-white text-sm font-medium hover:bg-caramel-dark transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR DRINKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-serif-display text-2xl text-espresso">Popular Drinks</h2>
          <Link to="/menu" className="text-sm font-medium text-caramel-dark hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {popularDrinks.map((item) => (
            <MenuItemCard key={item.id} item={item} onOpen={setActiveItem} />
          ))}
        </div>
      </section>

      {/* FEATURED FOOD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-serif-display text-2xl text-espresso">Featured Food</h2>
          <Link to="/menu" className="text-sm font-medium text-caramel-dark hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredFood.map((item) => (
            <MenuItemCard key={item.id} item={item} onOpen={setActiveItem} />
          ))}
        </div>
      </section>

      {/* STUDENT / COLLEGE OFFER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-sage/10 border border-sage/25 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sage-dark">Student Combo</p>
            <p className="text-charcoal-soft text-sm mt-0.5">Show your student ID and get 10% off on combo orders above ₹200.</p>
          </div>
          <Link
            to="/offers"
            className="px-5 py-2 rounded-full border border-sage-dark/40 text-sage-dark text-sm font-medium hover:bg-sage/15 transition-colors whitespace-nowrap"
          >
            View Offers
          </Link>
        </div>
      </section>

      {/* WHY BREW & BEAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="font-serif-display text-2xl text-espresso mb-10 text-center">Why Brew & Bean</h2>
        <div className="grid sm:grid-cols-3 gap-10">
          {whyPoints.map((p) => (
            <div key={p.title}>
              <h3 className="font-medium text-espresso mb-1.5">{p.title}</h3>
              <p className="text-sm text-charcoal-soft leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="bg-cream-dim py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif-display text-2xl text-espresso mb-10">What people are saying</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-line rounded-xl p-5">
                <StarRating rating={r.rating} />
                <p className="text-sm text-charcoal-soft mt-2.5 leading-relaxed">"{r.text}"</p>
                <div className="mt-4 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-caramel/20 text-caramel-dark text-xs font-semibold flex items-center justify-center">
                    {r.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{r.name}</p>
                    <p className="text-xs text-charcoal-soft">{r.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT OUR CAFÉ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="font-serif-display text-2xl text-espresso mb-3">Visit Our Café</h2>
          <p className="text-sm text-charcoal-soft leading-relaxed mb-4">
            142, 5th Cross, Indiranagar, Bengaluru, Karnataka 560038
          </p>
          <ul className="text-sm text-charcoal-soft space-y-1.5">
            <li className="flex justify-between max-w-xs"><span>Mon – Fri</span><span>7:30 AM – 10:30 PM</span></li>
            <li className="flex justify-between max-w-xs"><span>Sat – Sun</span><span>8:00 AM – 11:00 PM</span></li>
          </ul>
          <Link to="/contact" className="inline-block mt-5 text-sm font-medium text-caramel-dark hover:underline">
            Get directions
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden border border-line h-56 bg-cream-dim flex items-center justify-center text-charcoal-soft text-sm">
          Map placeholder — 142, 5th Cross, Indiranagar
        </div>
      </section>

      {/* FINAL ORDER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-espresso rounded-2xl px-6 sm:px-12 py-12 text-center">
          <h2 className="font-serif-display text-2xl sm:text-3xl text-cream">Ready for your next cup?</h2>
          <p className="text-cream/70 text-sm mt-2 max-w-md mx-auto">
            Order ahead and skip the wait — your table's ready when you are.
          </p>
          <Link
            to="/menu"
            className="inline-block mt-6 px-7 py-3 rounded-lg bg-cream text-espresso font-medium hover:bg-cream-dim transition-colors"
          >
            Order Now
          </Link>
        </div>
      </section>

      {activeItem && <ProductModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}
