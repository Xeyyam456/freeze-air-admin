import { createClient } from "@/lib/supabase/client";

const PLACE = "place_text, stores(name, companies(name)), companies(name)";

// "Günün axını" üçün xam hadisələr: [from, to] günləri (Bakı vaxtı) arasında baş verən hər şey.
// Yalnız vaxt və qısa ad sütunları; çevirmə pages/Home/utils/toFlowEvents.ts-dədir.
export async function fetchFlowRaw(from: string, to: string) {
  const supabase = createClient();
  const a = `${from}T00:00:00+04:00`;
  const b = `${to}T23:59:59.999+04:00`;
  const rows = <T,>(r: { data: T[] | null }) => r.data ?? [];

  const [requests, tasks, work, attendance, moves, depotReqs, leaves, mileage, payments, announcements] = await Promise.all([
    supabase.from("contact_requests").select("id, name, handled, created_at").gte("created_at", a).lte("created_at", b).then(rows),
    // Tapşırıq ya bu aralıqda verilib, ya da bu aralıqda görülüb (dünən verilib bu gün görülən də görünsün)
    supabase.from("tasks").select(`id, created_at, done_at, reason, employees(full_name), ${PLACE}`).is("cancelled_at", null)
      .or(`and(created_at.gte.${a},created_at.lte.${b}),and(done_at.gte.${a},done_at.lte.${b})`).then(rows),
    supabase.from("work_logs").select(`id, created_at, employees(full_name), ${PLACE}`).gte("created_at", a).lte("created_at", b).then(rows),
    supabase.from("attendance").select("id, checked_in_at, checked_out_at, employees(full_name)").gte("day", from).lte("day", to).then(rows),
    supabase.from("stock_movements").select("id, at, kind, tool_name, quantity, unit").gte("at", a).lte("at", b).then(rows),
    supabase.from("depot_requests").select("id, created_at, decided_at, status, tool_name, created_by_name").gte("created_at", a).lte("created_at", b).then(rows),
    supabase.from("leave_requests").select("id, created_at, decided_at, status, employees(full_name)").gte("created_at", a).lte("created_at", b).then(rows),
    supabase.from("mileage_logs").select("id, start_at, end_at, employees(full_name)").gte("day", from).lte("day", to).then(rows),
    supabase.from("fuel_payments").select("id, created_at, status, amount, employees(full_name)").gte("created_at", a).lte("created_at", b).then(rows),
    supabase.from("announcements").select("id, created_at, title").gte("created_at", a).lte("created_at", b).then(rows),
  ]);

  return { requests, tasks, work, attendance, moves, depotReqs, leaves, mileage, payments, announcements };
}
