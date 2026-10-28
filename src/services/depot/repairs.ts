import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import type { FormState } from "@/lib/form-state";

// Təmir: göndərilən say depoda boş sayılmır; qayıdanda düzəlibsə depoya, düzəlməyibsə silinmə aktı gözləməyə düşür
export async function sendRepair(toolId: number, quantity: number, place: string | null, note: string | null): Promise<FormState> {
  const { error } = await createClient().rpc("tool_repair_send", { p_tool_id: toolId, p_quantity: quantity, p_place: place ?? undefined, p_note: note ?? undefined });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function finishRepair(id: number, fixed: boolean): Promise<FormState> {
  const { error } = await createClient().rpc("tool_repair_finish", { p_id: id, p_fixed: fixed });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
