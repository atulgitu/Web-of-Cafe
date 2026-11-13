import { createContext } from "react";

// Context objects live here (not in the provider files) so each provider file
// only exports a component, which keeps React Fast Refresh happy.
export const AuthContext = createContext(null);
export const CartContext = createContext(null);
export const ToastContext = createContext(null);
