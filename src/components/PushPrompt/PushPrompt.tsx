import { useEffect, useState } from "react";
import { BellRing, Share } from "lucide-react";
import { enablePush, iosNeedsInstall, pushSupported, refreshPush } from "@/lib/push";
import { toast } from "@/lib/toast";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";

// Admin panelinin üstündə: bildirişlər açıq deyilsə "Bildirişləri aç" (elanlar, komanda, öz tapşırıqları).
// iPhone-da əvvəl ana ekrana əlavə etmək lazımdır — onda izah göstərilir. Açıqdırsa heç nə görünmür.
export function PushPrompt() {
  const [state, setState] = useState<"hidden" | "ask" | "ios" | "denied">("hidden");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      if (iosNeedsInstall()) return alive && setState("ios");
      if (!pushSupported()) return;
      if (Notification.permission === "denied") return alive && setState("denied");
      const on = await refreshPush();
      if (alive && !on) setState("ask");
    })();
    return () => { alive = false; };
  }, []);

  async function enable() {
    setBusy(true);
    const r = await enablePush();
    setBusy(false);
    if (r === "ok") {
      toast.success("Bildirişlər açıldı");
      setState("hidden");
    } else if (r === "denied") setState("denied");
    else toast.error("Bildirişləri açmaq alınmadı, yenidən cəhd edin");
  }

  if (state === "hidden") return null;
  return (
    <Card className="flex items-center gap-3 !py-3">
      <BellRing size={20} className="shrink-0 text-primary" />
      <p className="min-w-0 flex-1 text-sm">
        {state === "ask" && "Elanlar və komanda dəyişiklikləri bu cihaza bildiriş kimi gəlsin."}
        {state === "denied" && "Bildirişlər brauzerdə bağlıdır: saytın tənzimləmələrindən \"Bildirişlər\"-ə icazə verin."}
        {state === "ios" && (
          <>Bildiriş üçün paneli ana ekrana əlavə edin: <Share size={14} className="inline align-[-2px]" /> Paylaş → “Ana ekrana əlavə et”, sonra oradan açın.</>
        )}
      </p>
      {state === "ask" && <Button size="sm" onClick={enable} disabled={busy}>{busy ? "Açılır..." : "Bildirişləri aç"}</Button>}
    </Card>
  );
}
