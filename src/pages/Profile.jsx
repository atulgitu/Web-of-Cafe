import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DemoSwitcherInline } from "../components/DemoSwitcher";
import { EmptyState, ErrorState, Skeleton, Spinner, Stat } from "../components/ui";
import { ROLE_LABELS } from "../data/site";
import useApi from "../hooks/useApi";
import { useAuth, useToast } from "../hooks/useAppContext";
import useOnline from "../hooks/useOnline";
import { api } from "../lib/api";
import { formatDate, formatRupees } from "../lib/format";
import { statusLabel } from "../lib/orders";
import { btn, container, field } from "../lib/styles";

const tabs = ["Orders", "Your contribution", "Details"];

export default function Profile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState(tabs[0]);

  return (
    <div className={`${container} py-8 sm:py-10`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-caramel/20 text-caramel-dark font-serif-display text-xl flex items-center justify-center" aria-hidden="true">
          {user.name[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="font-serif-display text-3xl text-espresso truncate">{user.name}</h1>
          <p className="text-sm text-charcoal-soft truncate">
            {user.email} · {ROLE_LABELS[user.role]}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[200px_1fr] gap-8">
        <nav className="flex md:flex-col gap-1 overflow-x-auto scroll-thin -mx-4 px-4 md:mx-0 md:px-0" aria-label="Account sections">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className={`text-left min-h-10 px-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
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
              showToast("Logged out");
              navigate("/");
            }}
            className="text-left min-h-10 px-3 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 md:mt-4 whitespace-nowrap"
          >
            Log out
          </button>
        </nav>

        <section aria-label={tab} className="min-w-0 space-y-10">
          {tab === "Orders" && <Orders />}
          {tab === "Your contribution" && <Contributions />}
          {tab === "Details" && <Details />}
          <div className="lg:hidden">
            <DemoSwitcherInline />
          </div>
        </section>
      </div>
    </div>
  );
}

function Orders() {
  const { data, error, loading, reload } = useApi("/orders/my");
  if (loading) return <Skeleton className="h-40" />;
  if (error) return <ErrorState title="We couldn't load your orders." error={error} onRetry={reload} />;
  if (!data.orders.length) {
    return (
      <EmptyState title="No orders yet." action={<Link to="/menu" className={btn.primary}>Browse the menu</Link>}>
        Your orders will show up here.
      </EmptyState>
    );
  }
  return (
    <ul className="divide-y divide-line border-y border-line">
      {data.orders.map((o) => (
        <li key={o.id}>
          <Link to={`/order/${o.id}`} className="py-4 flex items-start justify-between gap-4 hover:bg-cream-dim/40 -mx-2 px-2 rounded">
            <div className="min-w-0">
              <p className="font-medium text-espresso text-sm">
                {o.code} <span className="font-normal text-charcoal-soft">· {formatDate(o.createdAt)}</span>
              </p>
              <p className="text-sm text-charcoal-soft mt-0.5 truncate">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
              {o.contribution > 0 && <p className="text-xs text-leaf mt-1">Included {formatRupees(o.contribution)} for community meals</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="font-medium text-espresso nums">{formatRupees(o.total)}</p>
              <span className="text-xs text-charcoal-soft">{statusLabel(o.status)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Contributions() {
  const { data, error, loading, reload } = useApi("/contributions/my");
  const { showToast } = useToast();
  const online = useOnline();
  const [amount, setAmount] = useState(50);
  const [saving, setSaving] = useState(false);

  const contribute = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/contributions", { method: "POST", body: { amount: Number(amount) } });
      showToast(`Thank you — ₹${amount} added for community meals`);
      reload();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton className="h-40" />;
  if (error) return <ErrorState title="We couldn't load your contributions." error={error} onRetry={reload} />;

  return (
    <div className="max-w-xl space-y-8">
      {data.total > 0 ? (
        <>
          <dl className="grid grid-cols-2 gap-6 border-y border-line py-5">
            <Stat label={`contributed across ${data.contributions.length} ${data.contributions.length === 1 ? "time" : "times"}`} value={formatRupees(data.total)} tone="leaf" />
            <Stat label={`community meals, at about ₹${data.estimates.mealCostRupees} each (estimate)`} value={`≈ ${data.estimates.mealsFunded}`} />
          </dl>
          <ul className="text-sm divide-y divide-line">
            {data.contributions.map((c) => (
              <li key={c.id} className="flex justify-between py-2">
                <span className="text-charcoal-soft">
                  {formatDate(c.createdAt)} {c.orderCode ? `· with order ${c.orderCode}` : "· on its own"}
                </span>
                <span className="nums text-charcoal">{formatRupees(c.amount)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <EmptyState title="Nothing here yet — and that's fine.">
          You can add a small contribution to any order from your cart, or here on its own.
        </EmptyState>
      )}

      <form onSubmit={contribute} className="border border-line rounded-xl bg-paper p-5">
        <h2 className="font-medium text-espresso">Contribute without ordering</h2>
        <p className="text-sm text-charcoal-soft mt-1">Demo payment — nothing is charged, but it's recorded and counted on the impact page.</p>
        <div className="mt-4 flex gap-2 items-end">
          <div className="w-32">
            <label htmlFor="standalone-amount" className={field.label}>
              Amount (₹)
            </label>
            <input id="standalone-amount" type="number" min="1" max="10000" value={amount} onChange={(e) => setAmount(e.target.value)} className={field.input} />
          </div>
          <button type="submit" disabled={saving || !online || !(Number(amount) >= 1)} className={btn.leaf}>
            {saving && <Spinner />} Contribute
          </button>
        </div>
      </form>
    </div>
  );
}

function Details() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() || user.name, phone: phone.trim() });
      showToast("Details saved");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-md space-y-4">
      <div>
        <label htmlFor="pf-name" className={field.label}>
          Full name
        </label>
        <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} className={field.input} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="pf-phone" className={field.label}>
          Phone
        </label>
        <input id="pf-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field.input} autoComplete="tel" />
      </div>
      <button type="submit" disabled={saving} className={btn.primary}>
        {saving && <Spinner />} Save
      </button>
    </form>
  );
}
