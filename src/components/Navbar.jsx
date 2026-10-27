import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useCart, useRole } from "../hooks/useAppContext";
import Logo from "./Logo";
import RoleSwitcher, { RoleSwitcherInline } from "./RoleSwitcher";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/menu", label: "Menu" },
  { to: "/rescue", label: "Rescue" },
  { to: "/impact", label: "Impact" },
  { to: "/about", label: "About" },
];

// One extra link depending on the demo role, so the bar never gets crowded.
const roleLinks = {
  staff: { to: "/dashboard", label: "Dashboard" },
  partner: { to: "/partner", label: "My pickups" },
};

const linkClass = ({ isActive }) =>
  `relative px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "text-espresso after:absolute after:left-3 after:right-3 after:-bottom-px after:h-0.5 after:bg-caramel"
      : "text-charcoal-soft hover:text-espresso"
  }`;

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const extra = roleLinks[role];

  // Close menus when the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setAccountOpen(false);
  }

  useEffect(() => {
    if (!accountOpen) return;
    const onDown = (e) => accountRef.current && !accountRef.current.contains(e.target) && setAccountOpen(false);
    const onKey = (e) => e.key === "Escape" && setAccountOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="Brew & Care home">
          <Logo size={32} />
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
            <RoleSwitcher />
          </div>

          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            className="relative p-2 rounded-full hover:bg-cream-dim text-charcoal-soft hover:text-espresso"
          >
            <CartIcon />
            {itemCount > 0 && (
              <span
                key={itemCount}
                className="absolute -top-0.5 -right-0.5 bg-caramel-dark text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center animate-fade-in nums"
                aria-hidden="true"
              >
                {itemCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((o) => !o)}
              aria-label="Account"
              aria-expanded={accountOpen}
              className="p-2 rounded-full hover:bg-cream-dim text-charcoal-soft hover:text-espresso"
            >
              <UserIcon />
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-paper border border-line rounded-xl shadow-lg py-1 animate-fade-in">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm border-b border-line">
                      <p className="font-medium text-espresso truncate">{user.name}</p>
                      {user.guest && <p className="text-xs text-charcoal-soft">Guest session</p>}
                    </div>
                    <Link to="/profile" className="block px-3 py-2 text-sm hover:bg-cream-dim">
                      Orders &amp; contributions
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-cream-dim text-red-700"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="block px-3 py-2 text-sm hover:bg-cream-dim">
                    Log in or sign up
                  </Link>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-full hover:bg-cream-dim text-charcoal-soft"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="lg:hidden border-t border-line bg-cream max-h-[calc(100vh-4rem)] overflow-y-auto animate-fade-in">
          <nav className="px-4 py-2 flex flex-col" aria-label="Mobile">
            {[...navLinks, ...(extra ? [extra] : [])].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `py-3 text-base border-b border-line/70 ${isActive ? "text-espresso font-medium" : "text-charcoal-soft"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="px-4 py-4">
            <RoleSwitcherInline onDone={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 8h14l-1.2 11.2a2 2 0 01-2 1.8H8.2a2 2 0 01-2-1.8L5 8z" strokeLinejoin="round" />
      <path d="M9 8V6.5a3 3 0 016 0V8" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
