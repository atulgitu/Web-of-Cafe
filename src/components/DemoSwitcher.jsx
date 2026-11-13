import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../data/site";
import { useAuth, useToast } from "../hooks/useAppContext";
import { api } from "../lib/api";

const homeFor = { STAFF: "/dashboard", PARTNER: "/partner", CUSTOMER: "/" };

// Demo role switcher: signs in as one of the seeded demo accounts with a real
// login, so the server's role checks still apply. It only appears when the API
// runs with DEMO_MODE=true (GET /api/demo/accounts returns 404 otherwise).
function useDemoAccounts() {
  const [demo, setDemo] = useState(null);
  useEffect(() => {
    api("/demo/accounts").then(setDemo).catch(() => setDemo(null));
  }, []);
  return demo;
}

function Options({ demo, onPicked }) {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);

  const pick = async (account) => {
    setBusy(account.email);
    try {
      await login(account.email, demo.password);
      showToast(`Signed in as ${account.name} (${ROLE_LABELS[account.role].toLowerCase()})`);
      navigate(homeFor[account.role]);
      onPicked?.();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <ul className="space-y-1">
      {demo.accounts.map((a) => {
        const current = user?.email === a.email;
        return (
          <li key={a.email}>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => pick(a)}
              aria-pressed={current}
              className={`w-full text-left rounded-lg px-3 py-2 transition-colors disabled:opacity-60 ${current ? "bg-cream-dim" : "hover:bg-cream-dim/70"}`}
            >
              <span className="flex items-center justify-between text-sm font-medium text-espresso">
                {ROLE_LABELS[a.role]}
                {current ? <span className="text-xs text-leaf">Signed in</span> : busy === a.email && <span className="text-xs">…</span>}
              </span>
              <span className="block text-xs text-charcoal-soft mt-0.5">{a.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function DemoSwitcher() {
  const demo = useDemoAccounts();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!demo) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-espresso/25 px-3 py-1.5 text-xs text-charcoal-soft hover:border-espresso/50 hover:text-espresso transition-colors"
      >
        <span className="font-semibold uppercase tracking-wide text-[10px]">Demo</span>
        <span className="text-espresso font-medium">{user ? ROLE_LABELS[user.role] : "Switch role"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-paper border border-line rounded-xl shadow-lg p-2 animate-fade-in z-50">
          <p className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-caramel-dark">Demo role switcher</p>
          <p className="px-3 pb-2 text-xs text-charcoal-soft leading-relaxed">
            Signs in as a seeded demo account. The server still checks every permission — this only exists in demo mode.
          </p>
          <Options demo={demo} onPicked={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// Inline version for the account page on mobile.
export function DemoSwitcherInline() {
  const demo = useDemoAccounts();
  if (!demo) return null;
  return (
    <section className="border border-dashed border-espresso/25 rounded-xl p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-wide text-caramel-dark">Demo role switcher</h2>
      <p className="text-xs text-charcoal-soft mt-1 mb-3 leading-relaxed">
        Sign in as a demo customer, café staff member or community partner. Permissions are still enforced by the server.
      </p>
      <Options demo={demo} />
    </section>
  );
}
