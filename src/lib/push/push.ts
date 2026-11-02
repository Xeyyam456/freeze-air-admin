import { removePushSubscription, savePushSubscription } from "@/services/push/push";

// Web Push (VAPID). Açıq açar gizli deyil; gizli açar yalnız Edge Function `push`-dadır (Supabase secrets).
const VAPID_PUBLIC = "BK7aeonDZu5a84g0n2GUNMyp7dJ82cFmfq76Zn9o6FicHN16H8T6JkGs7jONfCXNXSLvQqSw-3tY_yCUsDv70FQ";

export function pushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// iPhone/iPad: push yalnız ana ekrana əlavə olunmuş (standalone) paneldə işləyir
export function iosNeedsInstall() {
  if (typeof window === "undefined") return false;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
  return ios && !standalone;
}

async function registration() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

// Mövcud abunəlik (icazə verilib və cihaz abunədirsə)
export async function currentSubscription() {
  if (!pushSupported() || Notification.permission !== "granted") return null;
  const reg = await navigator.serviceWorker.getRegistration("/");
  return (await reg?.pushManager.getSubscription()) ?? null;
}

// Düymə ilə çağırılır (iOS icazəni yalnız istifadəçi hərəkətində soruşur)
export async function enablePush(): Promise<"ok" | "denied" | "error"> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";
    const reg = await registration();
    await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC }));
    await savePushSubscription(sub);
    return "ok";
  } catch {
    return "error";
  }
}

// Girişdən sonra abunəliyi təzələ (cihaz başqa hesabdan keçibsə, bildirişlər yeni hesaba getsin)
export async function refreshPush() {
  const sub = await currentSubscription();
  if (sub) await savePushSubscription(sub).catch(() => {});
  return !!sub;
}

export async function disablePush() {
  const sub = await currentSubscription();
  if (!sub) return;
  await removePushSubscription(sub.endpoint);
  await sub.unsubscribe();
}
