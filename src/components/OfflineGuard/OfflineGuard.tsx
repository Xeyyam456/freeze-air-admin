import { useEffect, useRef, useState } from "react";
import { CloudOff, Wifi } from "lucide-react";
import { registerServiceWorker } from "@/lib/sw";
import { useOnline } from "@/shared/hooks/useOnline";
import s from "./OfflineGuard.module.css";

// Bütün tətbiq: service worker-i qeydiyyatdan keçirir (səhifə açılmayanda offline.html) və açıq səhifədə
// internet kəsiləndə yuxarıda zolaq göstərir; bağlantı qayıdanda qısa "bərpa olundu" yazısı çıxıb itir.
export function OfflineGuard() {
  const online = useOnline();
  const wasOffline = useRef(false);
  const [back, setBack] = useState(false);

  useEffect(() => registerServiceWorker(), []);
  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (!wasOffline.current) return;
    wasOffline.current = false;
    const show = setTimeout(() => setBack(true), 0);
    const hide = setTimeout(() => setBack(false), 2500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [online]);

  if (online && !back) return null;
  return (
    <div className={s.bar} data-state={online ? "back" : "off"} role="status" aria-live="polite">
      {online ? <Wifi size={16} /> : <CloudOff size={16} />}
      <span>{online ? "Bağlantı bərpa olundu" : "Şəbəkəyə qoşulu deyil — dəyişikliklər göndərilməyəcək"}</span>
    </div>
  );
}
