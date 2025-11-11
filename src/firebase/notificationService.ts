// src/firebase/notificationService.ts
import { getToken, onMessage } from "firebase/messaging";
import { getAuthData } from "@/utils/auth";
import { messaging } from "./firebase";

const VAPID_KEY =
  "BO3r972hI3weHQCyK-72v0MPckDP-GNemzqaypAhUfpU2Od5sshMfMRxLfJ9s9ohn09AuV5TyqCfEE1I5Uutui0";

const PENDING_FCM_TOKEN = "pending_fcm_token";

// ---- Env helpers ------------------------------------------------------------

const ENV = import.meta.env as Record<string, string | undefined>;

function buildNotificationUrl(endpoint: string) {
  const base = (ENV.VITE_DEFAULT_API_BASE_URL || "").replace(/\/$/, ""); // e.g. http://192.168.1.44
  const port = ENV.VITE_NOTIFICATION_PORT; // e.g. 8000 (string)
  const apiPath = (
    ENV.VITE_NOTIFICATION_API_PATH || "/api/g3/tracs/notification/v1/"
  )
    .replace(/^\/?/, "/")
    .replace(/\/?$/, "/"); // -> /api/g3/tracs/notification/v1/

  // Only append :port if base has no explicit port already
  const origin = base
    ? port && !/:\d+$/.test(base)
      ? `${base}:${port}`
      : base
    : ""; // if no base provided, fall back to relative path

  return `${origin}${apiPath}${endpoint.replace(/^\//, "")}`;
}

// ---- Feature guards (SSR-safe) ---------------------------------------------

const hasSW = typeof navigator !== "undefined" && "serviceWorker" in navigator;
const hasNotif = typeof window !== "undefined" && "Notification" in window;

// ---- Utilities --------------------------------------------------------------

/** Resolve numeric tenant/user IDs from our auth blob (handles authUserId). */
function resolveAuthIds(auth: any) {
  const tenantIdNum = Number(auth?.tenantId ?? auth?.tenant?.id);
  const userIdNum = Number(auth?.authUserId ?? auth?.userId ?? auth?.id);
  if (!Number.isFinite(tenantIdNum) || tenantIdNum <= 0) return null;
  if (!Number.isFinite(userIdNum) || userIdNum <= 0) return null;
  return { tenantId: tenantIdNum, userId: userIdNum };
}

async function ensureSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!hasSW) return null;
  try {
    const swUrl = "/firebase-messaging-sw.js"; // built via your esbuild script into /public

    // Optional probe to surface 404s early (doesn't throw)
    try {
      const probe = await fetch(swUrl, { cache: "no-store" });
      if (!probe.ok) console.warn("firebase-messaging-sw.js not OK at", swUrl);
    } catch {
      /* ignore probe errors */
    }

    const existing = await navigator.serviceWorker.getRegistration();
    if (existing) return existing;

    const reg = await navigator.serviceWorker.register(swUrl, {
      scope: "/",
      type: "module", // important since you bundle the SW as ESM
    });

    if (reg.installing || reg.waiting) {
      await new Promise<void>((resolve) => {
        const sw = reg.installing || reg.waiting;
        if (!sw) return resolve();
        const onState = () => {
          if (sw.state === "activated") {
            sw.removeEventListener("statechange", onState);
            resolve();
          }
        };
        sw.addEventListener("statechange", onState);
      });
    }

    return reg;
  } catch (e) {
    console.error("Service worker registration failed:", e);
    return null;
  }
}

/** Get (or create) an FCM token and cache it locally for later linking. */
async function ensureFcmToken(): Promise<string | null> {
  if (!hasSW || !hasNotif) return null;

  const cached = localStorage.getItem(PENDING_FCM_TOKEN);
  if (cached) return cached;

  const swReg = await ensureSWRegistration();
  if (!swReg) return null;

  // Permission flow
  const status: NotificationPermission = Notification.permission;
  if (status === "default") {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return null;
  } else if (status === "denied") {
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });
  if (!token) return null;

  localStorage.setItem(PENDING_FCM_TOKEN, token);
  return token;
}

// ---- Public API -------------------------------------------------------------

/**
 * Pre-auth: register SW, ask permission, obtain token, and cache it locally.
 * Does NOT call your backend (no user context yet).
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    return await ensureFcmToken();
  } catch (err) {
    console.error("requestNotificationPermission error:", err);
    return null;
  }
}

/**
 * Post-auth: if we have an authenticated, OTP-verified user, send the cached
 * (or freshly minted) token to the backend. Safe to call repeatedly.
 */
export async function registerTokenWithBackend(): Promise<boolean> {
  try {
    if (!hasSW || !hasNotif) return false;

    const auth: any = getAuthData?.();
    if (!auth?.isOtpVerified) return false; // don't link before OTP verification

    const ids = resolveAuthIds(auth);
    if (!ids) return false;

    const token = await ensureFcmToken();
    if (!token) return false;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (auth?.accessToken) {
      headers["Authorization"] = `${auth?.tokenType || "Bearer"} ${
        auth.accessToken
      }`;
    }

    const url = buildNotificationUrl("register_device");
    const res = await fetch(url, {
      method: "POST",
      headers,
      // credentials: "include", // enable if your middleware uses cookie/session auth
      body: JSON.stringify({
        tenantId: ids.tenantId,
        userId: ids.userId,
        deviceType: "WEB",
        fcmToken: token,
        replaceOld: true,
        deviceMeta: {
          app: "web",
          url: window.location.origin,
          ua: navigator.userAgent,
        },
      }),
    });

    if (!res.ok) {
      console.error("register_device failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("registerTokenWithBackend error:", err);
    return false;
  }
}

/** Clear cached token on logout (call where you clear auth). */
export function clearPendingFcmToken() {
  try {
    localStorage.removeItem(PENDING_FCM_TOKEN);
  } catch {
    /* noop */
  }
}

/** Foreground messages → wire into your toast/snackbar as needed. */
export function onForegroundNotification() {
  onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);
    // TODO: show toast/snackbar
  });
}
