import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState, Stat } from "../components/ui";
import FoodImage from "../components/FoodImage";
import { getItemById } from "../data/menu";
import { useAuth, useRescue, useToast } from "../hooks/useAppContext";
import { formatRupees } from "../lib/format";
import { mealsFromAmount } from "../lib/impact";
import { btn, container, field } from "../lib/styles";

const tabs = ["Orders", "Your contribution", "Favourites", "Details"];

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { impact } = useRescue();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState(tabs[0]);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");

  const orders = user.orders || [];
  const donated = orders.reduce((s, o) => s + (o.donation || 0), 0);
  const donatedOrders = orders.filter((o) => o.donation > 0).length;
  const favoriteItems = (user.favorites || []).map(getItemById).filter(Boolean);

  return (
    <div className={`${container} py-10`}>
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-full bg-caramel/20 text-caramel-dark font-serif-display text-xl flex items-center justify-center" aria-hidden="true">
          {user.name?.[0]?.toUpperCase() || "G"}
        </div>
        <div>
          <h1 className="font-serif-display text-3xl text-espresso">{user.name}</h1>
          <p className="text-sm text-charcoal-soft">{user.guest ? "Guest session — sign up to keep your order history" : user.email}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-8">
        <nav className="flex md:flex-col gap-1 overflow-x-auto scroll-thin -mx-4 px-4 md:mx-0 md:px-0" aria-label="Profile sections">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t ? "bg-cream-dim text-espresso" : "text-charcoal-soft hover:bg-cream-dim/70"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 md:mt-4 whitespace-nowrap"
          >
            Log out
          </button>
        </nav>

        <section aria-label={tab} className="min-w-0">
          {tab === "Orders" &&
            (orders.length === 0 ? (
              <EmptyState title="No orders yet." action={<Link to="/menu" className={btn.primary}>Browse the menu</Link>}>
                Your orders will show up here.
              </EmptyState>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {orders.map((o) => (
                  <li key={o.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-espresso text-sm">
                        {o.id} <span className="font-normal text-charcoal-soft">· {o.date}</span>
                      </p>
                      <p className="text-sm text-charcoal-soft mt-0.5">{o.items.join(", ")}</p>
                      {o.donation > 0 && <p className="text-xs text-leaf mt-1">Included {formatRupees(o.donation)} for community meals</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-espresso nums">{formatRupees(o.total)}</p>
                      <span className="text-xs text-charcoal-soft">{o.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ))}

          {tab === "Your contribution" && (
            <div className="max-w-xl">
              {donated > 0 ? (
                <>
                  <dl className="grid grid-cols-2 gap-6 border-y border-line py-5">
                    <Stat label={`added across ${donatedOrders} ${donatedOrders === 1 ? "order" : "orders"}`} value={formatRupees(donated)} tone="leaf" />
                    <Stat label="community meals, roughly" value={`≈ ${mealsFromAmount(donated).toFixed(1)}`} />
                  </dl>
                  <p className="text-sm text-charcoal-soft mt-5 leading-relaxed">
                    Thanks. Your contributions are part of the {formatRupees(impact.contributions.amount)} customers have added since
                    the pilot began, alongside {impact.allTime.meals} meals rescued from our kitchen.
                  </p>
                </>
              ) : (
                <EmptyState title="Nothing here yet — and that's fine.">
                  You can add a small contribution to any order from your cart. It helps fund community meals at our partner
                  kitchens.
                </EmptyState>
              )}
              <Link to="/impact" className={`${btn.link} inline-block mt-5`}>
                See the café's overall impact →
              </Link>
            </div>
          )}

          {tab === "Favourites" &&
            (favoriteItems.length === 0 ? (
              <EmptyState title="No favourites saved yet." />
            ) : (
              <ul className="grid sm:grid-cols-2 gap-3">
                {favoriteItems.map((item) => (
                  <li key={item.id} className="bg-paper border border-line rounded-xl p-3 flex gap-3 items-center">
                    <FoodImage src={item.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">{item.name}</p>
                      <p className="text-xs text-charcoal-soft nums">{formatRupees(item.price)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ))}

          {tab === "Details" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfile({ name: name.trim() || user.name, phone: phone.trim() });
                showToast("Details saved");
              }}
              className="max-w-md space-y-4"
            >
              <div>
                <label htmlFor="pf-name" className={field.label}>Full name</label>
                <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} className={field.input} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="pf-phone" className={field.label}>Phone</label>
                <input id="pf-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field.input} autoComplete="tel" />
              </div>
              {(user.addresses || []).length > 0 && (
                <div>
                  <p className={field.label}>Saved address</p>
                  {user.addresses.map((a) => (
                    <p key={a.id} className="text-sm text-charcoal-soft">
                      <span className="text-charcoal">{a.label}:</span> {a.line}
                    </p>
                  ))}
                </div>
              )}
              <button type="submit" className={btn.primary}>
                Save
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
