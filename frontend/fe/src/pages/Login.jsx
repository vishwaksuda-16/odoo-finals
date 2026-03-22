import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Brand panel — solid, no gradient */}
      <aside className="lg:w-[42%] xl:w-[40%] bg-slate-900 text-white flex flex-col justify-between px-8 py-10 lg:px-12 lg:py-14 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center">
              <span className="text-slate-900 font-bold text-lg tracking-tight">PS</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight leading-tight">PLM Sentry</h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Product lifecycle</p>
            </div>
          </div>
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-white leading-snug max-w-md">
            Engineering change management, approvals, and traceability in one place.
          </h2>
          <ul className="mt-8 space-y-3 text-slate-300 text-sm max-w-sm">
            <li className="flex gap-2">
              <span className="text-slate-500 select-none">—</span>
              Structured ECO workflow with role-based access
            </li>
            <li className="flex gap-2">
              <span className="text-slate-500 select-none">—</span>
              Product versioning and audit-ready records
            </li>
            <li className="flex gap-2">
              <span className="text-slate-500 select-none">—</span>
              Built for teams that need clarity and compliance
            </li>
          </ul>
        </div>
        <p className="text-slate-500 text-xs mt-10 lg:mt-0">© {new Date().getFullYear()} PLM Sentry. Internal use.</p>
      </aside>

      {/* Form area */}
      <main className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-slate-50">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Sign in</h2>
            <p className="text-slate-500 text-sm mt-1">Use your work Gmail account and password.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 text-slate-900 text-sm border border-slate-300 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 pr-11 text-slate-900 text-sm border border-slate-300 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-800 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="sign-in-button"
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 border border-slate-900 rounded-lg hover:bg-slate-800 hover:border-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <Link to="/forgot-password" className="text-sm font-medium text-slate-700 hover:text-slate-900 underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="mt-6 border border-slate-200 rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Demo accounts</p>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-4">
                <span className="text-slate-500">
                  <span className="font-medium text-slate-700">Admin</span> — vishwaksuda@gmail.com
                </span>
                <code className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded">Admin@123</code>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-4">
                <span className="text-slate-500">
                  <span className="font-medium text-slate-700">Engineer</span> — nowshathyasir61@gmail.com
                </span>
                <code className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded">Yasir@29</code>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-4">
                <span className="text-slate-500">
                  <span className="font-medium text-slate-700">Approver</span> — sudharshankrishnaalk@gmail.com
                </span>
                <code className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded">Sudha@123</code>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
