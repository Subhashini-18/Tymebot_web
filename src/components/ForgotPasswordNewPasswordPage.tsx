// ForgotPasswordNewPasswordPage.tsx
import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { apiService } from "../services/api/apiservice";

const BASE_API_PATH = import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
const BASE_PORT = import.meta.env.VITE_BASE_IDAM_PORT || 8081;

// Adjust to your backend final reset endpoint
const RESET_PASSWORD_ENDPOINT = `${BASE_API_PATH}reset_firsttime_password`;

const ForgotPasswordNewPasswordPage: React.FC = () => {
  const { state } = useLocation() as { state?: { email?: string } };
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email] = React.useState(state?.email || "");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const validate = () => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Include at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Include at least one digit";
    if (!/[!@#$%^&*]/.test(password))
      return "Include at least one special character (!@#$%^&*)";
    if (password !== confirm) return "Passwords do not match";
    return "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const meta = JSON.parse(localStorage.getItem("fpResetMeta") || "{}");
    const otp_id = Number(meta?.otp_id);
    const auth_user_id = Number(meta?.auth_user_id);

    if (!otp_id || !auth_user_id) {
      setError("Your reset session expired. Please restart the process.");
      return;
    }

    try {
      setLoading(true);

      // If your backend expects camelCase, map here.
      const payload = {
        otp_id,
        auth_user_id,
        passCode: password,
        email, // optional if backend uses it
      };

      const resp: any = await apiService.post(
        RESET_PASSWORD_ENDPOINT,
        payload,
        BASE_PORT
      );

      const ok =
        resp?.data?.status === "success" ||
        resp?.isSuccess === true ||
        resp?.data?.isSuccess === true;

      if (!ok) {
        const msg =
          resp?.data?.message ||
          resp?.data?.msg ||
          resp?.message ||
          "Password reset failed.";
        setError(msg);
        setLoading(false);
        return;
      }

      // Cleanup
      localStorage.removeItem("fpResetMeta");

      showToast({
        message: "Password updated. Please login.",
        type: "success",
      });
      navigate("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#01443B] via-[#013531] to-[#09B591] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
      >
        <h1 className="text-2xl font-bold text-center mb-2">
          Set New Password
        </h1>
        {email && (
          <p className="text-center text-sm text-gray-500 mb-4">
            for <span className="font-medium">{email}</span>
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#01443B]"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#01443B]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 bg-gradient-to-r from-[#01443B] to-[#09B591] text-white font-semibold rounded-xl hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-sm text-[#01443B] hover:text-[#09B591] mt-2"
          >
            Back to Login
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordNewPasswordPage;
