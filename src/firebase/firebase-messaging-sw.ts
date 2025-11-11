/// <reference lib="webworker" />
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare const self: ServiceWorkerGlobalScope;

const firebaseConfig = {
  apiKey: "AIzaSyB8RQac28FZHuRcIeUG14ywK_eqtsGTPcg",
  authDomain: "g3secai-bfcee.firebaseapp.com",
  projectId: "g3secai-bfcee",
  storageBucket: "g3secai-bfcee.appspot.com", // ← fix: use appspot.com
  messagingSenderId: "355068790791",
  appId: "1:355068790791:web:cb0dfc2bf42f9d365e02a2",
  measurementId: "G-0YMQ77XYN2",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  const title = payload.notification?.title || "Notification";
  const options: NotificationOptions = {
    body: payload.notification?.body,
    icon: "/images/g3-Logo-index-ai.png",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});
