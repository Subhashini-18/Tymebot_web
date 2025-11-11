// src/firebase/useNotifications.ts
import { useEffect } from "react";
import {
  requestNotificationPermission,
  onForegroundNotification,
  registerTokenWithBackend,
} from "@/firebase/notificationService";
import { getAuthData } from "@/utils/auth";

export function useNotifications() {
  useEffect(() => {
    requestNotificationPermission(); // pre-auth: get token + cache
    onForegroundNotification();

    const maybeLink = () => {
      const auth: any = getAuthData?.();
      if (auth?.isAuthenticated && auth?.isOtpVerified) {
        registerTokenWithBackend();
      }
    };

    // If already fully authed (page refresh cases)
    maybeLink();

    // Link right after your app signals auth update
    window.addEventListener("authChange", maybeLink);
    return () => window.removeEventListener("authChange", maybeLink);
  }, []);
}
