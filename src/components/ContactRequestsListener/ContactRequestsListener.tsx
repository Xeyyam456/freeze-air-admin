import { useEffect } from "react";
import { LIVE, revalidate } from "@/lib/revalidate";
import { isSoundReady, playNotify } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import { toast } from "@/lib/toast";

// Tab arxa planda olanda başlıqda "(N)" göstərilir, tab açılanda silinir (səs olmasa da tab-da görünsün)
let unseen = 0;
let baseTitle = "";
function markTitle() {
  if (!document.hidden) return;
  baseTitle ||= document.title.replace(/^\(\d+\) .*? · /, "");
  unseen += 1;
  document.title = `(${unseen}) Yeni müraciət · ${baseTitle}`;
}
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && unseen) {
      unseen = 0;
      document.title = baseTitle;
    }
  });
}

// Saytdan yeni müraciət gələndə (Realtime, yalnız admin alır): tost + qısa səs + menyudakı sayğac və siyahı yenilənir.
// Ekranda heç nə çəkmir; giriş edən admin üçün bütün səhifələrdə işləyir.
export function ContactRequestsListener() {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("contact-requests")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_requests" }, (payload) => {
        const r = payload.new as Tables<"contact_requests">;
        // Səhifə yenilənəndən sonra heç klik olmayıbsa brauzer səsə icazə vermir: bunu tostda de və tab başlığında göstər
        const silent = !isSoundReady();
        toast.success(`Yeni müraciət: ${r.name}`, silent ? `${r.phone} · səs üçün səhifədə bir dəfə klik et` : r.phone);
        playNotify();
        markTitle();
        revalidate(...LIVE.requests);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
