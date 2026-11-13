import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAppContext";
import { Spinner } from "./ui";

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) {
    return (
      <div className="py-24 flex justify-center text-charcoal-soft" aria-label="Loading">
        <Spinner />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
