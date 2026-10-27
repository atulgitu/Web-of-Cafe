import usePersistentState from "../hooks/usePersistentState";
import { RoleContext } from "./contexts";

// Demo-only role switch. A real deployment would derive the role from the
// signed-in account; here it lets one person walk through all three views.
export function RoleProvider({ children }) {
  const [role, setRole] = usePersistentState("brewcare_role", "customer");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}
