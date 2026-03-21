import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Restore session from localStorage
  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem("plm_auth");
      if (saved) {
        setUser(JSON.parse(saved));
        try {
          const dbUsers = await api.auth.users();
          setUsers(dbUsers);
        } catch {
          setUsers([]);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await api.auth.login(email, password);
      const userData = {
        id: result.userId,
        email: result.email || email,
        role: result.role?.toUpperCase(),
        name: result.name || (result.email || email).split("@")[0],
        loginId: result.name || (result.email || email).split("@")[0],
      };
      setUser(userData);
      localStorage.setItem("plm_auth", JSON.stringify(userData));
      localStorage.setItem("role", result.role?.toLowerCase());
      localStorage.setItem("plm_token", result.token);
      const dbUsers = await api.auth.users();
      setUsers(dbUsers);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Invalid email or password" };
    }
  };

  const signup = async (loginId, email, password, role) => {
    try {
      await api.auth.register({
        name: loginId,
        email,
        password,
        role: role?.toUpperCase(),
      });
      const dbUsers = await api.auth.users();
      setUsers(dbUsers);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Unable to create account" };
    }
  };

  const logout = () => {
    setUser(null);
    setUsers([]);
    localStorage.removeItem("plm_auth");
    localStorage.removeItem("role");
    localStorage.removeItem("plm_token");
  };

  const role = user?.role?.toUpperCase();
  const canCreate = role === "ENGINEER" || role === "ADMIN";
  const canApprove = role === "APPROVER" || role === "ADMIN";
  const canStart = !!role;
  const isAdmin = role === "ADMIN";
  const canViewStagesSettings = role === "ADMIN" || role === "APPROVER";
  const canViewApprovalsSettings = role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, users, login, signup, logout, canCreate, canApprove, canStart, isAdmin, canViewStagesSettings, canViewApprovalsSettings, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
