import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import type { FormState } from "@/lib/form-state";
import { num } from "./toolForm";

// Ustaya ver: ustada bu alət varsa say artır. Forma: tool_id, employee_id, quantity.
export async function giveTool(_prev: FormState, formData: FormData): Promise<FormState> {
  const toolId = Number(formData.get("tool_id"));
  const employeeId = Number(formData.get("employee_id"));
  const quantity = num(formData.get("quantity") ?? "1");
  if (!toolId) return { error: "Alət seçilməyib." };
  if (!employeeId) return { error: "Usta seçilməyib." };
  if (!Number.isFinite(quantity) || quantity <= 0) return { error: "Miqdar 0-dan çox olmalıdır." };

  const { error } = await createClient().rpc("give_tool", { p_tool_id: toolId, p_employee_id: employeeId, p_quantity: quantity });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Bir ustaya bir neçə alət/material birdən: hər biri ayrıca give_tool çağırışıdır (baza qaydaları hər birində işləyir).
// Biri alınmasa (məs. depoda çatmır), qalanları verilir və xəta mətni hansının alınmadığını deyir.
export async function giveTools(employeeId: number, items: { toolId: number; name: string; quantity: number }[]): Promise<FormState> {
  if (!employeeId) return { error: "Usta seçilməyib." };
  if (items.length === 0) return { error: "Heç nə seçilməyib." };
  const supabase = createClient();
  const failed: string[] = [];
  for (const it of items) {
    const { error } = await supabase.rpc("give_tool", { p_tool_id: it.toolId, p_employee_id: employeeId, p_quantity: it.quantity });
    if (error) failed.push(`${it.name}: ${error.message}`);
  }
  revalidate();
  if (failed.length) return { error: `${items.length - failed.length}/${items.length} verildi. Verilməyən: ${failed.join("; ")}` };
  return { ok: true };
}

// Ustadakı bütün alətləri geri al (materiallar yox: onlarda "nə qədər işlədi" deyilməlidir)
export async function returnAllTools(assignments: { id: number; quantity: number }[]): Promise<FormState> {
  const supabase = createClient();
  const failed: string[] = [];
  for (const a of assignments) {
    const { error } = await supabase.rpc("return_tool", { p_assignment_id: a.id, p_quantity: a.quantity });
    if (error) failed.push(error.message);
  }
  revalidate();
  if (failed.length) return { error: `${assignments.length - failed.length}/${assignments.length} geri alındı. ${failed[0]}` };
  return { ok: true };
}

// Geri al: hamısı və ya bir hissəsi. Tarixçə silinmir.
export async function returnTool(assignmentId: number, quantity: number): Promise<FormState> {
  const { error } = await createClient().rpc("return_tool", { p_assignment_id: assignmentId, p_quantity: quantity });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Material təhvili: usta neçə işlədib və neçə qaytarır; qalan hissə ustada qalır (hamısı bitirsə təhvil bağlanır). Bazada settle_material.
export async function settleMaterial(assignmentId: number, used: number, returned: number): Promise<FormState> {
  const { error } = await createClient().rpc("settle_material", { p_assignment_id: assignmentId, p_used: used, p_returned: returned });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Depodakı parçanı ustaya ver: amount verilməsə hamısı, verilsə bir hissəsi (qalan hissə depoda parça kimi qalır).
// Verilən hissə tam hissəyə qatılıb ustaya verilir; təhvildə yenidən bölünə bilər.
export async function givePiece(pieceId: number, employeeId: number, amount?: number): Promise<FormState> {
  const { error } = await createClient().rpc("give_piece", { p_piece_id: pieceId, p_employee_id: employeeId, p_amount: amount });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}
