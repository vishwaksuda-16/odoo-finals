import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const DEMO_USERS = [
  { id: "u1", loginId: "admin1", email: "admin@company.com", password: "Admin@123", role: "admin" },
  { id: "u2", loginId: "engineer1", email: "engineer@company.com", password: "Eng@1234", role: "engineer" },
  { id: "u3", loginId: "approver1", email: "approver@company.com", password: "Appr@123", role: "approver" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("plm_users");
    return saved ? JSON.parse(saved) : DEMO_USERS;
  });

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem("plm_users", JSON.stringify(users));
  }, [users]);

  // Restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("plm_auth");
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 400));
    
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (found) {
      const userData = { 
        email: found.email, 
        role: found.role.toUpperCase(), 
        name: found.loginId, 
        loginId: found.loginId 
      };
      setUser(userData);
      localStorage.setItem("plm_auth", JSON.stringify(userData));
      localStorage.setItem("role", found.role.toLowerCase());
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const signup = async (loginId, email, password, role) => {
    await new Promise(r => setTimeout(r, 400));

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Email already exists" };
    }

    const newUser = {
      id: "u" + Date.now(),
      loginId,
      email: email.toLowerCase(),
      password,
      role: role.toLowerCase()
    };

    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("plm_auth");
    localStorage.removeItem("role");
  };

  const role = user?.role?.toUpperCase();
  const canCreate = role === "ENGINEER" || role === "ADMIN";
  const canApprove = role === "APPROVER" || role === "ADMIN";
  const canStart = role === "ENGINEER" || role === "ADMIN";
  const isAdmin = role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, users, login, signup, logout, canCreate, canApprove, canStart, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
