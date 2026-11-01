import { useEffect } from "react";
import { leaveRange } from "@/shared/utils/attendance/leaveRange";
import { LIVE, revalidate } from "@/lib/revalidate";
import { isSoundReady, playNotify } from "@/lib/sound";
import { fetchEmployeeName } from "@/services/employees/fetchEmployeeName";
import { fetchGroupNames } from "@/services/tasks/fetchGroupNames";
import { openChannel } from "@/services/realtime/openChannel";
import type { Tables } from "@/types/database";
import { toast } from "@/lib/toast";

// Tapşırıqlar Realtime ilə (migrasiya 0056): usta tapşırığı "görüldü" işarələyəndə tost + qısa səs;
// hər dəyişiklikdə (yeni, geri alınan, işarələnən, təmir yazısı) siyahılar, ana səhifə və menyudakı nişan yenilənir.
// "Görüldü" işarəsini yalnız usta qoyur (0057), ona görə bu keçid həmişə ustadan gəlir. Ekranda heç nə çəkmir.
// Qrup tapşırığında bütün üzvlərin sətri eyni anda "görüldü" olur: hər üzv üçün ayrıca yox, qrup üçün bir bildiriş
const GROUP_TOAST_MS = 60_000;
const lastGroupToast = new Map<string, number>();

export function TasksListener() {
  useEffect(() => {
    return openChannel("tasks", (channel) => channel
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
          const names = await fetchGroupNames(t.group_id);
          toast.success(`Qrup tapşırığı görüldü: ${names.join(" + ") || "qrup"}`, `Qrup işi · ${t.reason}${hint}`);
          playNotify();
          return;
        }
        const who = await fetchEmployeeName(t.employee_id);
        toast.success(`Tapşırıq görüldü: ${who ?? "usta"}`, `${t.reason}${hint}`);
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
            const who = await fetchEmployeeName(l.employee_id);
            toast.success(`İcazədən imtina: ${who ?? "usta"}`, `${leaveRange(o.date_from && o.date_to ? { date_from: o.date_from, date_to: o.date_to } : l)} · icazəyə ehtiyac qalmadı`);
          }
          return;
        }
        if (payload.eventType !== "INSERT") return;
        const who = await fetchEmployeeName(l.employee_id);
        toast.success(`İcazə sorğusu: ${who ?? "usta"}`, `${leaveRange(l)} · ${l.reason ?? "səbəb yazılmayıb"}`);
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
        const who = await fetchEmployeeName(p.employee_id);
        const sum = `${Number(p.amount).toFixed(2)} ₼`;
        if (p.status === "received") toast.success(`Yanacaq pulunu aldı: ${who ?? "usta"}`, sum);
        else toast.error(`Yanacaq pulunu almadığını deyir: ${who ?? "usta"}`, `${sum} · yoxla`);
        playNotify();
      })
    );
  }, []);

  return null;
}
