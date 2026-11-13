import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../data/site";
import { useAuth, useCart, useToast } from "../hooks/useAppContext";
import DemoSwitcher from "./DemoSwitcher";
import Logo from "./Logo";
import { CartIcon, UserIcon } from "./icons";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/menu", label: "Menu" },
  { to: "/rescue", label: "Rescue" },
  { to: "/impact", label: "Impact" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// Pages that don't fit in the phone tab bar. Before this menu existed, About and
// Contact could only be reached on a phone by scrolling to the footer.
const moreLinks = [
  { to: "/about", label: "About the café" },
  { to: "/contact", label: "Contact & opening hours" },
  { to: "/offers", label: "Offers" },
  { to: "/impact", label: "Impact" },
];

// One extra link for signed-in staff or partners.
const roleLinks = {
  STAFF: { to: "/dashboard", label: "Kitchen" },
  PARTNER: { to: "/partner", label: "Pickups" },
};

const linkClass = ({ isActive }) =>
  `relative px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "text-espresso after:absolute after:left-3 after:right-3 after:-bottom-px after:h-0.5 after:bg-caramel"
      : "text-charcoal-soft hover:text-espresso"
  }`;

// Desktop: full navigation. Mobile: a slim top bar (logo, cart, account) — the
// main links live in the bottom navigation instead.
export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const accountRef = useRef(null);
  const moreRef = useRef(null);
  const extra = user && roleLinks[user.role];

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setAccountOpen(false);
    setMoreOpen(false);
  }

  // Close whichever dropdown is open on outside click or Escape.
  useEffect(() => {
    if (!accountOpen && !moreOpen) return;
    const close = () => {
      setAccountOpen(false);
      setMoreOpen(false);
    };
    const onDown = (e) => !accountRef.current?.contains(e.target) && !moreRef.current?.contains(e.target) && close();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen, moreOpen]);

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-line pt-[env(safe-area-inset-top)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="Coffee Cinnamon home">
          <Logo size={30} />
        </Link>

        <nav className="hidden lg:flex items-center" aria-label="Primary">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          {extra && (
            <>
              <span className="mx-2 h-4 w-px bg-line" aria-hidden="true" />
              <NavLink to={extra.to} className={linkClass}>
                {extra.label}
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden lg:block mr-1">
            <DemoSwitcher />
          </div>

          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            className="relative flex items-center justify-center w-11 h-11 rounded-full hover:bg-cream-dim text-charcoal-soft hover:text-espresso"
          >
            <CartIcon />
            {itemCount > 0 && (
              <span
                key={itemCount}
                className="absolute top-0.5 right-0.5 bg-caramel-dark text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center animate-pop nums"
                aria-hidden="true"
              >
                {itemCount}
              </span>
            )}
          </Link>

          <div className="relative lg:hidden" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-controls="more-menu"
              className="flex items-center gap-1.5 min-h-11 px-3 rounded-full text-sm font-medium text-charcoal-soft hover:bg-cream-dim hover:text-espresso"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              More
            </button>
            {moreOpen && (
              <nav id="more-menu" aria-label="More pages" className="absolute right-0 mt-2 w-60 bg-paper border border-line rounded-xl shadow-lg py-1 animate-fade-in">
                {moreLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) => `block px-4 py-3 text-sm hover:bg-cream-dim ${isActive ? "font-medium text-espresso" : "text-charcoal"}`}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>

          <div className="relative hidden lg:block" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((o) => !o)}
              aria-label="Account"
              aria-expanded={accountOpen}
              className="p-2.5 rounded-full hover:bg-cream-dim text-charcoal-soft hover:text-espresso"
            >
              <UserIcon />
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-paper border border-line rounded-xl shadow-lg py-1 animate-fade-in">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm border-b border-line">
                      <p className="font-medium text-espresso truncate">{user.name}</p>
                      <p className="text-xs text-charcoal-soft">{ROLE_LABELS[user.role]}</p>
                    </div>
                    <Link to="/profile" className="block px-3 py-2 text-sm hover:bg-cream-dim">
                      Orders &amp; contributions
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        showToast("Logged out");
                        navigate("/");
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-cream-dim text-red-700"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="block px-3 py-2 text-sm hover:bg-cream-dim">
                    Log in or create an account
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
