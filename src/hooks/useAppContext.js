import { useContext } from "react";
import { AuthContext, CartContext, ToastContext } from "../context/contexts";

export const useAuth = () => useContext(AuthContext);
export const useCart = () => useContext(CartContext);
export const useToast = () => useContext(ToastContext);
