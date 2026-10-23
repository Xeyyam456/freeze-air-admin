import { useEffect } from "react";
import { leaveRange } from "@/lib/attendance";
import { revalidate } from "@/lib/revalidate";
import { isSoundReady, playNotify } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import { toast } from "@/lib/toast";

// Tapşırıqlar Realtime ilə (migrasiya 0056): usta tapşırığı "görüldü" işarələyəndə tost + qısa səs;
// hər dəyişiklikdə (yeni, geri alınan, işarələnən, təmir yazısı) siyahılar, ana səhifə və menyudakı nişan yenilənir.
// "Görüldü" işarəsini yalnız usta qoyur (0057), ona görə bu keçid həmişə ustadan gəlir. Ekranda heç nə çəkmir.
export function TasksListener() {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, async (payload) => {
        revalidate();
        if (payload.eventType !== "UPDATE") return;
        const t = payload.new as Tables<"tasks">;
        const old = payload.old as Partial<Tables<"tasks">>;
        if (!t.done || old.done !== false) return; // yalnız görülməyib → görülüb keçidi (replica identity full)
        const { data: e } = await supabase.from("employees").select("full_name").eq("id", t.employee_id).maybeSingle();
        const silent = !isSoundReady();
        toast.success(`Tapşırıq görüldü: ${e?.full_name ?? "usta"}`, silent ? `${t.reason} · səs üçün səhifədə bir dəfə klik et` : t.reason);
        playNotify();
      })
      // Davamiyyət (0059): usta icazə istəyəndə tost + səs; "İşə gəldim" və qərarlar siyahıları yeniləyir
      .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, async (payload) => {
        revalidate();
        const l = payload.new as Tables<"leave_requests">;
        // Usta icazədən imtina etdi (0063): ləğv və ya qısaldılma
        if (payload.eventType === "UPDATE") {
          const o = payload.old as Partial<Tables<"leave_requests">>;
          if ((l.status === "cancelled" && o.status !== "cancelled") || (o.date_to && l.date_to < o.date_to)) {
            const { data: e } = await supabase.from("employees").select("full_name").eq("id", l.employee_id).maybeSingle();
            toast.success(`İcazədən imtina: ${e?.full_name ?? "usta"}`, `${leaveRange(o.date_from && o.date_to ? { date_from: o.date_from, date_to: o.date_to } : l)} · icazəyə ehtiyac qalmadı`);
          }
          return;
        }
        if (payload.eventType !== "INSERT") return;
        const { data: e } = await supabase.from("employees").select("full_name").eq("id", l.employee_id).maybeSingle();
        toast.success(`İcazə sorğusu: ${e?.full_name ?? "usta"}`, `${leaveRange(l)} · ${l.reason ?? "səbəb yazılmayıb"}`);
        playNotify();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => revalidate())
      // Yanacaq (0080-0082): usta ödənişi təsdiqləyəndə tost + səs; yürüş və ödəniş dəyişəndə Yanacaq səhifəsi yenilənir
      .on("postgres_changes", { event: "*", schema: "public", table: "mileage_logs" }, () => revalidate())
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_payments" }, async (payload) => {
        revalidate();
        if (payload.eventType !== "UPDATE") return;
        const p = payload.new as Tables<"fuel_payments">;
        const o = payload.old as Partial<Tables<"fuel_payments">>;
        if (p.status === o.status || p.status === "pending") return; // yalnız ustanın cavabı (aldım / almadım)
        const { data: e } = await supabase.from("employees").select("full_name").eq("id", p.employee_id).maybeSingle();
        const sum = `${Number(p.amount).toFixed(2)} ₼`;
        if (p.status === "received") toast.success(`Yanacaq pulunu aldı: ${e?.full_name ?? "usta"}`, sum);
        else toast.error(`Yanacaq pulunu almadığını deyir: ${e?.full_name ?? "usta"}`, `${sum} · yoxla`);
        playNotify();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
