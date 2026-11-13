// Tiny client for our own REST API. The base URL comes from VITE_API_URL
// (see .env.example) — never hard-coded.
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "cc_token";

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // storage blocked: the session just won't survive a refresh
    }
  },
};

export async function api(path, { method = "GET", body } = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine && method !== "GET") {
    throw new ApiError("You're offline. Reconnect and try again.", 0);
  }
  const token = tokenStore.get();
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { ...(body && { "Content-Type": "application/json" }), ...(token && { Authorization: `Bearer ${token}` }) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      navigator.onLine ? "We couldn't reach the café's server. Please try again in a moment." : "You're offline. Reconnect and try again.",
      0
    );
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error || "Something went wrong. Please try again.", res.status, data?.fields);
  return data;
}
