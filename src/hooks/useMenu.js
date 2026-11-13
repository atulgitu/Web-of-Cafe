import { useEffect, useState } from "react";
import { api } from "../lib/api";

const CACHE_KEY = "cc_menu_cache";

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(cached) ? cached : null; // ignore anything that isn't a list of items
  } catch {
    return null;
  }
}

// The menu from the API, with the last good copy kept for offline browsing.
export default function useMenu() {
  const [state, setState] = useState(() => {
    const cached = readCache();
    return { items: cached || [], loading: !cached, error: null, fromCache: Boolean(cached) };
  });

  useEffect(() => {
    let cancelled = false;
    api("/menu")
      .then(({ items }) => {
        if (cancelled) return;
        setState({ items, loading: false, error: null, fromCache: false });
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(items));
        } catch {
          // storage full or blocked — fine, we just won't have an offline copy
        }
      })
      .catch((error) => !cancelled && setState((s) => ({ ...s, loading: false, error })));
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
