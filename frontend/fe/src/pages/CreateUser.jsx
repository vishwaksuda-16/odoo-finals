import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const COMPANY_DOMAIN = "@company.com";

export default function CreateUser() {
  const { signup, isAdmin, users } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    loginId: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "engineer",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <Layout title="Access Denied">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-xl font-bold text-surface-800 mb-2">Admin Access Required</h2>
          <p className="text-surface-500 mb-6">Only administrators can create new user accounts.</p>
          <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSuccess("");
  };

  const validate = () => {
    const errs = {};

    // Login ID: 6–12 chars, unique
    if (!form.loginId.trim()) {
      errs.loginId = "Login ID is required";
    } else if (form.loginId.length < 6 || form.loginId.length > 12) {
      errs.loginId = "Login ID must be 6–12 characters";
    }

    // Email: must be company domain
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    } else if (!form.email.toLowerCase().endsWith(COMPANY_DOMAIN)) {
      errs.email = `Email must end with ${COMPANY_DOMAIN}`;
    }

    // Password: 8+ chars, lowercase, uppercase, special char
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 8) {
      errs.password = "Minimum 8 characters";
    } else if (!/[a-z]/.test(form.password)) {
      errs.password = "Must include a lowercase letter";
    } else if (!/[A-Z]/.test(form.password)) {
      errs.password = "Must include an uppercase letter";
    } else if (!/[^a-zA-Z0-9]/.test(form.password)) {
      errs.password = "Must include a special character";
    }

    // Confirm password
    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm password";
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    // Role
    if (!["engineer", "approver"].includes(form.role)) {
      errs.role = "Select a valid role";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await signup(form.loginId.trim(), form.email.trim().toLowerCase(), form.password, form.role);
    if (result.success) {
      setSuccess(`User "${form.loginId}" created successfully as ${form.role.toUpperCase()}`);
      setForm({ loginId: "", email: "", password: "", confirmPassword: "", role: "engineer" });
    } else {
      setErrors({ loginId: result.error });
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-danger-500 focus:ring-danger-500/30 bg-danger-500/5"
        : "border-surface-200 focus:ring-primary-500/30 focus:border-primary-400"
    }`;

  const roleOptions = [
    { value: "engineer", label: "Engineer", icon: null, desc: "Create & edit ECOs, start workflows" },
    { value: "approver", label: "Approver", icon: null, desc: "Review & approve ECOs" },
  ];

  return (
    <Layout title="Create User">
      <div className="max-w-2xl mx-auto">
        {/* Admin notice */}
        <div className="mb-4 bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <p className="text-sm font-semibold text-primary-800">Admin Function</p>
            <p className="text-xs text-primary-600">Create new user accounts with company email validation. Only {COMPANY_DOMAIN} emails are accepted.</p>
          </div>
        </div>

        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <p className="text-sm font-semibold text-emerald-700">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-surface-200 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">New User Account</h2>
            <p className="text-sm text-surface-500 mt-1">All fields are required</p>
          </div>

          <form onSubmit={handleCreate} className="p-6 space-y-5">
            {/* Login ID */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Login ID *</label>
              <input
                id="create-user-login-id"
                type="text"
                value={form.loginId}
                onChange={(e) => update("loginId", e.target.value)}
                placeholder="6–12 characters, must be unique"
                maxLength={12}
                className={inputClass("loginId")}
              />
              {errors.loginId && <p className="mt-1.5 text-xs text-danger-500">{errors.loginId}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Company Email *
                <span className="ml-2 text-xs font-normal text-surface-400">({COMPANY_DOMAIN})</span>
              </label>
              <input
                id="create-user-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder={`user${COMPANY_DOMAIN}`}
                className={inputClass("email")}
              />
              {errors.email && <p className="mt-1.5 text-xs text-danger-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Password *</label>
                <input
                  id="create-user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Min 8 chars, A-z, special"
                  className={inputClass("password")}
                />
                {errors.password && <p className="mt-1.5 text-xs text-danger-500">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Confirm Password *</label>
                <input
                  id="create-user-confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="Re-enter password"
                  className={inputClass("confirmPassword")}
                />
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-danger-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-3">Role *</label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("role", opt.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      form.role === opt.value
                        ? "border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10"
                        : "border-surface-200 bg-white hover:border-surface-300 hover:bg-surface-50"
                    }`}
                    id={`create-role-${opt.value}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold ${form.role === opt.value ? "text-primary-700" : "text-surface-700"}`}>
                        {opt.label}
                      </span>
                    </div>
                    <p className={`text-xs ${form.role === opt.value ? "text-primary-600" : "text-surface-500"}`}>
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
              {errors.role && <p className="mt-1.5 text-xs text-danger-500">{errors.role}</p>}
            </div>

            {/* Password Requirements */}
            <div className="bg-surface-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-surface-600 mb-2">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-surface-500">
                <span className={form.password.length >= 8 ? "text-emerald-600 font-medium" : ""}>
                  {form.password.length >= 8 ? "[OK]" : "[ ]"} Minimum 8 characters
                </span>
                <span className={/[A-Z]/.test(form.password) ? "text-emerald-600 font-medium" : ""}>
                  {/[A-Z]/.test(form.password) ? "[OK]" : "[ ]"} Uppercase letter
                </span>
                <span className={/[a-z]/.test(form.password) ? "text-emerald-600 font-medium" : ""}>
                  {/[a-z]/.test(form.password) ? "[OK]" : "[ ]"} Lowercase letter
                </span>
                <span className={/[^a-zA-Z0-9]/.test(form.password) ? "text-emerald-600 font-medium" : ""}>
                  {/[^a-zA-Z0-9]/.test(form.password) ? "[OK]" : "[ ]"} Special character
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate("/settings/users")}
                className="px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-800 hover:bg-surface-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="create-user-button"
                className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl shadow-md shadow-primary-600/20 hover:shadow-lg transition-all"
              >
                Create User
              </button>
            </div>
          </form>
        </div>

        {/* Existing Users */}
        <div className="mt-6 bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50/50">
            <h3 className="font-bold text-surface-900">Existing Users ({users.length})</h3>
          </div>
          <div className="divide-y divide-surface-100">
            {users.map((u) => (
              <div key={u.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                    {u.loginId?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-800">{u.loginId}</p>
                    <p className="text-xs text-surface-500">{u.email}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  u.role === "admin" ? "bg-primary-100 text-primary-700" :
                  u.role === "approver" ? "bg-emerald-100 text-emerald-700" :
                  "bg-blue-100 text-blue-700"
                }`}>{u.role?.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
