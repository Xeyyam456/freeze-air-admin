import { useEffect } from "react";
import { leaveRange } from "@/lib/attendance";
import { LIVE, revalidate } from "@/lib/revalidate";
import { isSoundReady, playNotify } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import { toast } from "@/lib/toast";

// Tapşırıqlar Realtime ilə (migrasiya 0056): usta tapşırığı "görüldü" işarələyəndə tost + qısa səs;
// hər dəyişiklikdə (yeni, geri alınan, işarələnən, təmir yazısı) siyahılar, ana səhifə və menyudakı nişan yenilənir.
// "Görüldü" işarəsini yalnız usta qoyur (0057), ona görə bu keçid həmişə ustadan gəlir. Ekranda heç nə çəkmir.
// Qrup tapşırığında bütün üzvlərin sətri eyni anda "görüldü" olur: hər üzv üçün ayrıca yox, qrup üçün bir bildiriş
const GROUP_TOAST_MS = 60_000;
const lastGroupToast = new Map<string, number>();

export function TasksListener() {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, async (payload) => {
        revalidate(...LIVE.tasks);
        if (payload.eventType !== "UPDATE") return;
        const t = payload.new as Tables<"tasks">;
        const old = payload.old as Partial<Tables<"tasks">>;
        if (!t.done || old.done !== false) return; // yalnız görülməyib → görülüb keçidi (replica identity full)
        const silent = !isSoundReady();
        const hint = silent ? " · səs üçün səhifədə bir dəfə klik et" : "";
        if (t.group_id) {
          const last = lastGroupToast.get(t.group_id) ?? 0;
          if (Date.now() - last < GROUP_TOAST_MS) return; // bu qrup üçün artıq bildiriş verilib
          lastGroupToast.set(t.group_id, Date.now());
          const { data: rows } = await supabase.from("tasks").select("employees(full_name)").eq("group_id", t.group_id);
          const names = (rows ?? []).map((x) => (x.employees as { full_name: string } | null)?.full_name.split(" ").slice(-1)[0]).filter(Boolean);
          toast.success(`Qrup tapşırığı görüldü: ${names.join(" + ") || "qrup"}`, `Qrup işi · ${t.reason}${hint}`);
          playNotify();
          return;
        }
        const { data: e } = await supabase.from("employees").select("full_name").eq("id", t.employee_id).maybeSingle();
        toast.success(`Tapşırıq görüldü: ${e?.full_name ?? "usta"}`, `${t.reason}${hint}`);
        playNotify();
      })
      // Davamiyyət (0059): usta icazə istəyəndə tost + səs; "İşə gəldim" və qərarlar siyahıları yeniləyir
      .on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, async (payload) => {
        revalidate(...LIVE.leaves);
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
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance" }, () => revalidate(...LIVE.attendance))
      // Yanacaq (0080-0082): usta ödənişi təsdiqləyəndə tost + səs; yürüş və ödəniş dəyişəndə Yanacaq səhifəsi yenilənir
      .on("postgres_changes", { event: "*", schema: "public", table: "mileage_logs" }, () => revalidate(...LIVE.fuel))
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_payments" }, async (payload) => {
        revalidate(...LIVE.fuel);
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
