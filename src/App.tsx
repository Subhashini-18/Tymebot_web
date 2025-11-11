import React, { Suspense } from "react";
import { FormProvider } from "./context/FormContext";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { Provider } from "react-redux";
import { store } from "./store";
import LoginPage from "./components/LoginPage";
import Layout from "./components/Layout";
import {
  getAuthData,
  isAuthenticated,
  isLoggedInButNotVerified,
  clearAuthData, // <-- import clearAuthData
} from "./utils/auth";
import { ThemeProvider } from "./context/ThemeContext";
import LoadingSpinner from "./components/LoadingSpinner";
import { routes } from "./routes/routes";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ForgotPasswordOTPPage from "./components/ForgotPasswordOTPPage";
import PasswordReset from "./components/PasswordReset";
// import ClientFormIndex from "./pages/client-onboarding";
import ForgotPasswordNewPasswordPage from "./components/ForgotPasswordNewPasswordPage";
import { useNotifications } from "./firebase/useNotifications";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = React.useState<
    "loading" | "authenticated" | "not-authenticated" | "otp-pending"
  >("loading");

  React.useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        setAuthState("authenticated");
      } else if (isLoggedInButNotVerified()) {
        setAuthState("otp-pending");
      } else {
        setAuthState("not-authenticated");
      }
    };

    checkAuth();

    // Listen for storage changes (in case of login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event for same-tab authentication changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  // Show loading state while checking authentication
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (authState === "not-authenticated" || authState === "otp-pending") {
    return <LoginPage />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const authData = getAuthData();
  const selfOnboard = authData?.clientStatus;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/forgot-password/otp"
          element={<ForgotPasswordOTPPage />}
        />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route
          path="/forgot-password/new-password"
          element={<ForgotPasswordNewPasswordPage />}
        />
        {/* <Route path="/client-self-onboard" element={<ClientFormIndex />} /> */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path === "/" ? "" : route.path}
              element={<route.component />}
            />
          ))}
        </Route>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  useNotifications();
  // React.useEffect(() => {
  //   clearAuthData(); // Clear auth data on initial app load
  // }, []);
  return (
    <Provider store={store}>
      <FormProvider>
        <ToastProvider>
          <ThemeProvider>
            <Router>
              <AppRoutes />
            </Router>
          </ThemeProvider>
        </ToastProvider>
      </FormProvider>
    </Provider>
  );
}

export default App;
