import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useCart } from "./useAppContext";

// Asks the server to price the current cart (prices, coupon, tax, contribution).
// Debounced so rapid quantity taps send one request.
export default function useQuote() {
  const { lines, orderRequest } = useCart();
  const [state, setState] = useState({ quote: null, error: null, loading: false });
  const body = JSON.stringify(orderRequest);

  useEffect(() => {
    if (!lines.length) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, loading: true }));
      api("/orders/quote", { method: "POST", body: JSON.parse(body) })
        .then((quote) => !cancelled && setState({ quote, error: null, loading: false }))
        // keep the last good total on screen, but report the error so the page can show it
        .catch((error) => !cancelled && setState((s) => ({ ...s, error, loading: false })));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [body, lines.length]);

  return state;
}
