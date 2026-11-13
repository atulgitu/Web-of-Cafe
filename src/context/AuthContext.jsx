import { useCallback, useEffect, useState } from "react";
import { api, tokenStore } from "../lib/api";
import { AuthContext } from "./contexts";

// Real authentication against our API. The JWT lives in localStorage; the user
// object (including role) always comes from the server via /auth/me.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(tokenStore.get()));

  useEffect(() => {
    if (!tokenStore.get()) return;
    api("/auth/me")
      .then(({ user }) => setUser(user))
      .catch((err) => {
        // Only forget the token if the server rejected it; keep it when we're just offline.
        if (err.status === 401) tokenStore.set(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const startSession = ({ user, token }) => {
    tokenStore.set(token);
    setUser(user);
    return user;
  };

  const login = async (email, password) => startSession(await api("/auth/login", { method: "POST", body: { email, password } }));

  const register = async ({ name, email, password }) =>
    startSession(await api("/auth/register", { method: "POST", body: { name, email, password } }));

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  const updateProfile = async (fields) => {
    const { user } = await api("/auth/me", { method: "PATCH", body: fields });
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
  );
}
