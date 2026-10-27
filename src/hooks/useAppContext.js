import { useContext } from "react";
import { AuthContext, CartContext, RescueContext, RoleContext, ToastContext } from "../context/contexts";

export const useAuth = () => useContext(AuthContext);
export const useCart = () => useContext(CartContext);
export const useToast = () => useContext(ToastContext);
export const useRole = () => useContext(RoleContext);
export const useRescue = () => useContext(RescueContext);
