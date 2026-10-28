import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { text, type FormState } from "@/lib/form-state";
import { toast } from "@/lib/toast";
import { createReceipt } from "./documents";
import { checkFields, nameKey, toolError, toolFields } from "./toolForm";

export async function addTool(_prev: FormState, formData: FormData): Promise<FormState> {
  const f = toolFields(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const supabase = createClient();
  // Eyni növdə eyni ad ikinci dəfə yaradılmır: mövcud olanı açıb miqdarı artırmaq lazımdır
  const kind = (f as { kind?: string }).kind ?? "tool";
  const { data: existing } = await supabase.from("tools").select("name").eq("kind", kind);
  const dup = (existing ?? []).find((t) => nameKey(t.name) === nameKey(f.name!));
  if (dup) return { error: `"${dup.name}" artıq var. Yenisini yaratma: onu siyahıdan seçib Mədaxil yaz.` };
  // Yeni alət 0 sayla yaranır; miqdar Mədaxil sənədi kimi yazılır və təsdiqlənəndə depoya düşür
  const { quantity, ...fields } = f;
  const { data: created, error } = await supabase.from("tools").insert({ ...fields, name: f.name!, quantity: 0 }).select("id").single();
  if (error || !created) return toolError(error ?? { code: "", message: "Əlavə olunmadı." });
  if (quantity > 0) {
    const res = await createReceipt(created.id, quantity, text(formData, "supplier"), text(formData, "note"), formData.get("file") as File | null);
    if (res?.error) return { error: `Əlavə olundu, amma mədaxil yazılmadı: ${res.error}` };
  }
  revalidate();
  return { ok: true };
}

// Redaktə: say formada yoxdur (say yalnız sənədlərlə dəyişir)
export async function updateTool(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const f = toolFields(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const fields: Partial<typeof f> = { ...f };
  delete fields.quantity;
  const { error } = await createClient().from("tools").update({ ...fields, name: f.name! }).eq("id", id);
  if (error) return toolError(error);
  revalidate();
  return { ok: true };
}

// Ustalarda olan alət silinmir (baza bloklayır): səbəbi tostla göstərilir
export async function deleteTool(id: number, kind: "tool" | "material" = "tool") {
  const { error } = await createClient().from("tools").delete().eq("id", id);
  if (error) {
    toast.error(error.message);
    return;
  }
  toast.success(kind === "material" ? "Material silindi" : "Alət silindi");
  revalidate();
}
