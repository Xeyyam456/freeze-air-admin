import { createClient } from "@/lib/supabase/client";

// Yanacaq pulunun ödənişi (0080); xəta mətni və ya null
export async function insertPayment(employeeId: number, day: string, amount: number, note: string | null) {
  const { error } = await createClient().from("fuel_payments").insert({ employee_id: employeeId, day, amount, note });
  return error?.message ?? null;
}

export async function removePayment(id: number) {
  const { error } = await createClient().from("fuel_payments").delete().eq("id", id);
  return error?.message ?? null;
}
