import usePersistentState from "../hooks/usePersistentState";
import { AuthContext } from "./contexts";

// Frontend-only mock auth for the prototype: any email/password signs in.
const STORAGE_KEY = "brewcare_auth";

const sampleHistory = [
  {
    id: "BC-10231",
    date: "22 Oct 2026",
    items: ["Signature Filter Coffee", "Belgian Chocolate Brownie"],
    total: 290,
    donation: 20,
    status: "Completed",
  },
  {
    id: "BC-10198",
    date: "14 Oct 2026",
    items: ["Cafe Latte", "Rajma Chawal Bowl"],
    total: 452,
    donation: 50,
    status: "Completed",
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = usePersistentState(STORAGE_KEY, null);

  const login = async (email) => {
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/[._]/g, " ");
    setUser({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      guest: false,
      phone: "+91 98765 43210",
      addresses: [{ id: 1, label: "Home", line: "12B, Palm Residency, Koramangala, Bengaluru" }],
      orders: sampleHistory,
      favorites: ["c1", "m1", "d1"],
    });
  };

  const loginAsGuest = () => {
    setUser({ name: "Guest", email: null, guest: true, phone: "", addresses: [], orders: [], favorites: [] });
  };

  const signup = async (name, email) => {
    await new Promise((r) => setTimeout(r, 600));
    setUser({ name, email, guest: false, phone: "", addresses: [], orders: [], favorites: [] });
  };

  const updateProfile = (fields) => setUser((u) => (u ? { ...u, ...fields } : u));

  const addOrder = (order) => setUser((u) => (u ? { ...u, orders: [order, ...(u.orders || [])] } : u));

  const toggleFavorite = (id) =>
    setUser((u) => {
      if (!u) return u;
      const favs = u.favorites || [];
      return { ...u, favorites: favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id] };
    });

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, signup, logout, updateProfile, addOrder, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
}
