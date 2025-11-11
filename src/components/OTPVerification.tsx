import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { apiService } from "../services/api/apiservice";
import { getAuthData, clearAuthData } from "../utils/auth";

interface OTPVerificationProps {}

const OTPVerification: React.FC<OTPVerificationProps> = () => {
  const [otp, setOtp] = useState("");
  const [activeInput, setActiveInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otpMeta, setOtpMeta] = useState<{
    otp_id: number;
    authUserId: number;
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const BASE_API_PATH =
    import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
  const BASE_PORT = import.meta.env.VITE_BASE_IDAM_PORT || 8081;

  useEffect(() => {
    // Check if user came from login with OTP data
    const state = location.state as any;
    if (!state?.otpMeta || !state?.email) {
      // If no OTP data, redirect to login
      showToast({
        message: "Please login first to access OTP verification",
        type: "error",
      });
      navigate("/login", { replace: true });
      return;
    }

    setEmail(state.email);
    setOtpMeta(state.otpMeta);
  }, [location.state, navigate, showToast]);

  // Prevent back navigation by clearing auth data if user tries to go back
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Clear any partial auth data and redirect to login
      clearAuthData();
      navigate("/login", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpMeta) {
      setError("OTP session expired. Please login again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        otp_id: otpMeta.otp_id,
        otp_code: otp,
        auth_user_id: otpMeta.authUserId,
      };

      const response: any = await apiService.post(
        `${BASE_API_PATH}verify_login_otp`,
        payload,
        BASE_PORT
      );

      if (response?.data?.status === "success" && response?.isSuccess) {
        showToast({
          message: "OTP verified successfully!",
          type: "success",
        });

        // Navigate to dashboard after successful OTP verification
        navigate("/dashboard", { replace: true });
      } else {
        alert(response?.data?.message);
        setError(response?.data?.message || "Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error.message ||
          "OTP verification failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // You can implement resend OTP functionality here if needed
    showToast({
      message: "Resend OTP functionality will be implemented soon",
      type: "info",
    });
  };

  const handleBackToLogin = () => {
    // Clear auth data and go back to login
    clearAuthData();
    navigate("/login", { replace: true });
  };

  if (!email || !otpMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01443B]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#01443B] via-[#013531] to-[#09B591] flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-md mx-auto relative z-10"
      >
        <div className="space-y-3 text-center mb-6">
          <div className="flex justify-center">
            <div className="relative group">
              <img
                src="/src/assets/images/Frame 121.png"
                alt="Logo"
                className="h-[100px] w-[260px] object-contain drop-shadow-lg mx-auto"
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Enter OTP
          </h1>
          <p className="text-sm text-gray-600">
            We've sent a one-time password to{" "}
            <span className="font-semibold text-[#01443B]">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              OTP Code
            </label>
            <div className="relative flex justify-center">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError(""); // Clear error when user types
                }}
                onFocus={() => setActiveInput(true)}
                onBlur={() => setActiveInput(false)}
                className={`w-40 text-center tracking-widest px-4 py-3 bg-white/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 text-xl font-mono placeholder:text-gray-400 ${
                  error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#01443B]"
                } ${activeInput ? "scale-105" : ""}`}
                placeholder="123456"
                autoFocus
              />
            </div>
            {error && (
              <p className="pt-1 text-red-500 text-sm text-center">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full flex justify-center items-center px-4 py-3 bg-gradient-to-r from-[#01443B] to-[#09B591] text-white font-semibold rounded-xl hover:from-[#013531] hover:to-[#01443B] focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-sm text-[#01443B] hover:text-[#013531] font-medium transition-colors"
            >
              Didn't receive the code? Resend OTP
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>

        <p className="w-full text-center mt-4 text-sm text-gray-400">V.1.1</p>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
