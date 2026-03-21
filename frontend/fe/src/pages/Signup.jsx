import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Public signup is disabled. User creation is admin-only via /settings/users
export default function Signup() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <Navigate to="/login" replace />;
}