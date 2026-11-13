import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAppContext";
import { BagHeartIcon, ChartIcon, ClipboardIcon, CupIcon, HomeIcon, UserIcon } from "./icons";

// Mobile-only tab bar. Staff and partners get their own workspace in the 4th slot.
export default function BottomNav() {
  const { user } = useAuth();
  const fourth =
    user?.role === "STAFF"
      ? { to: "/dashboard", label: "Kitchen", Icon: ClipboardIcon }
      : user?.role === "PARTNER"
        ? { to: "/partner", label: "Pickups", Icon: ClipboardIcon }
        : { to: "/impact", label: "Impact", Icon: ChartIcon };

  const items = [
    { to: "/", label: "Home", Icon: HomeIcon, end: true },
    { to: "/menu", label: "Menu", Icon: CupIcon },
    { to: "/rescue", label: "Rescue", Icon: BagHeartIcon },
    fourth,
    { to: user ? "/profile" : "/login", label: user ? "Account" : "Log in", Icon: UserIcon },
  ];

  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-cream/95 backdrop-blur-sm border-t border-line pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, Icon, end }) => (
          <li key={label}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 h-16 text-[11px] font-medium transition-colors ${
                  isActive ? "text-espresso" : "text-charcoal-soft"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${isActive ? "bg-cream-dim" : ""}`}>
                    <Icon />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
