import { useEffect, useState } from "react";

// useState that mirrors itself into localStorage. Storage can be unavailable
// (private mode, blocked site data), so every access is guarded.
export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch {
      // fall through to the initial value
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  useEffect(() => {
    try {
      if (value === null || value === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable — state still works for this session
    }
  }, [key, value]);

  return [value, setValue];
}
