import { text } from "@/lib/form-state";
import { revalidate } from "@/lib/revalidate";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import type { FormState } from "@/types/shared";

// Xəta kodları (yalnız admin yazır, RLS). Sahələr: model (ac_models), kod (code), açıqlama (title), edilecək iş (solution).
// Təkrar yoxlaması bazadadır: eyni modeldə eyni kod ikinci dəfə yazılmır.
function fieldsOf(formData: FormData) {
  return {
    model_id: Number(formData.get("model_id") || 0),
    code: text(formData, "code") ?? "",
    title: text(formData, "title") ?? "",
    solution: text(formData, "solution"),
  };
}

function checkFields(f: ReturnType<typeof fieldsOf>): string | null {
  if (!f.model_id) return "Modeli seç.";
  if (!f.code) return "Xəta kodu vacibdir.";
  if (!f.title) return "Açıqlama vacibdir.";
  return null;
}

const codeDup = "Bu modeldə bu kodla xəta artıq var.";

export async function addErrorCode(_prev: FormState, formData: FormData): Promise<FormState> {
  const f = fieldsOf(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const { error } = await createClient().from("ac_error_codes").insert(f);
  if (error) return { error: error.code === "23505" ? codeDup : error.message };
  revalidate();
  return { ok: true };
}

export async function updateErrorCode(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const f = fieldsOf(formData);
  const invalid = checkFields(f);
  if (invalid) return { error: invalid };
  const { error } = await createClient().from("ac_error_codes").update(f).eq("id", id);
  if (error) return { error: error.code === "23505" ? codeDup : error.message };
  revalidate();
  return { ok: true };
}

export async function deleteErrorCode(id: number) {
  const { error } = await createClient().from("ac_error_codes").delete().eq("id", id);
  if (error) {
    toast.error(error.message);
    return;
  }
  revalidate();
  toast.success("Xəta kodu silindi");
}
