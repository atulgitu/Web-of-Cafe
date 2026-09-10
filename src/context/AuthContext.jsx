import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "brewbean_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setInitializing(false);
  }, []);

  const persist = (u) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email, _password) => {
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/[._]/g, " ");
    persist({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      guest: false,
      phone: "+91 98765 43210",
      addresses: [
        { id: 1, label: "Home", line: "12B, Palm Residency, Koramangala, Bengaluru" },
      ],
      orders: [
        {
          id: "BB-10231",
          date: "2 Sep 2026",
          items: ["Signature Filter Coffee", "Belgian Chocolate Brownie"],
          total: 270,
          status: "Completed",
        },
        {
          id: "BB-10198",
          date: "27 Aug 2026",
          items: ["Cafe Latte", "Peri Peri Fries"],
          total: 330,
          status: "Completed",
        },
      ],
      favorites: ["c5", "d1", "cd2"],
    });
  };

  const loginAsGuest = () => {
    persist({ name: "Guest", email: null, guest: true, phone: "", addresses: [], orders: [], favorites: [] });
  };

  const signup = async (name, email, _password) => {
    await new Promise((r) => setTimeout(r, 600));
    persist({ name, email, guest: false, phone: "", addresses: [], orders: [], favorites: [] });
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, initializing, login, loginAsGuest, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
