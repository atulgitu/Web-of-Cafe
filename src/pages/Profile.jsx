import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getItemById } from "../data/menu";

const tabs = ["Personal Info", "Order History", "Favourites", "Addresses", "Settings"];

export default function Profile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState(tabs[0]);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Profile updated");
  };

  const favoriteItems = (user?.favorites || []).map(getItemById).filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-caramel/20 text-caramel-dark font-serif-display text-xl flex items-center justify-center">
          {user?.name?.[0]?.toUpperCase() || "G"}
        </div>
        <div>
          <h1 className="font-serif-display text-2xl text-espresso">{user?.name}</h1>
          {user?.email && <p className="text-sm text-charcoal-soft">{user.email}</p>}
          {user?.guest && <p className="text-sm text-charcoal-soft">Guest session — sign up to save your preferences</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-8">
        <nav className="flex md:flex-col gap-1 overflow-x-auto scroll-thin" aria-label="Profile sections">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t ? "bg-cream-dim text-espresso" : "text-charcoal-soft hover:bg-cream-dim"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-2"
          >
            Logout
          </button>
        </nav>

        <div>
          {tab === "Personal Info" && (
            <form onSubmit={handleSave} className="bg-white border border-line rounded-xl p-6 space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-caramel" />
              </div>
              <button type="submit" className="px-5 py-2.5 rounded-full bg-espresso text-cream text-sm font-medium hover:bg-espresso-light transition-colors">
                Save Changes
              </button>
            </form>
          )}

          {tab === "Order History" && (
            <div className="space-y-3">
              {(user?.orders || []).length === 0 ? (
                <p className="text-sm text-charcoal-soft">No orders yet — your order history will appear here.</p>
              ) : (
                user.orders.map((o) => (
                  <div key={o.id} className="bg-white border border-line rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-espresso text-sm">{o.id}</p>
                      <p className="text-xs text-charcoal-soft mt-0.5">{o.items.join(", ")}</p>
                      <p className="text-xs text-charcoal-soft mt-0.5">{o.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-espresso">₹{o.total}</p>
                      <span className="text-xs text-sage-dark">{o.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "Favourites" && (
            <div className="grid sm:grid-cols-2 gap-4">
              {favoriteItems.length === 0 ? (
                <p className="text-sm text-charcoal-soft">You haven't saved any favourites yet.</p>
              ) : (
                favoriteItems.map((item) => (
                  <div key={item.id} className="bg-white border border-line rounded-xl p-3 flex gap-3 items-center">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">{item.name}</p>
                      <p className="text-xs text-charcoal-soft">₹{item.price}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "Addresses" && (
            <div className="space-y-3">
              {(user?.addresses || []).length === 0 ? (
                <p className="text-sm text-charcoal-soft">No saved addresses yet.</p>
              ) : (
                user.addresses.map((a) => (
                  <div key={a.id} className="bg-white border border-line rounded-xl p-4">
                    <p className="text-sm font-medium text-espresso">{a.label}</p>
                    <p className="text-sm text-charcoal-soft mt-0.5">{a.line}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "Settings" && (
            <div className="bg-white border border-line rounded-xl p-6 max-w-md space-y-4">
              <label className="flex items-center justify-between text-sm text-charcoal">
                Order updates via SMS
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-caramel-dark" />
              </label>
              <label className="flex items-center justify-between text-sm text-charcoal">
                Promotional emails
                <input type="checkbox" className="w-4 h-4 accent-caramel-dark" />
              </label>
              <button
                onClick={() => showToast("Preferences saved")}
                className="px-5 py-2.5 rounded-full bg-espresso text-cream text-sm font-medium hover:bg-espresso-light transition-colors"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
