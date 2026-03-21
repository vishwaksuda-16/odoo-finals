import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

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

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevOtp("");
    if (!email.trim()) {
      setError("Enter your email");
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.forgotPassword(email.trim().toLowerCase());
      setMessage(data.message || "Check your email for the code.");
      if (data.devOtp) setDevOtp(String(data.devOtp));
      setStep(2);
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const resetWithOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await api.auth.resetPasswordWithOtp(email.trim().toLowerCase(), otp.trim(), newPassword);
      setMessage(data.message || "Password updated.");
      setStep(3);
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-950 to-primary-950 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Forgot password</h1>
          <p className="text-surface-400 text-sm mt-2">We email a one-time code (OTP). Enter it below with your new password.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          {error && (
            <div className="mb-4 bg-danger-500/15 border border-danger-500/30 text-danger-500 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}
          {message && step !== 3 && (
            <div className="mb-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-xl text-sm">{message}</div>
          )}
          {devOtp && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-100 px-4 py-3 rounded-xl text-sm">
              <span className="font-semibold">Dev OTP: </span>
              <code className="text-lg tracking-widest">{devOtp}</code>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@gmail.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send OTP to email"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetWithOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">6-digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-xl tracking-[0.4em] placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">New password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    aria-label={showNew ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white p-1"
                    onClick={() => setShowNew((s) => !s)}
                  >
                    <EyeIcon open={showNew} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white p-1"
                    onClick={() => setShowConfirm((s) => !s)}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl disabled:opacity-60"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setNewPassword("");
                  setConfirm("");
                  setError("");
                  setMessage("");
                  setDevOtp("");
                }}
                className="w-full text-sm text-surface-400 hover:text-primary-400"
              >
                Use a different email
              </button>
            </form>
          )}

          {step === 3 && (
            <p className="text-emerald-200 text-center text-sm">{message || "Password updated."}</p>
          )}

          <p className="mt-6 text-center text-sm text-surface-400">
            <Link to="/login" className="text-primary-400 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
