// ForgotPasswordPage.tsx  (full working version)
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { apiService } from "../services/api/apiservice";
import { useNavigate } from "react-router-dom";

const BASE_API_PATH = import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
const BASE_PORT = import.meta.env.VITE_BASE_IDAM_PORT || 8081;

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const resp: any = await apiService.post(
        `${BASE_API_PATH}forget_password`, // keep your actual backend path
        { email },
        BASE_PORT
      );

      const ok =
        resp?.data?.status === "success" ||
        resp?.isSuccess === true ||
        resp?.data?.isSuccess === true;

      if (!ok) {
        showToast({
          message: resp?.data?.message || "Failed to send OTP",
          type: "error",
        });
        setLoading(false);
        return;
      }

      // pull from data.otpMeta and normalize key names
      const meta = resp?.data?.otpMeta || resp?.data?.data?.otpMeta || {};
      const otp_id = Number(meta?.otp_id);
      const auth_user_id = Number(
        meta?.auth_userId ?? meta?.authUserId ?? meta?.auth_user_id
      );

      if (!otp_id || !auth_user_id) {
        showToast({
          message: "Server did not return OTP meta. Please try again.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "fpOtpMeta",
        JSON.stringify({ otp_id, auth_user_id, email })
      );

      showToast({ message: "OTP sent to your email", type: "success" });
      navigate("/forgot-password/otp", { state: { email } });
    } catch (err: any) {
      showToast({
        message:
          err?.response?.data?.message || err?.message || "Error sending OTP",
        type: "error",
      });
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
        <h1 className="text-3xl font-bold text-center mb-6">Forgot Password</h1>
        <p className="text-sm text-gray-600 text-center mb-4">
          Enter your registered email to receive an OTP
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="you@example.com"
            className={`w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#01443B]"
            }`}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 bg-gradient-to-r from-[#01443B] to-[#09B591] text-white font-semibold rounded-xl hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 w-full text-sm text-[#01443B] hover:text-[#09B591]"
        >
          Back to Login
        </button>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
