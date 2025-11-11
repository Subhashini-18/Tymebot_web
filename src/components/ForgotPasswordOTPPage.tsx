// ForgotPasswordOTPPage.tsx
import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { apiService } from "../services/api/apiservice";

const BASE_API_PATH = import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
const BASE_PORT = import.meta.env.VITE_BASE_IDAM_PORT || 8081;

// Keep spelling consistent with your backend
const OTP_VERIFY_ENDPOINT = `${BASE_API_PATH}verify_forget_password_otp`;

const ForgotPasswordOTPPage: React.FC = () => {
  const { state } = useLocation() as { state?: { email?: string } };
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [otp, setOtp] = React.useState("");
  const [email, setEmail] = React.useState(state?.email || "");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!email) {
      try {
        const meta = JSON.parse(localStorage.getItem("fpOtpMeta") || "{}");
        if (meta?.email) setEmail(meta.email);
      } catch {}
    }
  }, [email]);

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("fpOtpMeta") || "{}");
    const otp_id = Number(saved?.otp_id);
    const auth_user_id = Number(
      saved?.auth_user_id ?? saved?.authUserId ?? saved?.auth_userId
    );

    if (!otp_id || !auth_user_id) {
      setError("OTP session expired. Please request a new OTP.");
      return;
    }

    try {
      setLoading(true);

      const payload = { otp_id, otp_code: otp, auth_user_id };

      const resp: any = await apiService.post(
        OTP_VERIFY_ENDPOINT,
        payload,
        BASE_PORT
      );

      const ok =
        resp?.data?.status === "success" ||
        resp?.isSuccess === true ||
        resp?.data?.isSuccess === true ||
        resp?.isSuccess === true;

      // alert(ok);
      if (!ok) {
        const msg =
          resp?.data?.message ||
          resp?.data?.msg ||
          resp?.message ||
          "Invalid OTP. Please try again.";
        setError(msg);
        setLoading(false);
        return;
      }

      // ✅ Keep the meta for the reset step
      localStorage.setItem(
        "fpResetMeta",
        JSON.stringify({ otp_id, auth_user_id, email })
      );
      // (optional) clear the original storage key
      localStorage.removeItem("fpOtpMeta");

      showToast({
        message: "OTP verified. Please set your new password.",
        type: "success",
      });

      // ✅ Navigate to the reset page (make sure this route exists)
      navigate("/forgot-password/new-password", { state: { email } });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#01443B] via-[#013531] to-[#09B591] flex overflow-hidden">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          <div className="space-y-3 text-center mb-6">
            <img
              src="/images/updatedImage.png"
              alt=""
              className="h-[110px] w-[300px] object-contain drop-shadow-lg mx-auto"
            />
            <h1 className="text-2xl font-bold text-gray-900">Enter OTP</h1>
            <p className="text-sm text-gray-600">
              We’ve sent a one-time password to{" "}
              <span className="font-semibold text-[#01443B]">
                {email || "your email"}
              </span>
            </p>
          </div>

          <form onSubmit={onVerify} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(v);
                  setError("");
                }}
                className={`w-full text-center tracking-[0.5em] px-4 py-3 border rounded-xl text-xl font-mono ${
                  error
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#01443B]"
                }`}
                placeholder="123456"
                autoFocus
              />
              {error && (
                <p className="pt-1 text-red-500 text-sm text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex justify-center items-center px-4 py-3 bg-gradient-to-r from-[#01443B] to-[#09B591] text-white font-semibold rounded-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Verifying...
                </>
              ) : (
                <>Verify OTP</>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-[#01443B] hover:text-[#09B591]"
              >
                Change email
              </button>
            </div>
          </form>

          <p className="w-full text-center mt-4 text-sm text-gray-400">V.1.1</p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordOTPPage;
