import { createClient } from "@/lib/supabase/client";
import { localDate } from "@/shared/utils/localDate";
import { isLowStock } from "@/pages/Depot/utils/stock";
import type { NavBadges } from "@/types/layout";

// Menyu nişanları: baxılmamış müraciət, bugünkü gözləyən tapşırıq, depo (təsdiq gözləyən sənəd + "Almadım" + azalan), gözləyən icazə
export async function fetchNavBadges(): Promise<NavBadges> {
  const supabase = createClient();
  const [requests, tasks, low, docs, disputed, leave] = await Promise.all([
    supabase.from("contact_requests").select("*", { count: "exact", head: true }).eq("handled", false).then((r) => r.count ?? 0),
    // Qrup tapşırığı (0071) bir tapşırıq sayılır
    supabase.from("tasks").select("group_id").eq("task_date", localDate()).eq("done", false).is("cancelled_at", null)
      .then((r) => new Set((r.data ?? []).map((t, i) => t.group_id ?? `t${i}`)).size),
    supabase.from("tool_stock").select("min_stock, available, pieces_total")
      .then((r) => (r.data ?? []).filter((t) => isLowStock({ min_stock: t.min_stock, available: t.available ?? 0, pieces_total: t.pieces_total ?? 0 })).length),
    // Depo sənədləri (0084): təsdiq gözləyən və ustanın "Almadım" dediyi
    supabase.from("depot_requests").select("*", { count: "exact", head: true }).eq("status", "pending").then((r) => r.count ?? 0),
    supabase.from("tool_assignments").select("*", { count: "exact", head: true }).is("returned_at", null).is("received_at", null).not("disputed_at", "is", null)
      .then((r) => r.count ?? 0),
    supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending").then((r) => r.count ?? 0),
  ]);
  return {
    requests, tasks, stock: low + docs + disputed, leave,
    stockTitle: [docs && `${docs} sənəd təsdiq gözləyir`, disputed && `${disputed} «Almadım»`, low && `${low} azalan`].filter(Boolean).join(" · "),
  };
}
