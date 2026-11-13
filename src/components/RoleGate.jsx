import { Link, useLocation } from "react-router-dom";
import { ROLE_LABELS } from "../data/site";
import { useAuth } from "../hooks/useAppContext";
import { btn } from "../lib/styles";
import DemoSwitcher from "./DemoSwitcher";
import { Spinner } from "./ui";

// Staff and partner pages. The real protection is on the server (every staff/partner
// endpoint checks the role); this just explains what's going on to the visitor.
export default function RoleGate({ role, children, why }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="py-24 flex justify-center text-charcoal-soft" aria-label="Loading">
        <Spinner />
      </div>
    );
  }
  if (user?.role === role) return children;

  const label = ROLE_LABELS[role];
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-caramel-dark">{label} view</p>
      <h1 className="font-serif-display text-3xl text-espresso mt-2">This page is for {label.toLowerCase()} accounts.</h1>
      <p className="text-charcoal-soft mt-3 leading-relaxed">{why}</p>
      <div className="mt-6 flex flex-wrap justify-center items-center gap-3">
        {!user && (
          <Link to="/login" state={{ from: location.pathname }} className={btn.primary}>
            Log in
          </Link>
        )}
        <DemoSwitcher />
      </div>
      <p className="text-xs text-charcoal-soft mt-4">For the demo, use the switcher to sign in as a seeded {label.toLowerCase()} account.</p>
    </div>
  );
}
