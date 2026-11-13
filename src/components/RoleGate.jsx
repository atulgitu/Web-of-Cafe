import { Link, useLocation } from "react-router-dom";
import { ROLE_LABELS } from "../data/site";
import { useAuth } from "../hooks/useAppContext";
import { homeForRole } from "../lib/accountLinks";
import { btn } from "../lib/styles";
import { Spinner } from "./ui";

// Staff and partner pages. This only decides what the browser shows: the real
// protection is on the server, where every staff/partner endpoint checks the
// signed-in account's role (from the database) and refuses with 401/403.
export default function RoleGate({ role, children, why }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="py-24 flex justify-center text-charcoal-soft" role="status" aria-label="Checking your account">
        <Spinner />
      </div>
    );
  }
  if (user?.role === role) return children;

  const label = ROLE_LABELS[role].toLowerCase();
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="font-serif-display text-3xl text-espresso">This page is for {label} accounts.</h1>
      <p className="text-charcoal-soft mt-3 leading-relaxed">{why}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {user ? (
          <Link to={homeForRole(user.role)} className={btn.primary}>
            Go to your page
          </Link>
        ) : (
          <Link to="/login" state={{ from: location.pathname }} className={btn.primary}>
            Sign in
          </Link>
        )}
        <Link to="/" className={btn.secondary}>
          Home
        </Link>
      </div>
      {user && <p className="text-sm text-charcoal-soft mt-4">You're signed in as {user.name}, which doesn't have access to this page.</p>}
    </div>
  );
}
