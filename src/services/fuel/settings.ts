import { createClient } from "@/lib/supabase/client";
import type { FuelType } from "@/types/fuel";

// Yanacaq qiyməti (benzin / dizel); xəta mətni və ya null
export async function updatePrice(kind: FuelType, price: number | null) {
  const { error } = await createClient().from("fuel_settings")
    .update(kind === "petrol" ? { petrol_price: price, updated_at: new Date().toISOString() } : { diesel_price: price, updated_at: new Date().toISOString() }).eq("id", 1);
  return error?.message ?? null;
}

// Ustanın maşınının 100 km-ə sərfi (litr)
export async function updatePer100(id: number, v: number | null) {
  const { error } = await createClient().from("employees").update({ fuel_per_100: v }).eq("id", id);
  return error?.message ?? null;
}

// Sərf/qiymət olmadan bağlanmış günlər indi hesablanır (0078); hesablanmış köhnə günlər dəyişmir
export async function fillMissing() {
  await createClient().rpc("mileage_fill_missing");
}
