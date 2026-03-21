import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both Email and Password");
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-950 to-primary-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-600/30 mb-4">
            <span className="text-white font-bold text-2xl">PS</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">PLM Sentry</h1>
          <p className="text-surface-400 mt-2 text-sm">Product Lifecycle Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-danger-500/15 border border-danger-500/30 text-danger-500 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your company email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              id="sign-in-button"
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 hover:from-primary-500 hover:to-primary-400 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10">
            <button className="text-sm text-surface-400 hover:text-primary-400 transition-colors">
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4">
          <p className="text-xs text-surface-400 font-medium mb-2">Demo Credentials:</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-surface-400">
              <span><span className="text-surface-500 font-semibold mr-1">Admin:</span> admin@company.com</span>
              <span className="text-surface-500">Admin@123</span>
            </div>
            <div className="flex items-center justify-between text-surface-400">
              <span><span className="text-surface-500 font-semibold mr-1">Engineer:</span> engineer@company.com</span>
              <span className="text-surface-500">Eng@1234</span>
            </div>
            <div className="flex items-center justify-between text-surface-400">
              <span><span className="text-surface-500 font-semibold mr-1">Approver:</span> approver@company.com</span>
              <span className="text-surface-500">Appr@123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}