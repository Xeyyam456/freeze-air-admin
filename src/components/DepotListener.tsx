import { useEffect } from "react";
import { revalidate } from "@/lib/revalidate";
import { isSoundReady, playNotify } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import { toast } from "@/lib/toast";
import { requestLabel } from "@/components/depot/depotUtils";

// Depo Realtime ilə (0084), yalnız depo məsulu və adminlərdə: yeni sənəd (ustanın qaytarması, istəyi, mədaxil...) → tost + səs;
// usta verilən aləti "Aldım" / "Almadım" deyəndə tost. Hər dəyişiklikdə Depo səhifəsi və menyu nişanı yenilənir. Ekranda heç nə çəkmir.
export function DepotListener() {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("depot")
      .on("postgres_changes", { event: "*", schema: "public", table: "depot_requests" }, (payload) => {
        revalidate();
        if (payload.eventType !== "INSERT") return;
        const r = payload.new as Tables<"depot_requests">;
        const u = r.tool_kind === "material" ? r.unit : "ədəd";
        const silent = !isSoundReady();
        toast.success(`${requestLabel(r)}: ${r.created_by_name ?? ""}`, `${r.tool_name} · ${r.quantity ?? ""} ${u}${silent ? " · səs üçün səhifədə bir dəfə klik et" : ""}`);
        playNotify();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tool_assignments" }, async (payload) => {
        revalidate();
        if (payload.eventType !== "UPDATE") return;
        const a = payload.new as Tables<"tool_assignments">;
        const o = payload.old as Partial<Tables<"tool_assignments">>;
        const received = a.received_at && !o.received_at;
        const disputed = a.disputed_at && !o.disputed_at;
        if (!received && !disputed) return; // yalnız ustanın cavabı (replica identity full)
        const [{ data: e }, { data: t }] = await Promise.all([
          supabase.from("employees").select("full_name").eq("id", a.employee_id).maybeSingle(),
          supabase.from("tools").select("name").eq("id", a.tool_id).maybeSingle(),
        ]);
        if (received) toast.success(`Aldı: ${e?.full_name ?? "usta"}`, `${t?.name ?? ""} · ${a.quantity}`);
        else {
          toast.error(`Almadığını deyir: ${e?.full_name ?? "usta"}`, `${t?.name ?? ""} · ${a.quantity} · Depo səhifəsində yoxla`);
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
