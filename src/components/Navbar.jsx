import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../data/site";
import { accountLinks } from "../lib/accountLinks";
import { useAuth, useCart, useToast } from "../hooks/useAppContext";
import Logo from "./Logo";
import { CartIcon, UserIcon } from "./icons";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/menu", label: "Menu" },
  { to: "/rescue", label: "Rescue" },
  { to: "/impact", label: "Impact" },
  { to: "/about", label: "About" },
];

// One extra link for signed-in staff or partners: their own workspace.
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

const mobileLinkClass = ({ isActive }) =>
  `flex items-center justify-between px-4 sm:px-6 py-3.5 text-base border-b border-line ${
    isActive ? "font-medium text-espresso bg-cream-dim/70" : "text-charcoal hover:bg-cream-dim/60"
  }`;

// Desktop (lg+): links in the bar, cart and account on the right.
// Phones and tablets: logo, cart and a Menu button that opens the full list of pages.
export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const extra = user && roleLinks[user.role];

  const signOut = () => {
    logout();
    setAccountOpen(false);
    setMenuOpen(false);
    showToast("Signed out");
    navigate("/");
  };

  // Close menus when the page changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setAccountOpen(false);
    setMenuOpen(false);
  }

  // Close whichever menu is open on outside click or Escape.
  useEffect(() => {
    if (!accountOpen && !menuOpen) return;
    const close = () => {
      setAccountOpen(false);
      setMenuOpen(false);
    };
    const inside = (t) => accountRef.current?.contains(t) || menuRef.current?.contains(t) || menuButtonRef.current?.contains(t);
    const onDown = (e) => !inside(e.target) && close();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (menuOpen) menuButtonRef.current?.focus();
      close();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen, menuOpen]);

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

          {user ? (
            <div className="relative hidden lg:block" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((o) => !o)}
                aria-expanded={accountOpen}
                aria-controls="account-menu"
                className="flex items-center gap-2 min-h-11 pl-2.5 pr-3 rounded-full text-sm font-medium text-espresso hover:bg-cream-dim"
              >
                <UserIcon />
                <span className="max-w-[9rem] truncate">{user.name.split(" ")[0]}</span>
                <span className="sr-only">, account menu</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {accountOpen && (
                <div id="account-menu" className="absolute right-0 mt-2 w-60 bg-paper border border-line rounded-lg shadow-md py-1 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-line">
                    <p className="text-sm font-medium text-espresso truncate">{user.name}</p>
                    {user.role !== "CUSTOMER" && <p className="text-xs text-charcoal-soft">{ROLE_LABELS[user.role]}</p>}
                  </div>
                  {accountLinks(user.role).map((l) => (
                    <Link key={l.to} to={l.to} className="block px-4 py-2.5 text-sm text-charcoal hover:bg-cream-dim">
                      {l.label}
                    </Link>
                  ))}
                  <button type="button" onClick={signOut} className="w-full text-left px-4 py-2.5 text-sm text-charcoal hover:bg-cream-dim border-t border-line">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden lg:inline-flex items-center gap-2 min-h-11 px-3 rounded-full text-sm font-medium text-espresso hover:bg-cream-dim">
              <UserIcon />
              Sign in
            </Link>
          )}

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="lg:hidden flex items-center gap-1.5 min-h-11 px-3 rounded-full text-sm font-medium text-espresso hover:bg-cream-dim"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
            {/* the word is dropped on the narrowest phones (320px) so the bar fits */}
            <span aria-hidden="true" className="hidden min-[360px]:inline">
              {menuOpen ? "Close" : "Menu"}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="lg:hidden absolute inset-x-0 top-full bg-paper border-b border-line shadow-lg max-h-[calc(100dvh-3.5rem)] overflow-y-auto animate-fade-in"
        >
          <nav aria-label="Main" className="max-w-6xl mx-auto">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={mobileLinkClass}>
                {l.label}
              </NavLink>
            ))}
            {extra && (
              <NavLink to={extra.to} className={mobileLinkClass}>
                {extra.label}
                <span className="text-xs text-charcoal-soft">{ROLE_LABELS[user.role]}</span>
              </NavLink>
            )}
            <NavLink to="/cart" className={mobileLinkClass}>
              Cart
              {itemCount > 0 && (
                <span className="text-sm text-charcoal-soft nums">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </span>
              )}
            </NavLink>
          </nav>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            {user ? (
              <>
                <p className="text-xs text-charcoal-soft">
                  Signed in as <span className="font-medium text-espresso">{user.name}</span>
                </p>
                <ul className="mt-1">
                  {accountLinks(user.role).map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="block py-2.5 text-sm text-charcoal hover:text-espresso">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={signOut} className="mt-1 py-2.5 text-sm font-medium text-caramel-dark">
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1 inline-flex justify-center items-center rounded-full bg-espresso text-cream text-sm font-medium py-3 hover:bg-espresso-light">
                  Sign in
                </Link>
                <Link
                  to="/login?mode=register"
                  className="flex-1 inline-flex justify-center items-center rounded-full border border-espresso/20 text-espresso text-sm font-medium py-3 hover:bg-cream-dim"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
