// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB8RQac28FZHuRcIeUG14ywK_eqtsGTPcg",
  authDomain: "g3secai-bfcee.firebaseapp.com",
  projectId: "g3secai-bfcee",
  storageBucket: "g3secai-bfcee.appspot.com", // ← correct domain
  messagingSenderId: "355068790791",
  appId: "1:355068790791:web:cb0dfc2bf42f9d365e02a2",
  measurementId: "G-0YMQ77XYN2",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const analytics = getAnalytics(app);
