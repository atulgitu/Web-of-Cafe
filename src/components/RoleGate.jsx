import { ROLES } from "../data/site";
import { useRole } from "../hooks/useAppContext";
import { btn } from "../lib/styles";

// Staff and partner pages are open to anyone in this prototype, but we ask the
// visitor to switch the demo role first so it's clear whose view they're seeing.
export default function RoleGate({ role, children, why }) {
  const { role: current, setRole } = useRole();
  if (current === role) return children;
  const label = ROLES.find((r) => r.id === role).label;

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-caramel-dark">{label} view</p>
      <h1 className="font-serif-display text-3xl text-espresso mt-2">This page is for {label.toLowerCase()}s.</h1>
      <p className="text-charcoal-soft mt-3 leading-relaxed">{why}</p>
      <button type="button" onClick={() => setRole(role)} className={`${btn.primary} mt-6`}>
        Switch to the {label.toLowerCase()} view
      </button>
      <p className="text-xs text-charcoal-soft mt-4">
        Role switching is a demo feature. A live version would use separate staff and partner accounts.
      </p>
    </div>
  );
}
