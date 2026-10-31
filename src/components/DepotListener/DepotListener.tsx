import { useEffect } from "react";
import { LIVE, revalidate } from "@/lib/revalidate";
import { isSelfAction } from "@/lib/selfAction";
import { isSoundReady, playNotify } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";
import { toast } from "@/lib/toast";
import { requestLabel } from "@/pages/Depot/utils/requests";

// Depo Realtime ilə (0084), yalnız depo məsulu və adminlərdə: yeni sənəd (ustanın qaytarması, istəyi, mədaxil...) → tost + səs;
// alət/material ustaya veriləndə (başqa admin/depo məsulu verəndə) və usta "Aldım" / "Almadım" deyəndə tost. Hər dəyişiklikdə Depo səhifəsi və menyu nişanı yenilənir. Ekranda heç nə çəkmir.
export function DepotListener() {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("depot")
      .on("postgres_changes", { event: "*", schema: "public", table: "depot_requests" }, (payload) => {
        revalidate(...LIVE.depot);
        if (payload.eventType !== "INSERT") return;
        const r = payload.new as Tables<"depot_requests">;
        const u = r.tool_kind === "material" ? r.unit : "ədəd";
        const silent = !isSoundReady();
        toast.success(`${requestLabel(r)}: ${r.created_by_name ?? ""}`, `${r.tool_name} · ${r.quantity ?? ""} ${u}${silent ? " · səs üçün səhifədə bir dəfə klik et" : ""}`);
        playNotify();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tool_assignments" }, async (payload) => {
        revalidate(...LIVE.depot);
        const a = payload.new as Tables<"tool_assignments">;
        const o = payload.old as Partial<Tables<"tool_assignments">>;
        // Verildi: yeni təhvil (INSERT) və ya ustada olana əlavə (say artır); öz verdiyin üçün ikinci tost yoxdur
        const gave = payload.eventType === "INSERT" ? a.quantity : payload.eventType === "UPDATE" && !a.returned_at && a.quantity > (o.quantity ?? a.quantity) ? a.quantity - (o.quantity ?? 0) : 0;
        const received = payload.eventType === "UPDATE" && a.received_at && !o.received_at;
        const disputed = payload.eventType === "UPDATE" && a.disputed_at && !o.disputed_at;
        if (!gave && !received && !disputed) return; // başqa dəyişikliklər (qaytarma və s.) bildiriş vermir
        if (gave && isSelfAction()) return;
        const [{ data: e }, { data: t }] = await Promise.all([
          supabase.from("employees").select("full_name").eq("id", a.employee_id).maybeSingle(),
          supabase.from("tools").select("name, kind, unit").eq("id", a.tool_id).maybeSingle(),
        ]);
        const u = t?.kind === "material" ? t.unit : "ədəd";
        if (gave) {
          toast.success(`Verildi: ${e?.full_name ?? "usta"}`, `${t?.name ?? ""} · ${gave} ${u}`);
          playNotify();
        } else if (received) toast.success(`Aldı: ${e?.full_name ?? "usta"}`, `${t?.name ?? ""} · ${a.quantity} ${u}`);
        else {
          toast.error(`Almadığını deyir: ${e?.full_name ?? "usta"}`, `${t?.name ?? ""} · ${a.quantity} ${u} · Depo səhifəsində yoxla`);
          playNotify();
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
