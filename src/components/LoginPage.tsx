import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Shield,
  Moon,
  Sun,
  ChevronRight,
  Lock,
  Globe,
  Zap,
  Server,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../context/ToastContext";
import { apiService } from "../services/api/apiservice";
import { setAuthData, getAuthData, clearAuthData } from "../utils/auth";
// import { registerTokenWithBackend } from "@/firebase/notificationService";
import { setAuthToken } from "../services/api/apiservice";
import { set } from "zod";
import { registerTokenWithBackend } from "../firebase/notificationService";

// Add this to your globals.css or create a new style module
const style = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(147, 51, 234, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
}
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }
.animate-pulse-custom { animation: pulse 2s infinite; }
`;

// Elegant OTP Screen Component
const OTPScreen: React.FC<{
  email: string;
  onVerify: (otp: string) => void;
  isLoading: boolean;
  error: string;
  onBackToLogin?: () => void;
}> = ({ email, onVerify, isLoading, error, onBackToLogin }) => {
  const [otp, setOtp] = useState("");
  const [activeInput, setActiveInput] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-md mx-auto"
    >
      <div className="space-y-3 text-center mb-4">
        <div className="flex justify-center">
          <div className="relative group">
            <img
              src="/src/assets/images/Frame 121.png"
              alt=""
              className="h-[100px] w-[260px] object-contain drop-shadow-lg mx-auto"
            />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse-custom" />
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onVerify(otp);
        }}
        className="space-y-6"
      >
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
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
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
            <>Verify OTP</>
          )}
        </button>
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full mt-3 flex justify-center items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
          >
            Back to Login
          </button>
        )}
      </form>
      <p className="w-full text-center mt-4 text-sm text-gray-400">V.1.1</p>
    </motion.div>
  );
};

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeInput, setActiveInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [isTempPassword, setIsTempPassword] = useState(false);
  const [otpMeta, setOtpMeta] = useState<{
    otp_id: number;
    authUserId: number;
  } | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const authData = getAuthData();
  const selfOnboarded = authData?.clientStatus;

  React.useEffect(() => {
    if (authData?.isAuthenticated && !authData?.isOtpVerified) {
      setLoginEmail(authData.email);
      setShowOtpScreen(true);
      const storedOtpMeta = localStorage.getItem("otpMeta");
      if (storedOtpMeta) {
        try {
          setOtpMeta(JSON.parse(storedOtpMeta));
        } catch {
          localStorage.removeItem("otpMeta");
        }
      }
    }
  }, []);

  const BASE_API_PATH =
    import.meta.env.VITE_IAM_API_PATH || "/api/tyme/idam/v1/";
  const BASE_PORT = import.meta.env.VITE_BASE_IDAM_PORT || 8081;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const validationRules = {
    email: { required: true, displayName: "Email" },
    password: { required: true, displayName: "Password" },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: string) => {
    const rule = validationRules[name as keyof typeof validationRules];
    if (rule?.required && !value.trim())
      return `${rule.displayName} is required`;
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Please enter a valid email address";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors: any = {};
    Object.keys(validationRules).forEach((field) => {
      const error = validateField(
        field,
        formData[field as keyof typeof formData] as string
      );
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const loginParams = {
        authUserName: formData.email,
        password: formData.password,
        isTempPassword: false,
        deviceId: "12345",
      };

      const response: any = await apiService.post(
        `${BASE_API_PATH}login`,
        loginParams,
        BASE_PORT
      );

      if (!response?.data?.isLoginSuccess) {
        showToast({
          message: response?.data?.msg || response?.msg || "Login failed",
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      const responseData = response.data;
      const roleName = responseData.roleName;
      setIsTempPassword(responseData.isTemp);

      // Determine userType based on client/vendor presence
      let userType = "Client User";
      if (
        responseData.clientName == null &&
        responseData.clientId == null &&
        responseData.vendorName == null &&
        responseData.vendorId == null
      ) {
        userType = "Platform User";
      } else if (
        responseData.vendorName != null ||
        responseData.vendorId != null
      ) {
        userType = "Vendor User";
      } else if (
        responseData.vendorName == null &&
        responseData.vendorId == null &&
        (responseData.clientName != null || responseData.clientId != null)
      ) {
        userType = "Client User";
      }

      let userRole: "platform" | "client" | "vendor";
      if (userType === "Platform User") userRole = "platform";
      else if (userType === "Vendor User") userRole = "vendor";
      else userRole = "client";

      let moduleId: number;
      switch (userRole) {
        case "platform":
          moduleId = 8;
          break;
        case "client":
          moduleId = 9;
          break;
        case "vendor":
          moduleId = 10;
          break;
        default:
          moduleId = 0; // fallback
      }
      const authDataObj: any = {
        email: formData.email,
        isAuthenticated: true,
        isOtpVerified: false,
        loginTime: new Date().toISOString(),
        role: userRole,
        roleName: roleName,
        tenantName: responseData.tenantName,
        authUserId: responseData.authUserId,
        clientName: responseData.clientName,
        name: responseData.authUserName || "User",
        clientId: responseData.clientId,
        tenantId: responseData.tenantId,
        permissions: [],
        vendorId: responseData.vendorId,
        clientLogoUrl: responseData.clientLogoUrl,
        clientStatus: responseData.clientStatus,
        moduleId: moduleId,
      };

      setAuthData(authDataObj);

      const otpMetaData = {
        otp_id: responseData.otpInfo?.otp_id,
        authUserId: responseData.authUserId,
      };
      setOtpMeta(otpMetaData);
      localStorage.setItem("otpMeta", JSON.stringify(otpMetaData));

      setLoginEmail(formData.email);
      setShowOtpScreen(true);
      setIsLoading(false);
    } catch (error: any) {
      showToast({
        message: error.message || "An error occurred during login",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  // OTP verification handler — now also persists JWT + claims
  const handleOtpVerify = async (otp: string) => {
    setOtpLoading(true);
    setOtpError("");

    if (!otpMeta) {
      setOtpLoading(false);
      setOtpError("OTP session expired. Please login again.");
      return;
    }

    try {
      const payload = {
        otp_id: otpMeta.otp_id,
        otp_code: otp,
        authUserName: loginEmail,
      };
      const response: any = await apiService.post(
        `${BASE_API_PATH}verify_login_otp`,
        payload,
        BASE_PORT
      );

      // The backend might return either:
      // A) { isSuccess: true, data: { status: "success", data: { ...payload... } } }
      // B) { isSuccess: true, data: { ...payload... } }
      const topLevelSuccess = response?.isSuccess === true;
      const dbStatusSuccess = response?.data?.status === "success";
      const normalized = response?.data?.data ?? response?.data ?? {};
      console.log(normalized);
      if ((topLevelSuccess || dbStatusSuccess) && normalized) {
        // Extract token & claims
        const token = normalized.accessToken;
        const tokenType = normalized.tokenType || "Bearer";
        const issuer = normalized.issuer;
        const expiresIn = normalized.expiresIn;
        const authUserId = normalized.authUserId ?? otpMeta.authUserId;
        const tenantId = normalized.tenantId;
        const roleId = normalized.roleId;
        const roleName = normalized.roleName;
        const isTemp = normalized.isTemp === true;

        console.log(normalized);
        // if (!token) {
        //   setOtpLoading(false);
        //   setOtpError("Missing access token in response.");
        //   return;
        // }

        // Update auth data with token + claims
        const currentAuthData = JSON.parse(
          localStorage.getItem("authData") || "{}"
        );
        const updatedAuthData = {
          ...currentAuthData,
          isOtpVerified: true,
          accessToken: token,
          tokenType,
          issuer,
          expiresIn,
          authUserId,
          tenantId,
          roleId,
          roleName,
          email: loginEmail,
        };
        setAuthData(updatedAuthData);
        window.dispatchEvent(new Event("authChange"));

        // 🔑 Register access token with apiService so all further calls include it
        setAuthToken(token);
        // Optional: FCM token binding
        try {
          await registerTokenWithBackend();
        } catch (e) {
          console.warn("register_device after OTP failed:", e);
        }

        localStorage.removeItem("otpMeta");

        setOtpLoading(false);
        showToast({ message: "OTP verified successfully!", type: "success" });

        if (isTempPassword === true) {
          navigate("/password-reset", {
            replace: true,
            state: { authUserId, loginEmail },
          });
        } else if (selfOnboarded === 5) {
          navigate("/client-self-onboard");
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        setOtpLoading(false);
        setOtpError(
          response?.data?.message || "Invalid OTP. Please try again."
        );
      }
    } catch (error: any) {
      setOtpLoading(false);
      setOtpError(
        error?.response?.data?.message ||
          error.message ||
          "OTP verification failed."
      );
    }
  };

  const handleBackToLogin = () => {
    clearAuthData();
    setShowOtpScreen(false);
    setOtpError("");
    setLoginEmail("");
    setOtpMeta(null);
    setFormData({ email: "", password: "", rememberMe: false });
  };

  return (
    <>
      <style>{style}</style>
      <div className="min-h-screen w-full bg-gradient-to-br from-[#01443B] via-[#013531] to-[#09B591] flex overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Main Content Container */}
        <div className="flex-1 flex relative z-10">
          {/* Left Side - Login Form or OTP */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12">
            <AnimatePresence mode="wait">
              {!showOtpScreen ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <div className="w-full max-w-md">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
                    >
                      <div className="space-y-3 text-center mb-4">
                        <div className="flex justify-center">
                          <div className="relative group cursor-pointer">
                            <div className="absolute -inset-0.5  rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                            <div className="relative">
                              <img
                                src="/src/assets/images/Frame 121.png"
                                alt=""
                                className="h-[140px] w-[370px] obejct-contain drop-shadow-lg"
                              />
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse-custom" />
                            </div>
                          </div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                          Welcome Back
                        </h1>
                        <p className="text-sm text-gray-600">
                          Secure access to your Architectural Intelligence
                          Platform
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 transition-all duration-200">
                            Email address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleChange}
                              onFocus={() => setActiveInput("email")}
                              className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder:text-gray-500 ${
                                errors.email
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 focus:ring-[#01443B]"
                              } ${activeInput === "email" ? "scale-105" : ""}`}
                              placeholder="you@example.com"
                            />
                            <div className="absolute top-1/2 -translate-y-1/2 right-4">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          </div>
                          {errors.email && (
                            <p className="pt-1 text-red-500 text-sm">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 transition-all duration-200">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              required
                              value={formData.password}
                              onChange={handleChange}
                              onFocus={() => setActiveInput("password")}
                              className={`w-full px-4 py-3 bg-white/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder:text-gray-500 ${
                                errors.password
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 focus:ring-[#01443B]"
                              } ${
                                activeInput === "password" ? "scale-105" : ""
                              }`}
                              placeholder="Enter your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="pt-1 text-red-500 text-sm">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="rememberMe"
                              checked={formData.rememberMe}
                              onChange={handleChange}
                              className="w-4 h-4 text-[#01443B] bg-white border-gray-300 rounded focus:ring-[#01443B] focus:ring-2"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                              Remember me
                            </span>
                          </label>
                          <Link
                            to="/forgot-password"
                            className="text-sm text-[#01443B] hover:text-[#09B591] transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full flex justify-center items-center px-4 py-3 bg-gradient-to-r from-[#01443B] to-[#09B591] text-white font-semibold rounded-xl hover:from-[#013531] hover:to-[#01443B] focus:outline-none focus:ring-2 focus:ring-[#01443B] focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Signing in...
                            </>
                          ) : (
                            <>
                              Sign in{" "}
                              <ChevronRight size={20} className="ml-2" />
                            </>
                          )}
                        </button>
                      </form>
                      <p className="w-full text-center mt-4 text-sm">V.1.3</p>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <OTPScreen
                  key="otp"
                  email={loginEmail}
                  onVerify={handleOtpVerify}
                  isLoading={otpLoading}
                  onBackToLogin={handleBackToLogin}
                  error={otpError}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Welcome Content */}
          {/* Right Side - Welcome Content */}
          <div className="hidden lg:flex lg:w-[60%] items-center justify-center px-8">
            <div className="max-w-3xl">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="text-5xl font-bold tracking-tight text-white mb-4">
                  TymeBot
                  <br />
                  <span className="text-[#09B591]">
                    Self-Learning • Self-Healing Orchestration
                  </span>
                </h2>
                <p className="text-lg leading-8 text-white/90">
                  Build, deploy, and evolve enterprise apps with{" "}
                  <strong>twice the speed</strong>,
                  <strong> half the cost</strong>, and{" "}
                  <strong>zero downtime</strong>. From requirements to UAT in{" "}
                  <strong>14 days</strong>, with continuous improvement baked
                  in.
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-2 gap-4 mb-8"
              >
                {[
                  {
                    icon: Zap,
                    title: "14-Day Rebuild",
                    desc: "Modernize from legacy to UAT-ready in two weeks.",
                  },
                  {
                    icon: Server,
                    title: "K8s Scale at VM Cost",
                    desc: "Elastic performance with smart, efficient runtime.",
                  },
                  {
                    icon: Shield,
                    title: "Built-in Compliance",
                    desc: "SOC 2, ISO 27001/17/18, ISO 22301, HIPAA, GDPR.",
                  },
                  {
                    icon: Globe,
                    title: "Net-Zero Ready",
                    desc: "Energy-aware orchestration that cuts waste.",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="group p-4 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10"
                  >
                    <feature.icon className="w-6 h-6 text-[#09B591] group-hover:text-white transition-colors mb-2" />
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-white/70">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-center text-white/70 text-sm tracking-wide"
              >
                FROM REQUIREMENTS TO UAT IN 14 DAYS • TWICE THE SPEED • HALF THE
                COST • ZERO DOWNTIME
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
