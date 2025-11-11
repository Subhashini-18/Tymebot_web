// src/components/EnableNotificationsButton.tsx
import {
  requestNotificationPermission,
  registerTokenWithBackend,
} from "@/firebase/notificationService";
import { getAuthData } from "@/utils/auth";

export function EnableNotificationsButton() {
  async function handleClick() {
    const token = await requestNotificationPermission();
    console.log("User’s FCM Token:", token);

    const auth: any = getAuthData?.();
    if (auth?.userId && auth?.isOtpVerified && token) {
      await registerTokenWithBackend();
    }
  }

  return <button onClick={handleClick}>Enable Notifications</button>;
}
