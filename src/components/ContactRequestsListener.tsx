import { useEffect } from "react";
import { revalidate } from "@/lib/revalidate";
import { playNotify } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import { toast } from "@/lib/toast";

// Saytdan yeni müraciət gələndə (Realtime, yalnız admin alır): tost + qısa səs + menyudakı sayğac və siyahı yenilənir.
// Ekranda heç nə çəkmir; giriş edən admin üçün bütün səhifələrdə işləyir.
export function ContactRequestsListener() {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("contact-requests")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_requests" }, (payload) => {
        const r = payload.new as Tables<"contact_requests">;
        toast.success(`Yeni müraciət: ${r.name}`, r.phone);
        playNotify();
        revalidate();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
