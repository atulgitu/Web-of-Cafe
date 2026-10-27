import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MenuItemCard from "../components/MenuItemCard";
import ProductModal from "../components/ProductModal";
import { EmptyState, PageHeader } from "../components/ui";
import { categories, menuItems } from "../data/menu";
import { btn, container } from "../lib/styles";

const sorters = {
  popular: (a, b) => b.popularity - a.popularity,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

export default function Menu() {
  // Filters live in the URL so they survive refresh and can be shared.
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All";
  const search = params.get("search") || "";
  const vegOnly = params.get("veg") === "1";
  const lowWaste = params.get("lowwaste") === "1";
  const sort = params.get("sort") || "popular";
  const [activeItem, setActiveItem] = useState(null);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== "All" && value !== "popular") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems
      .filter((i) => category === "All" || i.category === category)
      .filter((i) => !vegOnly || i.veg)
      .filter((i) => !lowWaste || i.tags.includes("low-waste"))
      .filter((i) => !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
      .sort(sorters[sort] || sorters.popular);
  }, [category, search, vegOnly, lowWaste, sort]);

  // With no narrowing filters, show the menu in sections like a printed menu.
  const grouped = category === "All" && !search.trim() && sort === "popular";
  const sections = grouped
    ? categories.map((c) => ({ name: c, items: filtered.filter((i) => i.category === c) })).filter((s) => s.items.length)
    : [{ name: null, items: filtered }];

  const chip = (active) =>
    `px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
      active ? "bg-espresso text-cream border-espresso" : "border-line bg-paper text-charcoal-soft hover:border-caramel hover:text-espresso"
    }`;

  return (
    <div className={`${container} py-10`}>
      <PageHeader eyebrow="Order for pickup or delivery" title="Menu">
        Coffee roasted in Chikmagalur, breakfast till noon, and meals cooked in forecast-sized batches.
      </PageHeader>

      <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-cream/95 backdrop-blur-sm py-3 border-b border-line mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative sm:w-72">
            <label htmlFor="menu-search" className="sr-only">
              Search the menu
            </label>
            <input
              id="menu-search"
              type="search"
              value={search}
              onChange={(e) => update("search", e.target.value)}
              placeholder="Search coffee, bowls, croissants…"
              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-caramel/50"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-soft" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <button type="button" aria-pressed={vegOnly} onClick={() => update("veg", vegOnly ? "" : "1")} className={chip(vegOnly)}>
              Vegetarian
            </button>
            <button type="button" aria-pressed={lowWaste} onClick={() => update("lowwaste", lowWaste ? "" : "1")} className={chip(lowWaste)}>
              Low-waste picks
            </button>
            <label htmlFor="menu-sort" className="sr-only">
              Sort by
            </label>
            <select
              id="menu-sort"
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
              className="ml-auto sm:ml-0 text-sm border border-line rounded-full px-3 py-1.5 bg-paper focus:outline-none focus:ring-2 focus:ring-caramel/50"
            >
              <option value="popular">Popular first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>

        <nav aria-label="Menu categories" className="mt-3 flex gap-2 overflow-x-auto scroll-thin pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {["All", ...categories].map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => update("category", c)} className={chip(category === c)}>
              {c}
            </button>
          ))}
        </nav>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing matches that."
          action={
            <button type="button" onClick={() => setParams({}, { replace: true })} className={btn.secondary}>
              Clear filters
            </button>
          }
        >
          Try a different word, or clear the filters to see the whole menu.
        </EmptyState>
      ) : (
        <div className="space-y-14">
          {!grouped && (
            <p className="text-sm text-charcoal-soft -mt-4" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </p>
          )}
          {sections.map((s) => (
            <section key={s.name || "results"} aria-labelledby={s.name ? `cat-${s.name}` : undefined}>
              {s.name && (
                <h2 id={`cat-${s.name}`} className="font-serif-display text-2xl text-espresso mb-4 flex items-baseline gap-3">
                  {s.name}
                  <span className="text-sm font-sans text-charcoal-soft nums">{s.items.length}</span>
                </h2>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {s.items.map((item) => (
                  <MenuItemCard key={item.id} item={item} onOpen={setActiveItem} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {activeItem && <ProductModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}
