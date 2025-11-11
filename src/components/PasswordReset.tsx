import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { apiService } from "../services/api/apiservice";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/form/Input";

const PasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const BASE_API_PATH =
    import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
  const BASE_PORT = import.meta.env.VITE_BASE_IDAM_PORT || 8081;

  // Accept authUserId via state or query param for resilience
  const stateAuthUserId = (location.state as any)?.authUserId as
    | number
    | undefined;
  const emailFromState = (location.state as any)?.email as string | undefined;

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const qpAuthUserId = queryParams.get("authUserId")
    ? Number(queryParams.get("authUserId"))
    : undefined;

  const authUserId = stateAuthUserId || qpAuthUserId;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [error, setError] = useState("");

  // Derived validation flags for enabling submit button
  const meetsPasswordPolicy = useMemo(() => {
    return (
      password.length >= 10 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\\/]/.test(password)
    );
  }, [password]);

  const canSubmit = !isLoading && meetsPasswordPolicy && password === confirm && !!password && !!confirm;

  // Live checklist for password policy
  const passwordChecks = useMemo(
    () => [
      { label: "Minimum 10 characters", met: password.length >= 10 },
      { label: "At least one uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
      { label: "At least one lowercase letter (a-z)", met: /[a-z]/.test(password) },
      { label: "At least one number (0-9)", met: /[0-9]/.test(password) },
      { label: "At least one special character", met: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\\/]/.test(password) },
    ],
    [password]
  );

  const confirmMatches = useMemo(
    () => confirm.length > 0 && password === confirm,
    [password, confirm]
  );

  useEffect(() => {
    if (!authUserId) {
      showToast({
        message: "Missing user context. Please login again.",
        type: "error",
      });
      navigate("/login", { replace: true });
    }
  }, [authUserId, navigate, showToast]);

  const validate = (): string | null => {
    if (!password || !confirm)
      return "Please enter and confirm your new password.";
    if (password !== confirm) return "Passwords do not match.";
    if (password.length < 10) return "Password must be at least 10 characters.";
    if (!/[A-Z]/.test(password))
      return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (
      !/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\\/]/.test(password)
    )
      return "Password must contain at least one special character.";
    return null;
  };

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // simple caps detection hint
    const isShift = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLockOn(!!isShift);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUserId) return;

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    console.log(msg)
    setIsLoading(true);
    setError("");

    try {
      // Per your note: store the password as-is (no hashing on frontend)
      // Backend function you mentioned: tyme_iam.reset_firsttime_password
      const payload = {
        auth_user_id: authUserId,
        passCode: password,
        isFirst: true,
      };

      const resp: any = await apiService.post(
        `${BASE_API_PATH}reset_firsttime_password`,
        payload,
        BASE_PORT
      );

      if (resp?.data?.status === "success" && resp?.isSuccess !== false) {
        showToast({
          message: "Password has been reset. Please sign in.",
          type: "success",
        });
        navigate("/login", { replace: true, state: { email: emailFromState } });
      } else {
        setError(
          resp?.data?.message || "Failed to reset password. Please try again."
        );
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Password reset failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#01443B] via-[#013531] to-[#09B591] flex items-center justify-center p-4">
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
                src="/images/updatedImage.png"
                alt="Logo"
                className="h-[100px] w-[260px] object-contain drop-shadow-lg mx-auto"
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Reset Your Password
          </h1>
          <p className="text-sm text-gray-600">
            {emailFromState ? (
              <>
                Setting a new password for{" "}
                <span className="font-semibold text-[#01443B]">
                  {emailFromState}
                </span>
              </>
            ) : (
              "Please set a new password to continue"
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyUp={handleKeyEvent}
                error={error}
                trailing={
                  <button
                    type="button"
                    className="flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                InputclassName="w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900"
                placeholder="Enter new password"
                autoFocus
              />
            </div>
            {capsLockOn && (
              <p className="text-xs text-amber-600">Caps Lock is ON</p>
            )}
          </div>

          {/* Password policy live feedback */}
          <div className="mt-1 space-y-1">
            {passwordChecks.map((c) => (
              <p key={c.label} className={`text-xs ${c.met ? "text-green-600" : "text-red-500"}`}>
                {c.met ? "✓" : "•"} {c.label}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirm(e.target.value);
                  setError("");
                }}
                onKeyUp={handleKeyEvent}
                error={error}
                trailing={
                  <button
                    type="button"
                    className="flex items-center text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirm(!showConfirm)}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                InputclassName="w-full px-4 py-3 bg-white/50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900"
                placeholder="Re-enter new password"
              />
            </div>
            {confirm.length > 0 && (
              <p className={`text-xs ${confirmMatches ? "text-green-600" : "text-red-500"}`}>
                {confirmMatches ? "✓ Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>

          {error && (
            <p className="pt-1 text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full flex justify-center items-center px-4 py-3 bg-gradient-to-r from-[#01443B] to-[#09B591] text-white font-semibold rounded-xl hover:from-[#013531] hover:to-[#01443B] focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              "Set New Password"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Back to Login
          </button>
        </form>

        <p className="w-full text-center mt-4 text-sm text-gray-400">V.1.0</p>
      </motion.div>
    </div>
  );
};

export default PasswordReset;
