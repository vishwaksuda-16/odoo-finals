import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ECOCreate from "./pages/ECOCreate";
import ECOEdit from "./pages/ECOEdit";
import ECODetail from "./pages/ECODetail";
import ECOList from "./pages/ECOList";
import ChangeView from "./pages/ChangeView";
import Products from "./pages/Products";
import ProductCreate from "./pages/ProductCreate";
import ProductDetail from "./pages/ProductDetail";
import BOM from "./pages/BOM";
import BOMCreate from "./pages/BOMCreate";
import BOMDetail from "./pages/BOMDetail";
import Reporting from "./pages/Reporting";
import Settings from "./pages/Settings";
import ECOStages from "./pages/ECOStages";
import Approvals from "./pages/Approvals";
import CreateUser from "./pages/CreateUser";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function RoleRoute({ children, allow }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role?.toUpperCase())) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Wait for session restoration
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/ecos" element={<ProtectedRoute><ECOList /></ProtectedRoute>} />
      <Route path="/ecos/create" element={<RoleRoute allow={["ADMIN", "ENGINEER"]}><ECOCreate /></RoleRoute>} />
      <Route path="/ecos/:id/edit" element={<RoleRoute allow={["ADMIN", "ENGINEER"]}><ECOEdit /></RoleRoute>} />
      <Route path="/ecos/:id" element={<ProtectedRoute><ECODetail /></ProtectedRoute>} />
      <Route path="/changes/:id" element={<ProtectedRoute><ChangeView /></ProtectedRoute>} />

      <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      <Route path="/products/create" element={<RoleRoute allow={["ADMIN", "ENGINEER"]}><ProductCreate /></RoleRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />

      <Route path="/bom" element={<ProtectedRoute><BOM /></ProtectedRoute>} />
      <Route path="/bom/create" element={<RoleRoute allow={["ADMIN", "ENGINEER"]}><BOMCreate /></RoleRoute>} />
      <Route path="/bom/:id" element={<ProtectedRoute><BOMDetail /></ProtectedRoute>} />

      <Route path="/reporting" element={<RoleRoute allow={["ADMIN", "APPROVER"]}><Reporting /></RoleRoute>} />

      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/settings/stages" element={<RoleRoute allow={["ADMIN"]}><ECOStages /></RoleRoute>} />
      <Route path="/settings/approvals" element={<RoleRoute allow={["ADMIN"]}><Approvals /></RoleRoute>} />

      {/* Admin-Only Routes */}
      <Route path="/settings/users" element={<AdminRoute><CreateUser /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;