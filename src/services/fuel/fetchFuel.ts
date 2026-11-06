import { createClient } from "@/lib/supabase/client";
import { coverDays } from "@/shared/utils/fuelCover";
import type { FuelData, MonthTotals } from "@/types/fuel";

// mFrom..mTo: seçilmiş dövrün ayı — balans aylıq hesablanır (istifadəçi: "hər ayın öz hesabı olacaq")
export async function fetchFuel(from: string, to: string, today: string, mFrom: string, mTo: string): Promise<FuelData> {
  const supabase = createClient();
  const [{ data: cars }, { data: logs }, { data: todayLogs }, { data: settings }, { data: payments }, { data: mCost }, { data: mPaid }] = await Promise.all([
    supabase.from("employees").select("id, full_name, photo_url, car_plate, car_model, fuel_per_100, fuel_type").eq("has_car", true).eq("is_active", true).order("full_name"),
    supabase.from("mileage_logs").select("*").gte("day", from).lte("day", to).order("day", { ascending: false }),
    // Bu günün hesabatı dövrdən asılı olmayaraq həmişə göstərilir
    supabase.from("mileage_logs").select("*").eq("day", today),
    supabase.from("fuel_settings").select("petrol_price, diesel_price").eq("id", 1).maybeSingle(),
    // Yanacaq pulunun ödənişləri (0080): dövrün siyahısı + ayın balansı (ayda verilən − ayda sərf)
    supabase.from("fuel_payments").select("*").gte("day", from).lte("day", to).order("day", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("mileage_logs").select("employee_id, day, cost").gte("day", mFrom).lte("day", mTo).not("cost", "is", null),
    supabase.from("fuel_payments").select("employee_id, amount, status").gte("day", mFrom).lte("day", mTo),
  ]);
  // usta → ayın sərfi, verilən ("Almadığını deyir" sayılmır) və günlərin ödəniş örtüyü (pullar günlərə köhnədən yeniyə paylanır)
  const month = new Map<number, MonthTotals>();
  const m = (id: number) => month.get(id) ?? (month.set(id, { cost: 0, paid: 0, cover: {} }), month.get(id)!);
  for (const r of mCost ?? []) m(r.employee_id).cost += Number(r.cost);
  for (const p of mPaid ?? []) if (p.status !== "disputed") m(p.employee_id).paid += Number(p.amount);
  for (const [id, t] of month) {
    t.cover = coverDays((mCost ?? []).filter((r) => r.employee_id === id).map((r) => ({ day: r.day, cost: Number(r.cost) })), t.paid);
  }
  return {
    cars: cars ?? [], logs: logs ?? [], todayLogs: todayLogs ?? [], payments: payments ?? [], month,
    prices: { petrol: settings?.petrol_price ?? null, diesel: settings?.diesel_price ?? null },
  };
}
