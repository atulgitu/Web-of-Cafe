import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { menuItems } from "../data/menu";
import Logo from "./Logo";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = query.trim()
    ? menuItems.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5)
    : [];

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/menu?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b transition-shadow duration-200 ${
        scrolled ? "border-line shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_4px_16px_-8px_rgba(59,42,32,0.15)]" : "border-line/70"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-[height] duration-200 ${
          scrolled ? "h-14" : "h-16"
        }`}
      >
        <Link to="/" className="flex items-center shrink-0" aria-label="Brew & Bean home">
          <Logo size={scrolled ? 28 : 32} />
        </Link>

        <nav className="hidden md:flex items-center gap-1.5" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "text-espresso bg-cream-dim" : "text-charcoal-soft hover:text-espresso hover:bg-cream-dim"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative hidden sm:block">
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center">
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  placeholder="Search menu…"
                  className="w-48 lg:w-64 px-3 py-1.5 rounded-full border border-line bg-white text-sm focus:outline-none focus:ring-2 focus:ring-caramel"
                  aria-label="Search menu"
                />
                {results.length > 0 && (
                  <ul className="absolute top-10 left-0 w-64 bg-white border border-line rounded-lg shadow-lg overflow-hidden">
                    {results.map((r) => (
                      <li key={r.id}>
                        <button
                          type="button"
                          onMouseDown={() => {
                            navigate(`/menu?search=${encodeURIComponent(r.name)}`);
                            setSearchOpen(false);
                            setQuery("");
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-cream-dim flex items-center justify-between"
                        >
                          <span>{r.name}</span>
                          <span className="text-charcoal-soft">₹{r.price}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
                className="p-2 rounded-full hover:bg-cream-dim text-charcoal-soft hover:text-espresso"
              >
                <SearchIcon />
              </button>
            )}
          </div>

          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} items`}
            className="relative p-2 rounded-full hover:bg-cream-dim text-charcoal-soft hover:text-espresso"
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-caramel-dark text-white text-[10px] font-semibold rounded-full w-4.5 h-4.5 min-w-[18px] h-[18px] flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              aria-label="Account menu"
              aria-expanded={profileOpen}
              className="p-2 rounded-full hover:bg-cream-dim text-charcoal-soft hover:text-espresso"
            >
              <UserIcon />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-line rounded-lg shadow-lg py-1 animate-fade-in">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm border-b border-line">
                      <p className="font-medium text-espresso truncate">{user.name}</p>
                      {user.guest && <p className="text-xs text-charcoal-soft">Guest session</p>}
                    </div>
                    <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm hover:bg-cream-dim">
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                        navigate("/login");
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-cream-dim text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm hover:bg-cream-dim">
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-full hover:bg-cream-dim text-charcoal-soft"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-line bg-cream animate-fade-in" aria-label="Mobile">
          <div className="px-4 py-2 flex flex-col">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-2 py-3 text-sm font-medium border-b border-line/60 ${isActive ? "text-espresso" : "text-charcoal-soft"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.6 12.4a2 2 0 002 1.6h8.8a2 2 0 002-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
