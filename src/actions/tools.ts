
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { text, type FormState } from "@/lib/form-state";
import { toast } from "@/lib/toast";

// Depo: yazma yetkisi yalnız depo məsulu və müdirdədir (RLS + can_manage_tools()).
// Say qaydaları da bazadadır: depoda olandan çox vermək, ustalardakından az say yazmaq olmur.
// Bazanın xəta mətnləri Azərbaycan dilindədir, olduğu kimi göstərilir.

// Yalnız formada olan sahələr yazılır: formada olmayan (məs. bazadakı kateqoriya, qeyd) toxunulmaz qalır.
// kind ("tool" | "material") yalnız əlavə edəndə gəlir (gizli sahə); unit (ölçü vahidi) yalnız materialda.
function toolFields(formData: FormData) {
  const optional = Object.fromEntries(
    (["inventory_code", "category", "notes"] as const).filter((k) => formData.has(k)).map((k) => [k, text(formData, k)]),
  ) as { inventory_code?: string | null; category?: string | null; notes?: string | null };
  const kind = formData.has("kind") ? { kind: formData.get("kind") === "material" ? "material" : "tool" } : {};
  const unit = formData.has("unit") ? { unit: text(formData, "unit") ?? "ədəd" } : {};
  return {
    name: text(formData, "name"),
    quantity: Number(formData.get("quantity") ?? 1),
    ...optional,
    ...kind,
    ...unit,
  };
}

function checkFields(f: ReturnType<typeof toolFields>): string | null {
  if (!f.name) return "Adı vacibdir.";
  if (!Number.isInteger(f.quantity) || f.quantity < 0) return "Say 0 və ya müsbət tam ədəd olmalıdır.";
  return null;
}

function toolError(error: { code: string; message: string }): FormState {
  return { error: error.code === "23505" ? "Bu inventar kodu artıq var." : error.message };
}

export async function addTool(_prev: FormState, formData: FormData): Promise<FormState> {
  const f = toolFields(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const { error } = await createClient().from("tools").insert({ ...f, name: f.name! });
  if (error) return toolError(error);
  revalidate();
  return { ok: true };
}

export async function updateTool(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const f = toolFields(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const { error } = await createClient().from("tools").update({ ...f, name: f.name! }).eq("id", id);
  if (error) return toolError(error);
  revalidate();
  return { ok: true };
}

// Ustalarda olan alət silinmir (baza bloklayır): səbəbi tostla göstərilir
export async function deleteTool(id: number) {
  const { error } = await createClient().from("tools").delete().eq("id", id);
  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success("Alət silindi");
  revalidate();
}

// Ustaya ver: ustada bu alət varsa say artır. Forma: tool_id, employee_id, quantity.
export async function giveTool(_prev: FormState, formData: FormData): Promise<FormState> {
  const toolId = Number(formData.get("tool_id"));
  const employeeId = Number(formData.get("employee_id"));
  const quantity = Number(formData.get("quantity") ?? 1);
  if (!toolId) return { error: "Alət seçilməyib." };
  if (!employeeId) return { error: "Usta seçilməyib." };
  if (!Number.isInteger(quantity) || quantity < 1) return { error: "Say ən azı 1 olmalıdır." };

  const { error } = await createClient().rpc("give_tool", { p_tool_id: toolId, p_employee_id: employeeId, p_quantity: quantity });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Geri al: hamısı və ya bir hissəsi. Tarixçə silinmir.
export async function returnTool(assignmentId: number, quantity: number): Promise<FormState> {
  const { error } = await createClient().rpc("return_tool", { p_assignment_id: assignmentId, p_quantity: quantity });
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

// Usta materialı təhvil verir: neçə ölçü vahidi (metr...) işlədib. İşlənən sərf olunur, qalan hissə depoya AYRI PARÇA kimi yazılır;
// used = 0 olsa, götürülən olduğu kimi tam depoya qayıdır (bazada finish_material).
export async function finishMaterial(assignmentId: number, used: number): Promise<FormState> {
  const { error } = await createClient().rpc("finish_material", { p_assignment_id: assignmentId, p_used: used });
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

// Parçanı siyahıdan sil (sərf olunub)
export async function discardPiece(pieceId: number): Promise<boolean> {
  const { error } = await createClient().from("material_pieces").delete().eq("id", pieceId);
  if (error) {
    toast.error(error.message);
    return false;
  }
  toast.success("Parça silindi");
  revalidate();
  return true;
}

// Depo məsulunu yalnız müdir təyin edir (bazada trigger yoxlayır)
export async function setStorekeeper(employeeId: number, value: boolean) {
  const { error } = await createClient().from("employees").update({ is_storekeeper: value }).eq("id", employeeId);
  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success(value ? "Depo məsulu təyin edildi" : "Depo məsulu götürüldü");
  revalidate();
}
