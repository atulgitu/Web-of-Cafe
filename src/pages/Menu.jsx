import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { categories, menuItems } from "../data/menu";
import MenuItemCard from "../components/MenuItemCard";
import ProductModal from "../components/ProductModal";

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState("popularity");
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s) setSearch(s);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = menuItems;
    if (activeCategory !== "All") list = list.filter((i) => i.category === activeCategory);
    if (vegOnly) list = list.filter((i) => i.veg);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else sorted.sort((a, b) => b.popularity - a.popularity);
    return sorted;
  }, [activeCategory, vegOnly, search, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="font-serif-display text-3xl text-espresso">Our Menu</h1>
        <p className="text-charcoal-soft text-sm mt-1">Handcrafted drinks and food, made fresh to order.</p>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative sm:max-w-xs w-full">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchParams(e.target.value ? { search: e.target.value } : {});
              }}
              placeholder="Search for coffee, snacks…"
              className="w-full pl-9 pr-3 py-2.5 rounded-full border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
              aria-label="Search menu"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-soft" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-charcoal-soft cursor-pointer whitespace-nowrap">
              <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} className="w-4 h-4 accent-sage-dark" />
              Veg only
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-line rounded-full px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-caramel"
              aria-label="Sort menu"
            >
              <option value="popularity">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scroll-thin pb-1">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                activeCategory === cat
                  ? "bg-espresso text-cream border-espresso"
                  : "border-line text-charcoal-soft hover:border-caramel"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-charcoal-soft">No items match your search. Try a different keyword or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onOpen={setActiveItem}
              wide={idx % 9 === 4}
              featured={idx === 0 && activeCategory !== "All"}
            />
          ))}
        </div>
      )}

      {activeItem && <ProductModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}
