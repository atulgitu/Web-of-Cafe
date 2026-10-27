import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../data/site";
import { useRole } from "../hooks/useAppContext";

const homeFor = { staff: "/dashboard", partner: "/partner" };

function useSelectRole(onDone) {
  const { setRole } = useRole();
  const navigate = useNavigate();
  return (id) => {
    setRole(id);
    if (homeFor[id]) navigate(homeFor[id]);
    onDone?.();
  };
}

function RoleOptions({ onSelect, current }) {
  return (
    <ul className="space-y-1">
      {ROLES.map((r) => (
        <li key={r.id}>
          <button
            type="button"
            onClick={() => onSelect(r.id)}
            aria-pressed={current === r.id}
            className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
              current === r.id ? "bg-cream-dim" : "hover:bg-cream-dim/70"
            }`}
          >
            <span className="flex items-center justify-between text-sm font-medium text-espresso">
              {r.label}
              {current === r.id && <span className="text-xs text-leaf">Current</span>}
            </span>
            <span className="block text-xs text-charcoal-soft mt-0.5">{r.hint}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// Compact dropdown for the desktop navbar.
export default function RoleSwitcher() {
  const { role } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const select = useSelectRole(() => setOpen(false));
  const current = ROLES.find((r) => r.id === role);

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 rounded-full border border-dashed border-espresso/25 px-3 py-1.5 text-xs text-charcoal-soft hover:border-espresso/50 hover:text-espresso transition-colors"
      >
        <span className="font-semibold uppercase tracking-wide text-[10px]">Demo</span>
        <span className="text-espresso font-medium">{current.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-paper border border-line rounded-xl shadow-lg p-2 animate-fade-in">
          <p className="px-3 pt-1 pb-2 text-xs text-charcoal-soft leading-relaxed">
            Switch views to try each side of the platform. This is for demonstration only — it doesn't change your account.
          </p>
          <RoleOptions current={role} onSelect={select} />
        </div>
      )}
    </div>
  );
}

// Inline version for the mobile menu.
export function RoleSwitcherInline({ onDone }) {
  const { role } = useRole();
  const select = useSelectRole(onDone);
  return (
    <div>
      <p className="text-xs text-charcoal-soft mb-2">
        <span className="font-semibold uppercase tracking-wide text-[10px] mr-1">Demo view</span>
        Switch roles to try each side of the platform.
      </p>
      <RoleOptions current={role} onSelect={select} />
    </div>
  );
}
