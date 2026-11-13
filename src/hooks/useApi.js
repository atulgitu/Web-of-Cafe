import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";

// Loads `path` and gives { data, error, loading, reload }. Pass null to skip.
// `reload()` refetches without clearing the current data, so the page doesn't flash.
export default function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    api(path)
      .then((data) => !cancelled && setState({ data, error: null, loading: false }))
      .catch((error) => !cancelled && setState((s) => ({ data: s.data, error, loading: false })));
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
